# Analytics

Three events and a pageview, to answer the four-week question in
`docs/product/direction.md`: of the people who had a chance to come back, did the app
pick where they went, did they return on their own, did they look at what they wrote.
A fourth, `learn_cta_clicked`, measures one thing about the coffee guide: whether its
readers go on to the map.

Everything lives in `apps/fe/src/lib/analytics.ts` and one mounted component,
`components/providers/AnalyticsWatcher.tsx`. No backend involvement: the events are about
what a reader did, and the backend only sees what they saved.

## The vocabulary

| Event | Fired when | Properties |
|---|---|---|
| `$pageview` | The App Router path changes | `locale` |
| `cafe_detail_opened` | A cafe page renders | `cafe_id` |
| `cafe_action_taken` | The Maps link or a directions app is chosen | `cafe_id`, `action` |
| `coffee_log_saved` | `createLog` returns successfully | `cafe_id`, `mode` |
| `learn_cta_clicked` | The coffee guide's map prompt is pressed | `cta` (`cafe`, `beans`), `page` (`guide`, `drink`) |

`cafe_id` is always the uuid, never the slug. The same cafe is reachable under both, and
two names for one place is how "opened it, then took the directions" stops being visible
as one sequence.

A new event is a product decision, not a convenience: `AnalyticsEvent` is a closed
union, so adding one is an edit to this module. An event nobody agreed to collect is the
one that turns up in a dashboard six months later with nobody able to say what it counts.

### Reading the coffee guide (2026-09-11)

The guide's funnel is three steps, each a separate row and none of them a visit:
`$pageview` on `/learn/coffee` or `/learn/coffee/:id`, then `learn_cta_clicked`, then a
`$pageview` on `/discover/explore-map` and, sometimes, `cafe_detail_opened` or
`coffee_log_saved` in the same session. Which drink a reader was on does not travel -- the
slug is masked in the path and left out of the event, as above -- so the event says whether
the guide leads to the map, not which page does it best.

Three numbers that are easy to conflate and must not be:

- **Search impressions and clicks** live in Search Console and Bing Webmaster Tools, not
  here.
- **Visits referred by an AI product** are `$pageview`s whose `$referrer` is that product's
  origin (for example `chatgpt.com`, `perplexity.ai`). Only the origin and path survive;
  the `utm_source` some of them append is dropped with every other query string. A
  product that sends no referrer is counted as direct.
- **Being cited by an AI answer** is not measured at all. A citation nobody clicks leaves
  no trace on this site, so it is never inferred from referrers.

**A directions click is not a visit.** The direction doc says so outright, and nothing
here should be read as attendance.

## Nothing is stored on the reader's device

`persistence: 'memory'`. No cookie, no `localStorage`, no `sessionStorage` — verified on
the wire and in the page: no `ph_*` cookie is set and no analytics request carries a
`Cookie` header. So there is no consent banner to show, nothing to clear, and nothing to
disclose beyond the privacy policy's Analytics section.

The cost is real and is stated in the direction doc: an anonymous visitor is a new person
on every visit, so **return is only measurable for someone signed in**. Every number
about coming back is a number about logged-in people, and reading it as "our visitors"
would overstate it.

### Why the identity is bootstrapped, not `identify()`d

`AnalyticsWatcher` waits for the session to resolve, then calls `start(userId)` once, and
`init` receives `bootstrap: { distinctID: userId, isIdentifiedID: true }`.

Calling `identify()` on each load instead is what PostHog warns about in the console:
with memory persistence it mints a fresh anonymous id on every page load, so each
`identify` merges another id onto the same person until they cross the distinct-id limit
— at which point their events stop appearing on person pages at all. Bootstrapping the
account id gives a signed-in reader one stable id across visits with nothing stored on
their device, which is exactly what this configuration was chosen for.

