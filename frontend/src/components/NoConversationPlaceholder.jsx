import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#f7f9fd] p-8 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <MessageCircleIcon className="size-10 text-indigo-500" />
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-[#111827]">Select a conversation</h3>
      <p className="max-w-md text-slate-500">
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
