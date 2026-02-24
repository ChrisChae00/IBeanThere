/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(withNextIntl({
  reactStrictMode: true,
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
        hostname: 'fzejqetlgfckydwpywdv.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
    minimumCacheTTL: 2592000,
  },
}));
