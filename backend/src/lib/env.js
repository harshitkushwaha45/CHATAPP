import "dotenv/config";

const LOCAL_CLIENT_URL = "http://localhost:5173";
const PRODUCTION_CLIENT_URL = "https://chatapp-1-z8w7.onrender.com";
const configuredClientUrl = process.env.CLIENT_URL?.trim();

const resolvedClientUrl =
  process.env.NODE_ENV === "production" &&
  (!configuredClientUrl || configuredClientUrl.includes("localhost"))
    ? PRODUCTION_CLIENT_URL
    : configuredClientUrl || LOCAL_CLIENT_URL;

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: resolvedClientUrl,
  CLIENT_URLS: [...new Set([resolvedClientUrl, LOCAL_CLIENT_URL, PRODUCTION_CLIENT_URL])],
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,
};
