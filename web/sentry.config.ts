import { init } from "@sentry/nextjs";
import { CaptureConsole } from "@sentry/integrations";

import { SENTRY_DSN } from "consts";

init({
  dsn: SENTRY_DSN,
  integrations: [new CaptureConsole({ levels: ["error"] })],
  tracesSampleRate: 0,
});
