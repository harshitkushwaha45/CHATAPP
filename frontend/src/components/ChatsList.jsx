import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const isSelected = selectedUser?._id === chat._id;

        return (
        <button
          key={chat._id}
          className={`flex h-[72px] w-full items-center gap-3 rounded-lg border px-3 text-left transition-colors ${
            isSelected
              ? "border-indigo-100 bg-[#f1f5ff]"
              : "border-transparent bg-transparent hover:border-slate-100 hover:bg-[#f8faff]"
          }`}
          onClick={() => setSelectedUser(chat)}
          type="button"
          aria-pressed={isSelected}
        >
          <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
            <div className="size-12 rounded-full">
              <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
            </div>
          </div>
          <h4 className="min-w-0 flex-1 truncate text-base font-medium text-[#111827]">
            {chat.fullName}
          </h4>
          {chat.unreadCount > 0 && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm">
              {chat.unreadCount}
            </span>
          )}
        </button>
        );
      })}
    </>
  );
}
export default ChatsList;
