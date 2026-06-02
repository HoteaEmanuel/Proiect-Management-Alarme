import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaArrowUp, FaRegStopCircle, FaStop } from "react-icons/fa";
import { MdKeyboardVoice } from "react-icons/md";
import { toast } from "sonner";
import Tooltip from "@components/ToolTip";
import FileList from "./FileList";
import Button from "@components/Button";
import useChatStore from "@store/chatStore.js";
import useVoiceToText from "../hooks/useVoiceToText.js";
import useAuthStore from "@store/authStore.js";
import { api } from "@lib/axios";
import "@styles/features/ai/components/ChatInput.css";
import axios from "axios";
import { stopRequest } from "../api/chatBot.api";

const VITE_URL_APP = import.meta.env.VITE_API_URL;

const MESSAGE_LIMIT = 10000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatInput = ({ placeholder, chatEnd }) => {
  console.log("CHAT INPUT RENDERED");
  const input = useRef();
  const fileInput = useRef();
  const [isEmpty, setIsEmpty] = useState(true);
  const { message, conversation, addMessage, addActiveRequest, deleteRequest } =
    useChatStore();

  const requests = useChatStore((state) => state.requests);
  const stopActiveRequest = useChatStore((state) => state.stopActiveRequest);

  const [files, setFiles] = useState([]);
  const { user } = useAuthStore();
  const timeOutId = useRef();
  const { recording, start, stop, clear, isSpeaking } = useVoiceToText();

  useEffect(() => {
    input.current.value = "";
    setIsEmpty(true);
    resizeInput(input.current);
  }, [conversation]);

  useEffect(() => {
    input.current.value = "";
    setIsEmpty(true);
    resizeInput(input.current);
  }, [conversation]);
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

  const handleStart = useCallback(() => {
    start((text) => {
      input.current.value = text;
      setIsEmpty(text.trim().length === 0);
      resizeInput(input.current);
    });
  }, [start]);

  const handleInput = useCallback(() => {
    const inputSize = input.current.value.trim().length;
    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
      return;
    }
    const empty = inputSize === 0;
    setIsEmpty((prev) => (prev === empty ? prev : empty));
    resizeInput(input.current);
  }, []);

  useEffect(() => {
    const element = input.current;
    if (!element) return;
    input.current.value = message;
    setIsEmpty(message.trim().length === 0);
    resizeInput(element);
  }, [message]);

  const handleSubmit = async () => {
    if (requests.has(conversation?.conversation_id)) return;
    try {
      addMessage({
        conversation_id: conversation.conversation_id,
        user_id: user._id,
        role: "user",
        has_sql_query: false,
        content: input.current.value.trim(),
        files: files,
      });

      const filesToSend = files.map((item) => item.file);
      const filesPreserveStatus = files.map((item) => item.persist);

      const mesaj = {
        user_id: user.user_id,
        conversation_id: conversation.conversation_id,
        message: input.current.value.trim(),
        files: filesToSend,
        file_preserve_flags: filesPreserveStatus,
      };

      const formData = new FormData();
      formData.append("message", mesaj.message);
      formData.append("new_chat", String(mesaj.new_chat ?? false));
      formData.append("conversation_id", conversation.conversation_id);
      const newRequestId = crypto.randomUUID();
      formData.append("request_id", newRequestId);

      mesaj.files.forEach((file) => {
        formData.append("files", file);
      });

      mesaj.file_preserve_flags.forEach((persist) => {
        formData.append("file_preserve_flags", String(persist === true));
      });

      setFiles([]);
      clear();
      input.current.value = "";
      setIsEmpty(true);

      timeOutId.current = setTimeout(() => {
        chatEnd.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      addActiveRequest({
        conversationId: conversation?.conversation_id,
        requestId: newRequestId,
      });

      const response = await api.post(`${VITE_URL_APP}/api/chatbot`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });

      deleteRequest(conversation?.conversation_id);
      addMessage({
        role: "assistant",
        blocks: response.data.blocks,
        smart_replies: response.data.smart_replies,
        is_stopped: response.data?.is_stopped,
        files: response.data?.files,
      });
    } catch (e) {
      if (axios.Cancel(e) || e?.name === "CanceledError") return;
      toast.error(e.message);
    }

    return () => clearTimeout(timeOutId.current);
  };

  const stopResponse = async () => {
    try {
      const requestId = requests.get(conversation?.conversation_id)?.requestId;
      if (!requestId) throw new Error("Invalid request");
      stopActiveRequest(conversation?.conversation_id);
      stopRequest(requestId);
    } catch (error) {
      toast.error(error?.message || "Request can not be stopped");
    }
  };

  const handleOnChange = (e) => {
    const inputSize = e.target.value.length;
    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
      return;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (requests.has(conversation?.conversation_id)) return;
      handleSubmit();
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
  const reqStatus = requests.get(conversation?.conversation_id)?.status;
  const isLoading = reqStatus === "loading";

  const isStopped = reqStatus === "stopping";

  return (
    <div className={`chat-input ${isLoading && "chat-input-active"}`}>
      {/* <div></div> */}
      <div className="chat-input-inner">
        {files?.length > 0 && <FileList files={files} setFiles={setFiles} />}
        <div className="chat-input-row">
          <input
            type="file"
            ref={fileInput}
            onChange={handleFilesUpload}
            className="chat-input-file"
            multiple="yes"
            accept=".pdf,.xlsx,.csv,.docx"
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
            ref={input}
            onChange={handleOnChange}
            rows={1}
            maxLength={MESSAGE_LIMIT}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className="chat-input-textarea"
          />

          <div className="chat-input-actions-right">
            {!recording && isEmpty ? (
              <Tooltip text={"Dictate"}>
                <Button
                  className="chat-input-icon-button"
                  onClick={handleStart}
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
                    onClick={stop}
                  >
                    <MdKeyboardVoice className="chat-input-icon" />
                  </Button>
                </Tooltip>
              )
            )}

            {!isLoading && !isStopped && (
              <Button
                className="chat-input-send-button"
                onClick={handleSubmit}
                disabled={isEmpty && files.length === 0}
              >
                <FaArrowUp className="chat-input-send-icon" />
              </Button>
            )}

            {isLoading && (
              <Tooltip text={"Stop"}>
                <Button
                  className="cursor-pointer hover:scale-105"
                  onClick={stopResponse}
                >
                  <FaRegStopCircle className="size-5" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
