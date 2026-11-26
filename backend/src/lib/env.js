import "dotenv/config";

const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, "");

const parseConfiguredOrigins = (...values) =>
  values
    .flatMap((value) => (value ? value.split(",") : []))
    .map(normalizeOrigin)
    .filter(Boolean);

const LOCAL_CLIENT_URL = "http://localhost:5173";
const PRODUCTION_CLIENT_URL = "https://chatapp-1-z8w7.onrender.com";
const configuredClientUrls = parseConfiguredOrigins(
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS
);

const resolvedClientUrl =
  process.env.NODE_ENV === "production" &&
  (!configuredClientUrls[0] || configuredClientUrls[0].includes("localhost"))
    ? PRODUCTION_CLIENT_URL
    : configuredClientUrls[0] || LOCAL_CLIENT_URL;

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i,
  /^https:\/\/chatapp(?:-[a-z0-9-]+)*\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+-harshitkushwaha45s-projects\.vercel\.app$/i,
];

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: resolvedClientUrl,
  CLIENT_URLS: [
    ...new Set([
      resolvedClientUrl,
      ...configuredClientUrls,
      LOCAL_CLIENT_URL,
      PRODUCTION_CLIENT_URL,
    ]),
  ],
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,
};

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  return (
    ENV.CLIENT_URLS.includes(normalized) ||
    ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(normalized))
  );
};

export const corsOriginCallback = (origin, callback) => {
  callback(null, isAllowedOrigin(origin));
};
