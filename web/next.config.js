const { withSentryConfig } = require("@sentry/nextjs");

const JUSTCHAT_VERSION = process.env.npm_package_version;
const { JUSTCHAT_API_URL, JUSTCHAT_API_PUBLIC_URL } = process.env;
const { SENTRY_DSN } = process.env;

/** @type {import('next').NextConfig} */
const config = {
  productionBrowserSourceMaps: true,
  publicRuntimeConfig: {
    JUSTCHAT_VERSION,
    JUSTCHAT_API_PUBLIC_URL,
    SENTRY_DSN,
  },
  serverRuntimeConfig: {
    JUSTCHAT_VERSION,
    JUSTCHAT_API_URL,
  },
};

/** @type {import('@sentry/webpack-plugin').SentryCliPluginOptions} */
const sentryOptions = {
  silent: true,
  release: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
};

module.exports = withSentryConfig(config, sentryOptions);
