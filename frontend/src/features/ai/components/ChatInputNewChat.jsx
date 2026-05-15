import React, { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import { MdKeyboardVoice } from "react-icons/md";
import LoadingCircle from "../../../components/LoadingCircle";
import { toast } from "sonner";
import Tooltip from "@components/ToolTip";
import FilePreview from "./FilePreview";
import FileList from "./FileList";
import Button from "@components/Button";
import "@styles/features/ai/components/ChatInputNewChat.css";

const MESSAGE_LIMIT = 5000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatInputNewChat = ({
  onSubmit,
  message,
  files,
  disabled,
  loading,
  placeholder,
  setMessage,
  setFiles,
  startRecording,
  stopRecording,
  recording,
  isSpeaking,
}) => {
  const input = useRef();
  const fileInput = useRef();

  const [previewFile, setPreviewFile] = useState(null);

  const resizeInput = (element) => {
    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";

    if (element.scrollHeight > MAX_HEIGHT) {
      element.style.height = MAX_HEIGHT + "px";
      element.classList.add("chat-input-textarea-scrollable");
      return;
    }

    element.classList.remove("chat-input-textarea-scrollable");
  };

  const handleInput = (e) => {
    const inputSize = e.target.value.length;

    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
    }

    resizeInput(e.target);
  };

  useEffect(() => {
    const element = input.current;

    if (!element) return;

    resizeInput(element);
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (disabled || loading) return;

      onSubmit();
      input.current.value = "";
      input.current.style.height = "auto";
    }
  };

  const handleFilesUpload = async (e) => {
    const valid = [...e.target.files].filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `${file.name} is too large - Maximum ${MAX_FILE_SIZE}MB files allowed`,
        );
        return false;
      }

      return true;
    });

    if (files?.length + e.target.files.length > MAX_ALLOWED_FILES) {
      toast.error(`You can upload maximum ${MAX_ALLOWED_FILES} files`);
      return;
    }

    const tempFiles = valid.map((file) => ({
      file: file,
      url: URL.createObjectURL(file),
      persist: false,
    }));

    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.file.name));
      const unique = tempFiles.filter((f) => !existingNames.has(f.file.name));

      return [...prev, ...unique];
    });
  };

  const handleStartRecording = () => {
    if (!startRecording) return;

    startRecording();
  };

  const handleStopRecording = () => {
    if (!stopRecording) return;

    stopRecording();
  };

  return (
  <div className="chat-input">
    {files?.length > 0 && (
      <FileList
        files={files}
        setFiles={setFiles}
        setPreviewFile={setPreviewFile}
      />
    )}

    {previewFile && (
      <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
    )}

    <div className="chat-input-row">
      <input
        type="file"
        ref={fileInput}
        onChange={handleFilesUpload}
        className="chat-input-file"
        multiple="yes"
        accept=".pdf,.xlsx,.csv"
      />

      <Tooltip text={"Add files"}>
        <Button
          className="chat-input-icon-button"
          onClick={() => fileInput.current.click()}
        >
          <IoAdd className="chat-input-icon" />
        </Button>
      </Tooltip>

      <textarea
        placeholder={placeholder}
        value={message}
        ref={input}
        onChange={(e) => setMessage(e.target.value)}
        rows={1}
        maxLength={MESSAGE_LIMIT}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onChangeCapture={handleInput}
        className="chat-input-textarea"
      />

      <div className="chat-input-actions-right">
        {!recording && message === "" ? (
          <Tooltip text={"Dictate"}>
            <Button
              className="chat-input-icon-button"
              onClick={handleStartRecording}
            >
              <MdKeyboardVoice className="chat-input-icon" />
            </Button>
          </Tooltip>
        ) : (
          recording && (
            <Tooltip text={"Stop recording"}>
              <Button
                className={`chat-input-icon-button ${
                  isSpeaking ? "chat-input-icon-button-speaking" : ""
                }`}
                onClick={handleStopRecording}
              >
                <MdKeyboardVoice className="chat-input-icon" />
              </Button>
            </Tooltip>
          )
        )}

        {!loading && (
          <Button
            className="chat-input-send-button"
            onClick={onSubmit}
            disabled={message.length === 0 && files.length === 0}
          >
            <FaArrowUp className="chat-input-send-icon" />
          </Button>
        )}

        {loading && <LoadingCircle />}
      </div>
    </div>
  </div>
);
};

export default ChatInputNewChat;
