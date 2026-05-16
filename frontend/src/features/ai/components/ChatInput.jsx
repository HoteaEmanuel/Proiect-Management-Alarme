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
import useChatStore from "@store/chatStore.js";
import useVoiceToText from "../hooks/useVoiceToText.js";
import useAuthStore from "@store/authStore.js";
import { api } from "@lib/axios";
import "@styles/features/ai/components/ChatInput.css";

const VITE_URL_APP = import.meta.env.VITE_API_URL;

const MESSAGE_LIMIT = 10000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatInput = ({ placeholder, chatEnd }) => {
  const input = useRef();
  const fileInput = useRef();

  const {
    message,
    setMessage,
    isAwaitingResponse,
    setIsAwaiting,
    conversation,
    addMessage,
  } = useChatStore();

  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const { user } = useAuthStore();
  const timeOutId=useRef();
  const { recording, start, stop, clear, transcript, isSpeaking } =
    useVoiceToText();

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

  const handleSubmit = async () => {
    if (isAwaitingResponse) return;

    setIsAwaiting(true);
    try {
      addMessage({
        conversation_id: conversation.conversation_id,
        user_id: user._id,
        role: "user",
        has_sql_query: false,
        content: message,
        files: files,
      });

      const filesToSend = files.map((item) => item.file);
      const filesPreserveStatus = files.map((item) => item.persist);

      const mesaj = {
        user_id: user.user_id,
        conversation_id: conversation.conversation_id,
        message: message,
        files: filesToSend,
        file_preserve_flags: filesPreserveStatus,
      };

      const formData = new FormData();
      formData.append("message", mesaj.message);
      formData.append("new_chat", String(mesaj.new_chat ?? false));
      formData.append("conversation_id", conversation.conversation_id);

      mesaj.files.forEach((file) => {
        formData.append("files", file);
      });

      mesaj.file_preserve_flags.forEach((persist) => {
        formData.append("file_preserve_flags", String(persist === true));
      });

      setMessage("");
      setFiles([]);
      clear();

      timeOutId.current=setTimeout(() => {
        chatEnd.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      const response = await api.post(`${VITE_URL_APP}/api/chatbot`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });

      addMessage({ role: "assistant", blocks: response.data.blocks });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsAwaiting(false);
    }

    return ()=>clearTimeout(timeOutId.current);
  };

  const handleInput = (e) => {
    const inputSize = e.target.value.length;

    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
      return;
    }

    resizeInput(e.target);
  };

  const handleOnChange = (e) => {
    const inputSize = e.target.value.length;

    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
      return;
    }

    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (isAwaitingResponse) return;

      handleSubmit();
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
          onChange={handleOnChange}
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
              onClick={handleSubmit}
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

export default ChatInput;
