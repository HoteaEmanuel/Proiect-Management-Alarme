import React, { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import { MdKeyboardVoice } from "react-icons/md";
import LoadingCircle from "../../../components/LoadingCircle";
import { toast } from "sonner";
import Tooltip from "@components/ToolTip";
import FileList from "./FileList";
import Button from "@components/Button";
import "@styles/features/ai/components/ChatInput.css";
import { useCreateConversation } from "../api/chatBot.api";
import useAuthStore from "@store/authStore";
import useChatStore from "@store/chatStore";
import useVoiceToText from "../hooks/useVoiceToText";

const MESSAGE_LIMIT = 5000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatInputNewChat = ({ placeholder }) => {
  const { user } = useAuthStore();
  const input = useRef();
  const fileInput = useRef();
  const { message, setMessage } = useChatStore();
  const { isAwaitingResponse, setIsAwaiting } = useChatStore();
  const [files, setFiles] = useState([]);

  const { recording, start, stop, clear, transcript, isSpeaking } =
    useVoiceToText();
  const { mutateAsync: sendMessage, isPending } = useCreateConversation();

  const onSubmit = async () => {
    try {
      if (isPending) return;
      setIsAwaiting(true);
      const filesToSend = files.map((item) => item.file);
      const filesPreserveStatus = files.map((item) => item.persist);

      const mesaj = {
        user_id: user.user_id,
        message: message,
        files: filesToSend,
        file_preserve_flags: filesPreserveStatus,
      };

      setFiles([]);
      setMessage("");
      clear();

      await sendMessage(mesaj);
    } catch (e) {
      toast.error(e?.message || "Could not send message");
    } finally {
      setIsAwaiting(false);
    }
  };

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
    if (recording && transcript) {
      setMessage(transcript);
    }
  }, [recording, transcript, setMessage]);

  useEffect(() => {
    const element = input.current;

    if (!element) return;

    resizeInput(element);
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (isAwaitingResponse) return;

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

  return (
    <div className="chat-input">
      {files?.length > 0 && <FileList files={files} setFiles={setFiles} />}

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
            className="chat-input-icon-button chat-input-add-button"
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
              <Button className="chat-input-icon-button" onClick={start}>
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
                  onClick={stop}
                >
                  <MdKeyboardVoice className="chat-input-icon" />
                </Button>
              </Tooltip>
            )
          )}

          {!isAwaitingResponse && (
            <Button
              className="chat-input-send-button"
              onClick={onSubmit}
              disabled={message.length === 0 && files.length === 0}
            >
              <FaArrowUp className="chat-input-send-icon" />
            </Button>
          )}

          {isAwaitingResponse && <LoadingCircle />}
        </div>
      </div>
    </div>
  );
};

export default ChatInputNewChat;
