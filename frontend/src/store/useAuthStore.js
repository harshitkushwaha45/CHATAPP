import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { clearStoredAuthToken, getStoredAuthToken, storeAuthToken } from "../lib/auth";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// ✅ FIX: replace "/" with your backend URL
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://chatapp-dqc5.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  clearAuth: ({ notify = false, message = "Session expired. Please log in again." } = {}) => {
    const hadAuthUser = Boolean(get().authUser);

    clearStoredAuthToken();
    get().disconnectSocket();
    set({ authUser: null, onlineUsers: [] });

    if (notify && hadAuthUser) {
      toast.error(message);
    }
  },

  checkAuth: async ({ showLoader = true, silent = true } = {}) => {
    if (showLoader) {
      set({ isCheckingAuth: true });
    }

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
      return res.data;
    } catch (error) {
      console.log("Error in authCheck:", error);
      get().clearAuth();

      if (!silent) {
        toast.error(error.response?.data?.message || "Unable to verify your session");
      }

      return null;
    } finally {
      if (showLoader) {
        set({ isCheckingAuth: false });
      }
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      storeAuthToken(res.data?.token);
      const authUser = await get().checkAuth({ showLoader: false, silent: true });

      if (!authUser) {
        toast.error("Account created, but the session could not be verified");
        return;
      }

      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      storeAuthToken(res.data?.token);
      const authUser = await get().checkAuth({ showLoader: false, silent: true });

      if (!authUser) {
        toast.error("Login succeeded, but the session could not be verified");
        return;
      }

      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().clearAuth();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    const token = getStoredAuthToken();

    // ✅ prevent duplicate connection
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      auth: token ? { token } : undefined,
      withCredentials: true,
      transports: ["websocket"], // ✅ important for Render
    });

    set({ socket });

    // ✅ connection log (helps debugging)
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // ❌ error handling
    socket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.off();
      socket.disconnect();
    }

    set({ socket: null });
  },
}));
