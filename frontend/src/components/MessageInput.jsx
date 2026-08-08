import { useEffect, useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, MicIcon, SendIcon, SquareIcon, VideoIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const { sendMessage, isSoundEnabled, startTyping, stopTyping, selectedUser } = useChatStore();

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const scheduleTypingStop = () => {
    clearTypingTimeout();
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1500);
  };

  useEffect(() => {
    return () => {
      clearTypingTimeout();
      stopTyping();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopTyping]);

  useEffect(() => {
    clearTypingTimeout();
    stopTyping();
    setText("");
    setMediaPreview(null);
    setMediaType(null);
    setAudioPreview(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedUser, stopTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaPreview && !audioPreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();
    clearTypingTimeout();
    stopTyping();

    sendMessage({
      text: text.trim(),
      image: mediaType === "image" ? mediaPreview : null,
      video: mediaType === "video" ? mediaPreview : null,
      audio: audioPreview,
    });
    setText("");
    setMediaPreview(null);
    setMediaType(null);
    setAudioPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    setAudioPreview(null);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");

    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAudio = () => {
    setAudioPreview(null);
  };

  const toggleVoiceRecording = async () => {
    if (!window.MediaRecorder) {
      toast.error("Voice recording is not supported in this browser");
      return;
    }

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();

        reader.onloadend = () => {
          setMediaPreview(null);
          setMediaType(null);
          setAudioPreview(reader.result);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.log("Voice recording failed:", error);
      toast.error("Microphone access is required for voice recording");
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-6 py-4 xl:px-8">
      {mediaPreview && (
        <div className="mx-auto mb-3 flex max-w-none items-center">
          <div className="relative">
            {mediaType === "video" ? (
              <video src={mediaPreview} className="h-20 w-28 rounded-xl border border-slate-200 object-cover" controls />
            ) : (
              <img
                src={mediaPreview}
                alt="Preview"
                className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
              />
            )}
            <button
              onClick={removeMedia}
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {audioPreview && (
        <div className="mx-auto mb-3 flex max-w-none items-center">
          <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <audio controls src={audioPreview} className="max-w-64" />
            <button
              onClick={removeAudio}
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="mx-auto flex max-w-none gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const nextValue = e.target.value;
            setText(nextValue);
            isSoundEnabled && playRandomKeyStrokeSound();

            if (nextValue.trim()) {
              startTyping();
              scheduleTypingStop();
              return;
            }

            clearTypingTimeout();
            stopTyping();
          }}
          onBlur={() => {
            clearTypingTimeout();
            stopTyping();
          }}
className="chat-message-input h-14 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-[15px] font-normal text-[#111827] shadow-sm placeholder:text-slate-500 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-50"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          onChange={handleMediaChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-[#f8faff] text-blue-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 ${
            mediaPreview ? "text-blue-600" : ""
          }`}
          title="Upload image or video"
        >
          {mediaType === "video" ? <VideoIcon className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
        </button>
        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
            isRecording
              ? "border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
              : "border border-slate-200 bg-[#f8faff] text-blue-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50"
          }`}
          title={isRecording ? "Stop recording" : "Record voice message"}
        >
          {isRecording ? <SquareIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !mediaPreview && !audioPreview}
          className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3b82f6_0%,#7c5cff_100%)] text-white shadow-[0_8px_18px_rgba(59,130,246,0.20)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
