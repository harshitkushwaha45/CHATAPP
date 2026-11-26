import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URLS,
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// Map to track user's active sockets: userId -> Set<socketId> (supports multi-tab & multi-device)
const userSocketMap = new Map();

// Returns socket ID(s) for a given userId
export function getReceiverSocketId(userId) {
  if (!userId) return null;
  const sockets = userSocketMap.get(userId.toString());
  if (!sockets || sockets.size === 0) return null;
  return Array.from(sockets);
}

io.on("connection", (socket) => {
  const userId = socket.userId;
  if (!userId) return;

  const isFirstConnectionForUser = !userSocketMap.has(userId) || userSocketMap.get(userId).size === 0;

  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);

  // Automatically join personal room for multi-device/multi-tab delivery
  socket.join(userId);

  // Only broadcast online user list when a user transitions from offline to online
  if (isFirstConnectionForUser) {
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  } else {
    // Deliver current list directly to newly opened tab
    socket.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  }

  // with socket.on we listen for events from clients
  socket.on("typing:start", ({ receiverId } = {}) => {
    if (!receiverId || receiverId === userId) return;

    const receiverSocketIds = getReceiverSocketId(receiverId);
    if (!receiverSocketIds) return;

    io.to(receiverSocketIds).emit("typing:start", {
      senderId: userId,
    });
  });

  socket.on("typing:stop", ({ receiverId } = {}) => {
    if (!receiverId || receiverId === userId) return;

    const receiverSocketIds = getReceiverSocketId(receiverId);
    if (!receiverSocketIds) return;

    io.to(receiverSocketIds).emit("typing:stop", {
      senderId: userId,
    });
  });

  socket.on("disconnect", () => {
    const userSockets = userSocketMap.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        userSocketMap.delete(userId);
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      }
    }
  });
});

export { io, app, server };
