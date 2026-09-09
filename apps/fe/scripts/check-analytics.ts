import assert from 'node:assert';
import { routeShape, sanitizeEvent, sanitizeUrls, shapeUrl } from '../src/lib/analytics';

/*
  routeShape() decides what a pageview is allowed to say. Two ways it can be wrong, and
  both are silent: leave an id in and we hand a username or a share token to an analytics
  vendor; strip a segment too eagerly and every page collapses into one row.
*/

const cases: [string, string][] = [
  // The locale is dropped -- it travels as its own property.
  ['/en', '/'],
  ['/ko/', '/'],
  ['/en/community', '/community'],
  // Identifiers, in every shape they actually take here.
  ['/en/cafes/8f14e45f-ceea-467a-9c1e-1b2a3c4d5e6f', '/cafes/:id'],
  ['/ko/cafes/matter-of-taste-kitchener', '/cafes/:id'],
  ['/en/profile/chrischae', '/profile/:id'],
  ['/en/shared/abc123token', '/shared/:id'],
  ['/en/learn/coffee/pour-over', '/learn/coffee/:id'],
  // A page *under* an identifier keeps its own name; only the id is masked.
  ['/en/cafes/matter-of-taste/log', '/cafes/:id/log'],
  // The collection page itself is not an id.
  ['/en/cafes', '/cafes'],
  ['/en/profile', '/profile'],
];

for (const [input, expected] of cases) {
  assert.strictEqual(routeShape(input), expected, `${input} should shape to ${expected}`);
}

// Nothing that looks like an identifier survives in any of them.
for (const [input] of cases) {
  const shaped = routeShape(input);
  assert.ok(
    !/[0-9a-f]{8}-/.test(shaped) && !shaped.includes('chrischae') && !shaped.includes('abc123'),
    `${shaped} still carries an identifier`
  );
}

const ORIGIN = 'https://ibeanthere.app';

// Our own URLs are shaped; a query string never survives, because that is where the app
// passes a returnUrl carrying the very path being masked.
assert.strictEqual(shapeUrl(`${ORIGIN}/en/cafes/matter-of-taste`, ORIGIN), `${ORIGIN}/cafes/:id`);
assert.strictEqual(shapeUrl(`${ORIGIN}/en/profile/chrischae?tab=logs`, ORIGIN), `${ORIGIN}/profile/:id`);
assert.strictEqual(
  shapeUrl(`${ORIGIN}/en/signin?returnUrl=%2Fen%2Fprofile%2Fchrischae`, ORIGIN),
  `${ORIGIN}/signin`
);
// Somebody else's URL keeps its path -- its shape is not ours to guess -- and still
// loses the query.
assert.strictEqual(
  shapeUrl('https://www.google.com/search?q=kitchener+cafe', ORIGIN),
  'https://www.google.com/search'
);
// The first visit sends the string "$direct", which is not a URL.
assert.strictEqual(shapeUrl('$direct', ORIGIN), '$direct');

/* The reason this lives at the client and not at each call site: PostHog attaches the
   raw URL to every event, so an event nobody wrote a sanitiser for still carries it. */
const sanitized = sanitizeUrls(
  {
    $current_url: `${ORIGIN}/ko/cafes/holly-s-neighbourhood-cafe-bar`,
    $initial_current_url: `${ORIGIN}/en/shared/abc123token`,
    /* Not named `current_url`, and it carries the entry URL query and all. Matching on
       the exact names went out with a raw URL on every event until a sink caught it. */
    $session_entry_url: `${ORIGIN}/en/cafes/holly?returnUrl=%2Fen%2Fprofile%2Fchrischae`,
    $pathname: '/en/profile/chrischae',
    $referrer: '$direct',
    cafe_id: 'ab67dc50-774d-45a5-a633-7810c5ab1bce',
    mode: 'purchase',
  },
  ORIGIN
);

assert.strictEqual(sanitized.$current_url, `${ORIGIN}/cafes/:id`);
assert.strictEqual(sanitized.$initial_current_url, `${ORIGIN}/shared/:id`);
assert.strictEqual(sanitized.$session_entry_url, `${ORIGIN}/cafes/:id`);
assert.strictEqual(sanitized.$pathname, '/profile/:id');
assert.strictEqual(sanitized.$referrer, '$direct');
// The cafe uuid is the one identifier we mean to send, and sanitising must not eat it.
assert.strictEqual(sanitized.cafe_id, 'ab67dc50-774d-45a5-a633-7810c5ab1bce');
assert.strictEqual(sanitized.mode, 'purchase');

assert.ok(
  !JSON.stringify(sanitized).includes('chrischae') &&
    !JSON.stringify(sanitized).includes('abc123') &&
    !JSON.stringify(sanitized).includes('holly'),
  'a sanitised payload still names a person, a token, or a cafe by slug'
);

/*
  The hook as PostHog calls it, on a whole event rather than on one bag of properties.
  `$set_once` is a sibling of `properties`, not a key inside it, and PostHog fills it
  with the URL the session began at -- so sanitising `properties` alone let a share
  token and a returnUrl ride out on the first event of every session.
*/
// `sanitizeUrls` reads the origin off `location` when it is not given one, which is how
// the hook calls it in the browser.
(globalThis as { window?: unknown }).window = { location: { origin: ORIGIN } };

const event = sanitizeEvent({
  uuid: 'a3f1',
  event: '$pageview',
  properties: {
    $current_url: `${ORIGIN}/en/cafes/matter-of-taste`,
    locale: 'en',
  },
  $set: { $current_url: `${ORIGIN}/en/profile/chrischae` },
  $set_once: {
    $initial_current_url: `${ORIGIN}/en/shared/abc123token?returnUrl=%2Fen%2Fprofile%2Fchrischae`,
    $initial_pathname: '/en/profile/chrischae',
    $initial_referrer: 'https://www.google.com/search?q=chrischae+coffee',
  },
} as Parameters<typeof sanitizeEvent>[0])!;

assert.strictEqual(event.properties.$current_url, `${ORIGIN}/cafes/:id`);
assert.strictEqual(event.$set?.$current_url, `${ORIGIN}/profile/:id`);
assert.strictEqual(event.$set_once?.$initial_current_url, `${ORIGIN}/shared/:id`);
assert.strictEqual(event.$set_once?.$initial_pathname, '/profile/:id');
assert.strictEqual(event.$set_once?.$initial_referrer, 'https://www.google.com/search');
assert.strictEqual(event.properties.locale, 'en');

assert.ok(
  !JSON.stringify(event).includes('chrischae') &&
    !JSON.stringify(event).includes('abc123') &&
    !JSON.stringify(event).includes('matter-of-taste'),
  'a whole event still names a person, a token, or a cafe by slug'
);

console.log('analytics: all checks passed');
