import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const { JUSTCHAT_API_URL } = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;
