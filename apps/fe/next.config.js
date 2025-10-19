/** @type {import(next).NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
);

module.exports = withNextIntl({
  reactStrictMode: true
});
