import { useState, useRef } from "react";

const useVoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      stream.getTracks().forEach(t => t.stop()); // release mic
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const clear = () => setAudioBlob(null);

  return { recording, audioBlob, start, stop, clear };
};

export default useVoiceRecorder;