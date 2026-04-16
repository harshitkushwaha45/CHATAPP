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
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedUser?._id === chat._id
              ? "bg-cyan-500/20 ring-1 ring-cyan-400/50"
              : "bg-cyan-500/10 hover:bg-cyan-500/20"
          }`}
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate flex-1">{chat.fullName}</h4>
            {chat.unreadCount > 0 && (
              <span className="min-w-6 h-6 px-2 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
