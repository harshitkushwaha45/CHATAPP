import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();
  const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket) return undefined;

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <main className="relative z-10 flex h-[calc(100vh-2rem)] min-h-[640px] w-full max-w-[1480px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(59,76,113,0.12)] max-md:flex-col">
      <aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white md:w-[360px] xl:w-[400px]">
        <ProfileHeader />
        <ActiveTabSwitch />

        <div className="flex-1 space-y-2 overflow-y-auto bg-white px-3 py-4">
          {activeTab === "chats" ? <ChatsList /> : <ContactList />}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f9fd]">
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </section>
    </main>
  );
}
export default ChatPage;
