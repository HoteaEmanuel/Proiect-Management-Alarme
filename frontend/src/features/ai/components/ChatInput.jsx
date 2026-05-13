import React, { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import { MdKeyboardVoice } from "react-icons/md";
import { FaMicrophoneSlash } from "react-icons/fa";
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
const VITE_URL_APP = import.meta.env.VITE_API_URL;

// Constants
const MESSAGE_LIMIT = 10000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // FILE MAXIMUM SIZE

const ChatInput = ({ placeholder, chatEnd }) => {
  const input = useRef();

  const {
    message,
    setMessage,
    isAwaitingResponse,
    setIsAwaiting,
    conversation,
    addMessage,
  } = useChatStore();
  const [files, setFiles] = useState([]);
  const { user } = useAuthStore();

  const { recording, start, stop, clear, transcript, isSpeaking } =
    useVoiceToText();

  // De fiecare data cand se inregistreaza ceva actualizez mesajul din input
  useEffect(() => {
    if (recording && transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

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
      //   handleScrollDown();
      setTimeout(() => {
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
  };

  const [previewFile, setPreviewFile] = useState(null);

  const fileInput = useRef();
  const handleInput = (e) => {
    const inputSize = e.target.value.length;
    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
      return;
    }
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";

    // Daca elementul are inaltimea mai mare decat MAX_HEIGHT atunci ii adaugam scroll ( overflow y auto)
    if (el.scrollHeight > MAX_HEIGHT) {
      el.style.height = MAX_HEIGHT + "px";
      el.classList.add("overflow-y-auto");
      el.classList.remove("overflow-hidden");
    } else {
      el.classList.add("overflow-hidden");
      el.classList.remove("overflow-y-auto");
    }
  };

  const handleOnChange = (e) => {
    const inputSize = e.target.value.length;
    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
      return;
    }

    setMessage(e.target.value);
  };
  // Schimba inaltimea inputului programatic, in cazul inregistrarii
  useEffect(() => {
    const el = input.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";

    if (el.scrollHeight > MAX_HEIGHT) {
      el.style.height = MAX_HEIGHT + "px";
      el.classList.add("overflow-y-auto");
      el.classList.remove("overflow-hidden");
    } else {
      el.classList.add("overflow-hidden");
      el.classList.remove("overflow-y-auto");
    }
  }, [message]);

  const handleKeyDown = (e) => {
    // Daca se apasa enter, fara shift atunci se da submit la message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isAwaitingResponse) return;
      handleSubmit();
      input.current.value = "";
      input.current.style.height = "auto"; // Resetez inaltimea

      return;
    }
  };

  const handleFilesUpload = async (e) => {
    console.log("AICI");
    console.log(e);

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

    // Salvez fisierele temporale, cele valide, care nu depasesc marimea maxima
    const tempFiles = valid.map((file) => ({
      file: file,
      url: URL.createObjectURL(file),
      persist: false,
    }));
    // Actualizez fisierele, le pastrez doar pe cele cu nume unic
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.file.name));
      const unique = tempFiles.filter((f) => !existingNames.has(f.file.name));
      return [...prev, ...unique];
    });
  };

  return (
    <div className="w-full flex flex-col rounded-md border border-gray-800 bg-background gap-2  px-3 pt-3 pb-2">
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
        className="w-full resize-none overflow-y-auto bg-transparent outline-none max-h-32"
      />
      <div className="flex items-center justify-between">
        <input
          type="file"
          ref={fileInput}
          onChange={handleFilesUpload}
          className="hidden"
          multiple="yes"
          accept=".pdf,.xlsx,.csv"
        />
        <Tooltip text={"Add files"}>
          <Button onClick={() => fileInput.current.click()}>
            <IoAdd className="size-4 hover:bg-gray-800 rounded-full cursor-pointer" />
          </Button>
        </Tooltip>

        <div className="flex items-center gap-2">
          {!recording && message === "" ? (
            <Tooltip text={"Dictate"}>
              <Button
                className="cursor-pointer hover:scale-105"
                onClick={start}
              >
                <MdKeyboardVoice className="size-5" />
              </Button>
            </Tooltip>
          ) : (
            recording && (
              <Tooltip text={"Stop recording"}>
                <Button
                  className={`cursor-pointer flex justify-center items-center rounded-full transition-all duration-300
  ${
    isSpeaking
      ? "shadow-[0_0_10px_2px_rgba(59,130,246,0.5)] border-2 border-gray-900  scale-110"
      : "hover:scale-105"
  }`}
                  onClick={stop}
                >
                  {/* <span className="text-xs">Recording...</span> */}
                  <MdKeyboardVoice
                    className={`size-5 transition-transform duration-150 ${isSpeaking ? "scale-120" : "scale-100"}`}
                  />
                </Button>
              </Tooltip>
            )
          )}

          {!isAwaitingResponse && (
            <Button
              onClick={handleSubmit}
              disabled={message.length === 0 && files.length === 0}
            >
              <FaArrowUp className="size-8 cursor-pointer hover:scale-105 bg-gray-900 p-2 rounded-2xl border border-blue-950" />
            </Button>
          )}

          {isAwaitingResponse && <LoadingCircle />}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
