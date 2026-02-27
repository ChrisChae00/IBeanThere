/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const supabaseHost = 'fzejqetlgfckydwpywdv.supabase.co';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
let apiOrigin = '';
try { apiOrigin = new URL(apiUrl).origin; } catch {}

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
      `img-src 'self' data: blob: https://storage.googleapis.com https://${supabaseHost}`,
      `connect-src 'self' ${apiOrigin} https://${supabaseHost} https://*.supabase.co`,
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

module.exports = withBundleAnalyzer(withNextIntl({
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
    ],
    minimumCacheTTL: 2592000,
  },
}));
