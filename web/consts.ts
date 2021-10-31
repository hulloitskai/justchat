import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const {
  JUSTCHAT_VERSION,
  JUSTCHAT_API_URL,
  JUSTCHAT_API_PUBLIC_URL,
  SENTRY_DSN,
} = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;
