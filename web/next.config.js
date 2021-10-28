const { JUSTCHAT_API_URL, JUSTCHAT_API_PUBLIC_URL } = process.env;
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env;
const { GCP_API_KEY } = process.env;

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  productionBrowserSourceMaps: true,
  publicRuntimeConfig: {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    GCP_API_KEY,
    JUSTCHAT_API_PUBLIC_URL,
  },
  serverRuntimeConfig: {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    GCP_API_KEY,
    JUSTCHAT_API_URL,
  },
};

module.exports = config;
