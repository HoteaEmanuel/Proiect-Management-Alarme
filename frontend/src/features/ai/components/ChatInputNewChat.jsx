import React, { useCallback, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaArrowUp, FaRegStopCircle } from "react-icons/fa";
import { MdKeyboardVoice } from "react-icons/md";
// import LoadingCircle from "../../../components/LoadingCircle";
import { toast } from "sonner";
import Tooltip from "@components/ToolTip";
import FileList from "./FileList";
import Button from "@components/Button";
import "@styles/features/ai/components/ChatInput.css";
import {
  stopRequest,
  useCreateConversation,
  useDeleteConversation,
} from "../api/chatBot.api";
import useAuthStore from "@store/authStore";
import useVoiceToText from "../hooks/useVoiceToText";
import useChatStore from "@store/chatStore";
import { useNavigate } from "react-router-dom";

const MESSAGE_LIMIT = 5000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatInputNewChat = ({ placeholder }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const input = useRef();
  const [isEmpty, setIsEmpty] = useState(true);
  const fileInput = useRef();
  const [files, setFiles] = useState([]);
  const requests = useChatStore((state) => state.requests);
  const stopActiveRequest = useChatStore((state) => state.stopActiveRequest);
  const addActiveRequest = useChatStore((state) => state.addActiveRequest);
  const deleteRequest = useChatStore((state) => state.deleteRequest);

  const { recording, start, stop, clear, isSpeaking } = useVoiceToText();
  const { mutateAsync: sendMessage, isPending } = useCreateConversation();
  const { mutateAsync: deleteChat } = useDeleteConversation();

  const onSubmit = async () => {
    try {
      if (isPending) return;
      const filesToSend = files.map((item) => item.file);
      const filesPreserveStatus = files.map((item) => item.persist);
      const newRequestId = crypto.randomUUID();
      addActiveRequest({
        conversationId: "new conversation",
        requestId: newRequestId,
      });
      const mesaj = {
        user_id: user.user_id,
        message: input.current.value.trim(),
        files: filesToSend,
        file_preserve_flags: filesPreserveStatus,
        request_id: newRequestId,
      };

      setFiles([]);
      // setMessage("");
      clear();
      input.current.value = "";

      const result = await sendMessage(mesaj);
      const requestStatus = useChatStore
        .getState()
        .requests.get("new conversation")?.status;
      if (requestStatus === "stopping") {
        await deleteChat(result?.conversation_id);
      }
      if (requestStatus !== "stopping" && result?.conversation_id) {
        return navigate(`/chat/${result.conversation_id}`);
      }
    } catch (e) {
      if (e?.response?.status !== 429) {
        toast.error(e?.message || "Could not send message");
      }
    } finally {
      deleteRequest("new conversation");
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

  const handleStart = useCallback(() => {
    start((text) => {
      input.current.value = text;
      setIsEmpty(text.trim().length === 0);
      resizeInput(input.current);
    });
  }, [start]);

  const stopResponse = async () => {
    try {
      const requestId = requests.get("new conversation")?.requestId;
      if (!requestId) throw new Error("Invalid request");
      stopActiveRequest("new conversation");
      stopRequest(requestId);
    } catch (error) {
      toast.error(error?.message || "Request can not be stopped");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (isPending) return;

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

  const isLoading = requests.get("new conversation")?.status === "loading";

  return (
    <div className={`chat-input ${isLoading && "chat-input-active"}`}>
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
          placeholder={isLoading ? "Thinking..." : placeholder}
          ref={input}
          rows={1}
          maxLength={MESSAGE_LIMIT}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          className="chat-input-textarea"
        />

        <div className="chat-input-actions-right">
          {!recording && isEmpty ? (
            <Tooltip text={"Dictate"}>
              <Button className="chat-input-icon-button" onClick={handleStart}>
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

          {!isLoading && (
            <Button
              className="chat-input-send-button"
              onClick={onSubmit}
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
  );
};

export default ChatInputNewChat;
