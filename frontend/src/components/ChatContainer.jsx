import { useEffect, useRef } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    deleteMessageForEveryone,
    editMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDeleteMessage = (messageId) => {
    const confirmed = window.confirm("Delete this message for everyone?");
    if (!confirmed) return;

    deleteMessageForEveryone(messageId);
  };

  const handleEditMessage = (message) => {
    const nextText = window.prompt("Edit your message", message.text || "");
    if (nextText === null) return;

    const trimmedText = nextText.trim();
    if (!trimmedText || trimmedText === message.text) return;

    editMessage(message._id, trimmedText);
  };

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 xl:px-10 overflow-y-auto py-8 xl:py-10">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat group ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white shadow-[0_18px_40px_rgba(6,182,212,0.18)]"
                      : "bg-slate-800 text-slate-200 shadow-[0_18px_36px_rgba(15,23,42,0.38)]"
                  }`}
                >
                  {msg.senderId === authUser._id && !msg.deletedForEveryone && !msg.isOptimistic && (
                    <div className="absolute right-3 -top-12 flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/90 px-2 py-1 opacity-0 translate-y-2 pointer-events-none transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 focus-within:pointer-events-auto">
                      {!msg.image && !msg.video && !msg.audio && (
                        <button
                          type="button"
                          onClick={() => handleEditMessage(msg)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-cyan-500/15 hover:text-cyan-300"
                          title="Edit message"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-red-500/15 hover:text-red-300"
                        title="Delete for everyone"
                      >
                        <Trash2Icon className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {msg.deletedForEveryone ? (
                    <p className="mt-1 italic opacity-80">{msg.deletedLabel}</p>
                  ) : (
                    <>
                      {msg.image && (
                        <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                      )}
                      {msg.video && (
                        <video
                          src={msg.video}
                          controls
                          className="rounded-lg max-h-72 w-full bg-black"
                        />
                      )}
                      {msg.audio && (
                        <audio src={msg.audio} controls className="mt-2 max-w-full" />
                      )}
                      {msg.text && <p className="mt-2 break-words leading-relaxed">{msg.text}</p>}
                    </>
                  )}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.edited && !msg.deletedForEveryone && <span className="ml-2">(edited)</span>}
                    {msg.senderId === authUser._id &&
                      !msg.isOptimistic &&
                      !msg.deletedForEveryone && (
                      <span className="ml-2">{msg.seen ? "Seen" : "Sent"}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
