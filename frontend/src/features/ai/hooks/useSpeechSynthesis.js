import { useRef, useState } from "react";
import { useReadChatResponse } from "../api/chatBot.api";
import { toast } from "sonner";
const VITE_ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_KEY;
const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);
  const { mutateAsync: readResponse } = useReadChatResponse();

  const speak = async (text) => {
    if (!text) return;

    try {
      setSpeaking(true);

      // stop previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const response = await readResponse({ text });
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      // console.error("Speech error:", err);
      toast.error(err?.message || "Reading failed");
      setSpeaking(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setSpeaking(false);
  };

  return {
    speak,
    stop,
    speaking,
  };
};

export default useSpeechSynthesis;
