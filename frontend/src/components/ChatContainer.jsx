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
      <div className="chat-conversation-surface flex-1 overflow-y-auto px-6 py-7 md:px-8 xl:px-10">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="mx-auto flex max-w-none flex-col gap-5">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === authUser._id;

              return (
              <div
                key={msg._id}
                className={`group flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[min(76%,22rem)] rounded-xl px-5 py-4 ${
                    isOwnMessage
                      ? "rounded-br-md bg-[linear-gradient(135deg,#3b82f6_0%,#7c5cff_100%)] text-white shadow-[0_10px_22px_rgba(59,130,246,0.18)]"
                      : "rounded-bl-md border border-slate-200 bg-white text-[#111827] shadow-sm"
                  }`}
                >
                  {isOwnMessage && !msg.deletedForEveryone && !msg.isOptimistic && (
                    <div className="pointer-events-none absolute right-3 -top-12 flex translate-y-2 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 opacity-0 shadow-md transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100">
                      {!msg.image && !msg.video && !msg.audio && (
                        <button
                          type="button"
                          onClick={() => handleEditMessage(msg)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit message"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete for everyone"
                      >
                        <Trash2Icon className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {msg.deletedForEveryone ? (
                    <p className="italic opacity-80">{msg.deletedLabel}</p>
                  ) : (
                    <>
                      {msg.image && (
                        <img src={msg.image} alt="Shared" className="mb-2 h-48 rounded-xl object-cover" />
                      )}
                      {msg.video && (
                        <video
                          src={msg.video}
                          controls
                          className="mb-2 max-h-72 w-full rounded-xl bg-black"
                        />
                      )}
                      {msg.audio && (
                        <audio src={msg.audio} controls className="mt-2 max-w-full" />
                      )}
                      {msg.text && <p className="break-words text-sm font-semibold leading-relaxed">{msg.text}</p>}
                    </>
                  )}
                  <p
                    className={`mt-2 flex items-center gap-3 text-xs font-normal ${
                      isOwnMessage ? "text-white/85" : "text-slate-600"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.edited && !msg.deletedForEveryone && <span className="ml-2">(edited)</span>}
                    {isOwnMessage && !msg.isOptimistic && !msg.deletedForEveryone && (
                      <span className="ml-2">{msg.seen ? "Seen" : "Sent"}</span>
                    )}
                  </p>
                </div>
              </div>
              );
            })}
            {/* scroll target */}
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
