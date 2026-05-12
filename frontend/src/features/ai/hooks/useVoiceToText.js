import { useState, useRef } from "react";
import { toast } from "sonner";
// hook pentru voice to text
const useVoiceToText = () => {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);

  const start = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("The browser does not support SpeechRecognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ro-RO";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);

      setIsSpeaking(true);
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => setIsSpeaking(false), 1500);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    clearTimeout(silenceTimer.current);
    setRecording(false);
    setIsSpeaking(false);
  };

  const clear = () => setTranscript("");

  return { transcript, recording, isSpeaking, start, stop, clear };
};

export default useVoiceToText;
