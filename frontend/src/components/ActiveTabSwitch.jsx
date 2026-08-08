import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="grid h-16 grid-cols-2 border-b border-slate-200 bg-white px-3">
      <button
        onClick={() => setActiveTab("chats")}
        type="button"
        className={`relative flex items-center justify-center px-4 text-sm font-medium transition ${
          activeTab === "chats"
            ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t-full after:bg-indigo-500"
            : "text-slate-500 hover:text-blue-600"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        type="button"
        className={`relative flex items-center justify-center px-4 text-sm font-medium transition ${
          activeTab === "contacts"
            ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t-full after:bg-indigo-500"
            : "text-slate-500 hover:text-blue-600"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
