import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const handleRequestError = (error, fallbackMessage = "Something went wrong") => {
  if (error.response?.status === 401) {
    useAuthStore.getState().clearAuth({
      notify: true,
      message: "Your session is not available. Please log in again.",
    });
    return;
  }

  toast.error(error.response?.data?.message || fallbackMessage);
};

const applyDeletedMessageState = (message, authUserId) => {
  if (!message || !message.deletedForEveryone) return message;

  return {
    ...message,
    text: "",
    image: "",
    video: "",
    audio: "",
    seen: false,
    seenAt: null,
    deletedLabel:
      message.senderId === authUserId ? "You deleted this message" : "This message was deleted",
  };
};

const normalizeMessage = (message, authUserId) => applyDeletedMessageState(message, authUserId);

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isSelectedUserTyping: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) =>
    set((state) => ({
      selectedUser,
      isSelectedUserTyping: false,
      chats: state.chats.map((chat) =>
        chat._id === selectedUser?._id ? { ...chat, unreadCount: 0 } : chat
      ),
    })),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      handleRequestError(error, "Unable to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      handleRequestError(error, "Unable to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isSelectedUserTyping: false });
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const authUserId = useAuthStore.getState().authUser?._id;
      const normalizedMessages = res.data.map((message) => normalizeMessage(message, authUserId));
      set({ messages: normalizedMessages });

      const hasUnseenIncomingMessages = normalizedMessages.some(
        (message) => message.senderId === userId && !message.seen && !message.deletedForEveryone
      );

      if (hasUnseenIncomingMessages) {
        await get().markMessagesAsSeen(userId, { silent: true });
      }
    } catch (error) {
      handleRequestError(error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    get().stopTyping();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      video: messageData.video,
      audio: messageData.audio,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const normalizedMessage = normalizeMessage(res.data, authUser._id);
      set((state) => ({
        chats: state.chats.some((chat) => chat._id === selectedUser._id)
          ? state.chats
          : [{ ...selectedUser, unreadCount: 0 }, ...state.chats],
        messages: state.messages
          .filter((message) => message._id !== tempId)
          .concat(normalizedMessage),
      }));
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      handleRequestError(error);
    }
  },

  deleteMessageForEveryone: async (messageId) => {
    try {
      const authUserId = useAuthStore.getState().authUser?._id;
      const res = await axiosInstance.patch(`/messages/delete-for-everyone/${messageId}`);
      const deletedMessage = applyDeletedMessageState(res.data, authUserId);

      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? deletedMessage : message
        ),
      }));

      toast.success("Message deleted for everyone");
    } catch (error) {
      handleRequestError(error, "Unable to delete message");
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const authUserId = useAuthStore.getState().authUser?._id;
      const res = await axiosInstance.patch(`/messages/edit/${messageId}`, { text });
      const updatedMessage = normalizeMessage(res.data, authUserId);

      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? updatedMessage : message
        ),
      }));

      toast.success("Message updated");
    } catch (error) {
      handleRequestError(error, "Unable to edit message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageUpdated");
    socket.off("messagesSeen");
    socket.off("typing:start");
    socket.off("typing:stop");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats, allContacts } = get();
      const authUserId = useAuthStore.getState().authUser?._id;
      const normalizedMessage = normalizeMessage(newMessage, authUserId);
      const isIncomingMessage = newMessage.receiverId === authUserId;
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser?._id;
      const partnerId = isIncomingMessage ? newMessage.senderId : newMessage.receiverId;

      const existingChat = chats.find((chat) => chat._id === partnerId);
      const fallbackContact = allContacts.find((contact) => contact._id === partnerId);

      if (!existingChat && fallbackContact) {
        set((state) => ({
          chats: [{ ...fallbackContact, unreadCount: isIncomingMessage ? 1 : 0 }, ...state.chats],
        }));
      } else if (existingChat) {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat._id !== partnerId) return chat;

            const unreadCount =
              isIncomingMessage && partnerId !== selectedUser?._id
                ? (chat.unreadCount || 0) + 1
                : partnerId === selectedUser?._id
                  ? 0
                  : chat.unreadCount || 0;

            return { ...chat, unreadCount };
          }),
        }));
      }

      if (!isMessageSentFromSelectedUser) {
        if (isIncomingMessage && isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3");

          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
        return;
      }

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, normalizedMessage], isSelectedUserTyping: false });
      get().markMessagesAsSeen(newMessage.senderId, { silent: true });
    });

    socket.on("messageDeleted", (deletedMessage) => {
      const authUserId = useAuthStore.getState().authUser?._id;
      const normalizedDeletedMessage = applyDeletedMessageState(deletedMessage, authUserId);

      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === deletedMessage._id ? normalizedDeletedMessage : message
        ),
        chats: state.chats.map((chat) => {
          if (chat._id !== deletedMessage.senderId) return chat;

          const nextUnreadCount =
            deletedMessage.receiverId === authUserId &&
            deletedMessage.wasUnreadForReceiver &&
            (chat.unreadCount || 0) > 0
              ? chat.unreadCount - 1
              : chat.unreadCount || 0;

          return { ...chat, unreadCount: nextUnreadCount };
        }),
      }));
    });

    socket.on("messageUpdated", (updatedMessage) => {
      const authUserId = useAuthStore.getState().authUser?._id;
      const normalizedMessage = normalizeMessage(updatedMessage, authUserId);

      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === updatedMessage._id ? normalizedMessage : message
        ),
      }));
    });

    socket.on("messagesSeen", ({ byUserId, seenMessageIds, seenAt }) => {
      if (byUserId !== get().selectedUser?._id) return;

      set((state) => ({
        messages: state.messages.map((message) =>
          seenMessageIds.includes(message._id)
            ? { ...message, seen: true, seenAt }
            : message
        ),
      }));
    });

    socket.on("typing:start", ({ senderId }) => {
      if (senderId !== get().selectedUser?._id) return;
      set({ isSelectedUserTyping: true });
    });

    socket.on("typing:stop", ({ senderId }) => {
      if (senderId !== get().selectedUser?._id) return;
      set({ isSelectedUserTyping: false });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageUpdated");
    socket.off("messagesSeen");
    socket.off("typing:start");
    socket.off("typing:stop");
    set({ isSelectedUserTyping: false });
  },

  markMessagesAsSeen: async (userId, { silent = false } = {}) => {
    try {
      const res = await axiosInstance.patch(`/messages/seen/${userId}`);
      const seenMessageIds = res.data?.seenMessageIds || [];
      const seenAt = res.data?.seenAt;

      if (seenMessageIds.length === 0) return;

      set((state) => ({
        messages: state.messages.map((message) =>
          seenMessageIds.includes(message._id)
            ? { ...message, seen: true, seenAt }
            : message
        ),
        chats: state.chats.map((chat) =>
          chat._id === userId ? { ...chat, unreadCount: 0 } : chat
        ),
      }));
    } catch (error) {
      if (!silent) {
        handleRequestError(error, "Unable to mark messages as seen");
      }
    }
  },

  startTyping: () => {
    const socket = useAuthStore.getState().socket;
    const selectedUserId = get().selectedUser?._id;

    if (!socket || !selectedUserId) return;

    socket.emit("typing:start", { receiverId: selectedUserId });
  },

  stopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const selectedUserId = get().selectedUser?._id;

    if (!socket || !selectedUserId) return;

    socket.emit("typing:stop", { receiverId: selectedUserId });
  },
}));
