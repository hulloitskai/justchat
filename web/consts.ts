import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const { JUSTCHAT_API_URL, JUSTCHAT_API_PUBLIC_URL } = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;
