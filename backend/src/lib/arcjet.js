import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

import { ENV } from "./env.js";

const aj = ENV.ARCJET_KEY
  ? arcjet({
      key: ENV.ARCJET_KEY,
      rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: "LIVE" }),
        // Create a bot detection rule
        detectBot({
          mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
          // Block all bots except the following
          allow: [
            "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
          ],
        }),
        // Sliding window rate limit configured to allow healthy concurrent chat traffic
        slidingWindow({
          mode: "LIVE",
          max: 1000, // 1000 requests per minute to easily support 100+ concurrent active users
          interval: 60,
        }),
      ],
    })
  : null;

export default aj;
