const { withSentryConfig } = require("@sentry/nextjs");

const JUSTCHAT_VERSION = process.env.npm_package_version;
const { JUSTCHAT_API_URL, JUSTCHAT_API_PUBLIC_URL } = process.env;

const {
  SENTRY_URL,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_DSN,
  SENTRY_AUTH_TOKEN,
} = process.env;

/** @type {import('next').NextConfig} */
const config = {
  publicRuntimeConfig: {
    JUSTCHAT_VERSION,
    JUSTCHAT_API_PUBLIC_URL,
    SENTRY_DSN,
  },
  serverRuntimeConfig: {
    JUSTCHAT_VERSION,
    JUSTCHAT_API_URL,
    SENTRY_DSN,
  },
};

if (!!SENTRY_URL && !!SENTRY_ORG && !!SENTRY_PROJECT && !!SENTRY_AUTH_TOKEN) {
  const { npm_package_name: packageName } = process.env;
  const { npm_package_name: packageVersion } = process.env;

  /** @type {import('@sentry/webpack-plugin').SentryCliPluginOptions} */
  const sentryOptions = {
    silent: true,
    release: `${packageName}@${packageVersion}`,
  };

  module.exports = withSentryConfig(config, sentryOptions);
} else {
  const missingVariables = Object.entries({
    SENTRY_URL,
    SENTRY_ORG,
    SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  console.warn(
    `[justchat-web] Missing environment variables (${missingVariables.join(
      ", ",
    )}) to upload sourcemaps to Sentry; skipping.`,
  );
  module.exports = config;
}
