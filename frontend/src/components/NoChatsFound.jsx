import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <MessageCircleIcon className="h-8 w-8 text-indigo-500" />
      </div>
      <div>
        <h4 className="mb-1 font-medium text-[#111827]">No conversations yet</h4>
        <p className="px-6 text-sm text-slate-500">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
