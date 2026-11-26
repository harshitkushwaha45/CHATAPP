import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // ✅ 1. Try to get token from socket auth (BEST WAY)
    let token = socket.handshake.auth?.token;

    // ✅ 2. Fallback: get token from cookies (if exists)
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie
        .split("; ")
        .reduce((acc, cookie) => {
          const [key, value] = cookie.split("=");
          acc[key] = value;
          return acc;
        }, {});

      token = cookies.jwt;
    }

    // ❌ No token
    if (!token) {
      console.log("❌ Socket rejected: No token provided");
      return next(new Error("Unauthorized - No Token"));
    }

    // ✅ 3. Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (!decoded?.userId) {
      console.log("❌ Invalid token payload");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // Attach user identifier to socket without blocking MongoDB query on every handshake
    socket.userId = decoded.userId.toString();
    socket.user = { _id: decoded.userId };

    next();
  } catch (error) {
    console.log("❌ Socket auth error:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};