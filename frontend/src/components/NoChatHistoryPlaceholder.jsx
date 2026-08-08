import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <MessageCircleIcon className="size-8 text-indigo-500" />
      </div>
      <h3 className="mb-3 text-lg font-medium text-[#111827]">
        Start your conversation with {name}
      </h3>
      <div className="mb-5 flex max-w-md flex-col space-y-3">
        <p className="text-sm text-slate-500">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        <div className="mx-auto h-px w-32 bg-slate-200"></div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button className="rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50">
          👋 Say Hello
        </button>
        <button className="rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50">
          🤝 How are you?
        </button>
        <button className="rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50">
          📅 Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
