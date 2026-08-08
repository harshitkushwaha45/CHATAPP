import { useState, useRef } from "react";
import { LogOutIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="flex h-[106px] items-center border-b border-slate-200 bg-white px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="group relative size-12 overflow-hidden rounded-full ring-4 ring-[#eef4ff]"
              onClick={() => fileInputRef.current.click()}
              type="button"
              title="Change profile photo"
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="max-w-[128px] truncate text-base font-medium text-[#111827] xl:max-w-[150px]">
              {authUser.fullName}
            </h3>

            <p className="text-sm font-medium text-emerald-600">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            className={`flex size-10 items-center justify-center rounded-lg border shadow-sm transition-colors ${
              isSoundEnabled
                ? "border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            type="button"
            title={isSoundEnabled ? "Typing sound on" : "Typing sound off"}
            aria-label={isSoundEnabled ? "Turn typing sound off" : "Turn typing sound on"}
            aria-pressed={isSoundEnabled}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>

          <button
            className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            onClick={logout}
            type="button"
            title="Log out"
          >
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
