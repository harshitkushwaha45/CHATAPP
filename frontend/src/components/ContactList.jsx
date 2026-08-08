import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, selectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => {
        const isSelected = selectedUser?._id === contact._id;

        return (
        <button
          key={contact._id}
          className={`flex h-[72px] w-full items-center gap-3 rounded-lg border px-3 text-left transition-colors ${
            isSelected
              ? "border-indigo-100 bg-[#f1f5ff]"
              : "border-transparent bg-transparent hover:border-slate-100 hover:bg-[#f8faff]"
          }`}
          onClick={() => setSelectedUser(contact)}
          type="button"
          aria-pressed={isSelected}
        >
          <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
            <div className="size-12 rounded-full">
              <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
            </div>
          </div>
          <h4 className="min-w-0 flex-1 truncate text-base font-medium text-[#111827]">
            {contact.fullName}
          </h4>
        </button>
        );
      })}
    </>
  );
}
export default ContactList;
