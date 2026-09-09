/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
);
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const supabaseHost = 'fzejqetlgfckydwpywdv.supabase.co';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
let apiOrigin = '';
try { apiOrigin = new URL(apiUrl).origin; } catch {}

/*
  Analytics has to be named in `connect-src` or the browser refuses every event, and
  refuses it silently as far as the app is concerned -- the first version of this shipped
  the client, the events, and a CSP that dropped all of them.

  Derived from the same variable the client reads, so pointing analytics somewhere else
  (a local sink, an EU region, a reverse proxy) needs one env change and not two. Only
  `connect-src`: `posthog-js` is bundled from node_modules, and the one thing that would
  need `script-src` -- the remote-config script it fetches for feature flags and surveys
  -- is turned off in `lib/analytics.ts`.
*/
let analyticsOrigin = '';
try {
  analyticsOrigin = process.env.NEXT_PUBLIC_POSTHOG_KEY
    ? new URL(process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').origin
    : '';
} catch {}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://storage.googleapis.com https://${supabaseHost} https://*.tile.openstreetmap.org https://*.googleusercontent.com`,
      `connect-src 'self' ${apiOrigin} ${analyticsOrigin} https://${supabaseHost} https://*.supabase.co https://*.tile.openstreetmap.org`,
      "worker-src blob:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

module.exports = (phase) => withBundleAnalyzer(withNextIntl({
  // A production build must not overwrite chunks used by a running dev server.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/uxpilot-auth.appspot.com/**',
      },
      {
        protocol: 'https',
        hostname: supabaseHost,
        port: '',
        pathname: '/storage/**',
      },
      // OSM seed rows point at Commons. Anything outside this list falls back to a
      // plain <img> in CafeCardImage rather than throwing inside next/image.
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        port: '',
        pathname: '/wiki/Special:FilePath/**',
      },
    ],
    minimumCacheTTL: 2592000,
  },
}));
