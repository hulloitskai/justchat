import { init } from "@sentry/nextjs";

import { SENTRY_DSN } from "./consts";

init({ dsn: SENTRY_DSN, tracesSampleRate: 0 });
