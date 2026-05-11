import { useRef, useState } from "react";
const VITE_ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_KEY;
const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);

  const speak = async (text) => {
    if (!text) return;

    try {
      setSpeaking(true);

      // stop previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
        {
          method: "POST",
          headers: {
            "xi-api-key": VITE_ELEVENLABS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        },
      );

      if (!response.ok) {
        const err = await response.text();
        console.error(err);
        throw new Error("TTS failed");
      }

      const blob = await response.blob();

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
      console.error("Speech error:", err);
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
