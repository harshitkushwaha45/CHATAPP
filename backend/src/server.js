import express from "express";
import cookieParser from "cookie-parser";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "../../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const shouldServeFrontend =
  ENV.NODE_ENV === "production" && existsSync(frontendIndexPath);

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body
app.use(
  cors({
    origin: ENV.CLIENT_URLS,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", message: "Chat backend is running" });
});

if (shouldServeFrontend) {
  app.use(express.static(frontendDistPath));

  app.get("*", (_, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (_, res) => {
    res.status(200).json({ status: "ok", message: "Chat backend is running" });
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
