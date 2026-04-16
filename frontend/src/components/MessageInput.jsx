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
    <div className="p-4 border-t border-slate-700/50">
      {mediaPreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            {mediaType === "video" ? (
              <video src={mediaPreview} className="w-28 h-20 object-cover rounded-lg border border-slate-700" controls />
            ) : (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
              />
            )}
            <button
              onClick={removeMedia}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {audioPreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative rounded-lg border border-slate-700 bg-slate-800/70 p-3">
            <audio controls src={audioPreview} className="max-w-64" />
            <button
              onClick={removeAudio}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-4">
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
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
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
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${
            mediaPreview ? "text-cyan-500" : ""
          }`}
          title="Upload image or video"
        >
          {mediaType === "video" ? <VideoIcon className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
        </button>
        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`rounded-lg px-4 transition-colors ${
            isRecording
              ? "bg-red-500/20 text-red-400 hover:text-red-300"
              : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
          }`}
          title={isRecording ? "Stop recording" : "Record voice message"}
        >
          {isRecording ? <SquareIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !mediaPreview && !audioPreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
