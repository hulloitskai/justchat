import type { NextApiHandler, PageConfig } from "next";
import { createProxyMiddleware } from "http-proxy-middleware";

import { JUSTCHAT_API_URL } from "consts";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const proxyMiddleware = createProxyMiddleware({
  target: JUSTCHAT_API_URL,
  pathRewrite: {
    "^/api": "",
  },
  changeOrigin: true,
  ws: true,
  logLevel: "error",
});

const handler: NextApiHandler = (req, res) => {
  if (!JUSTCHAT_API_URL) {
    console.info(
      "[justchat-web] Missing API server URL; proxying is disabled.",
    );
    res.status(404).write(null);
    return;
  }

  return new Promise((resolve, reject) => {
    console.log("in a promise");
    proxyMiddleware(req as any, res as any, result => {
      console.log("nextt", result);
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });
};

export default handler;