`identify()` remains for the one transition that happens mid-page: signing in, or signing
out (which resets to a new anonymous id, so the next person at that browser does not
inherit the last one's history).

## No URL leaves the browser unshaped

PostHog attaches `$current_url`, `$pathname`, `$session_entry_url` and friends to **every**
event, so being careful in the pageview call is not enough. A `before_send` hook runs
`sanitizeUrls` over every event instead:

- Our own URLs keep the *shape* of the page and lose the identity: `/en/cafes/matter-of-taste`
  and `/ko/cafes/<uuid>` both become `/cafes/:id`. Without this, every cafe is its own
  URL and "how many cafe pages were opened" has no total.
- **Query strings go entirely.** They are how the rest of the app passes a `returnUrl`,
  which carries the very path being masked.
- A username, a share token and a learn-article slug travel nowhere. None of them is ours
  to hand to an analytics vendor. The cafe uuid still travels, as a property, where it can
  be counted or ignored on purpose.
- An external referrer keeps its path — its shape is not ours to guess — and still loses
  its query.
- `property_denylist: ['title']`. On a cafe page the title is its name and street
  address; on a profile page it is somebody's username.

Keys are matched by suffix (`/(url|referrer)$/i`), not by name. An earlier version matched
`current_url` exactly and sailed straight past `$session_entry_url`, which carries the
whole entry URL including its query.

**The hook shapes `properties`, `$set` and `$set_once`.** The last two are *siblings* of
`properties` on the event, not keys inside it, and PostHog fills `$set_once` with the URL,
path and referrer the session began at. Sanitising `properties` alone therefore looked
clean while every session's first event still carried its entry URL whole — a share token,
a username, a `returnUrl` — under `$initial_current_url`. The deprecated
`sanitize_properties` was handed those bags explicitly; `before_send` has to reach for them.

`scripts/check-analytics.ts` pins all of this, running a whole event through the exported
hook rather than a copy of it: `npx tsx scripts/check-analytics.ts`.

## The page an event names is the page it happened on

PostHog reads `location` and the clock when an event is *sent*. With the queue below,
sent is not when it happened: a pageview raised on `/my-logs` while the session was still
resolving flushes once the module lands, by which point the reader has moved on, and it
arrives stamped with the page they moved to. Every queued event on a first load named the
wrong page — and "did they look back at what they wrote" is exactly the reading that loses.

So `send` stamps `$current_url`, `$pathname` and `timestamp` at the call site. Properties
passed to `capture` win over the ones PostHog collects for itself, and they are shaped by
`before_send` like any other. `$session_entry_url` and the `$initial_*` properties are
deliberately left to PostHog: they describe the session, not the event, and do not change
while one sits in the queue.

## Cost of the client

`posthog-js` is imported at runtime, not built in. Imported normally it lands in the
layout's chunk — 285KB of parsed JavaScript on every page in the app, more than everything
else the layout loads put together, to answer three questions. So `start()` fetches the
module after mount and only when a key is configured, and calls arriving before it lands
wait in a capped queue.

`advanced_disable_flags: true` skips the remote-config request PostHog otherwise makes on
every load for feature flags, surveys and web vitals. We use none of them, and what gets
collected should be decided in this repository rather than in a dashboard. It also means
no external script is fetched, so `script-src` needs no analytics entry.

## Configuration

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | Absent, every function in `analytics.ts` does nothing and the module is never fetched. This is the default for local development. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Defaults to `https://us.i.posthog.com`. |

**The CSP has to name the host, or the browser drops every event.** `next.config.js`
derives the `connect-src` entry from the same two variables, so pointing analytics at an
EU region, a reverse proxy or a local sink is one env change and not two. The first
version of this shipped the client, the events, and a CSP that blocked all of them —
silently, as far as the app was concerned.

## Verified end to end

Against a local sink standing in for PostHog, signed in:

- `$pageview` with `locale` in both languages, `cafe_detail_opened`, and
  `cafe_action_taken` with `action: 'directions'` all arrive.
- `distinct_id` is the account uuid and is stable across page loads.
- The shaped path arrives on every event; a `returnUrl` carrying a username does not.
  No raw slug appears in any of the 47 properties PostHog sends.
- `init` runs once, and the events queued before the module landed are flushed, each
  naming the page it was raised on rather than the page current when the queue drained.

`coffee_log_saved` was not exercised on the wire — doing so writes a real coffee log to
production. Its call sits immediately after a successful `createLog`.
