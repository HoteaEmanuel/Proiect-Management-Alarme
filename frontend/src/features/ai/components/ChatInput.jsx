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

// Constants
const MESSAGE_LIMIT = 5000;
const MAX_HEIGHT = 200;
const MAX_ALLOWED_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // FILE MAXIMUM SIZE

const ChatInput = ({
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
  console.log("IS SPEAKING ");
  console.log(isSpeaking);
  const input = useRef();

  const [previewFile, setPreviewFile] = useState(null);

  const fileInput = useRef();
  const handleInput = (e) => {
    const inputSize = e.target.value.length;
    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
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
      if (disabled) return;
      onSubmit();
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
      // public_id: crypto.randomUUID(),
      // filename: file.name,
      file: file,
      // preview: URL.createObjectURL(file),
      // resource_type: "",
      // file_format: file.type,
      // file_size: file.bytes,
      // status: "uploading", // fisierele urmeaza sa fie uploadate, statusul e uploading
      url: URL.createObjectURL(file),
      persist: false,
    }));
    // Actualizez fisierele, le pastrez doar pe cele cu nume unic
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = tempFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });

    // // Upload to cloudinary
    // console.log(tempFiles);
    // const uploaded = await Promise.all(
    //   tempFiles.map((file) => uploadFile(file.file)),
    // );
    // console.log("BATMAN");
    // console.log(uploaded);

    // Actualizarea cu datele de la cloudinary, folositor pentru afisarea ulterioara in conversatie
    // setFiles((prev) =>
    //   prev.map((f) => {
    //     const tempIndex = tempFiles.findIndex(
    //       (t) => t.public_id === f.public_id,
    //     );
    //     if (tempIndex === -1) return f;
    //     return {
    //       ...f,
    //       filename: uploaded[tempIndex]?.filename,
    //       url: uploaded[tempIndex]?.url,
    //       public_id: uploaded[tempIndex]?.public_id,
    //       resource_type: uploaded[tempIndex]?.resource_type,
    //       file_format: uploaded[tempIndex]?.format,
    //       file_size: uploaded[tempIndex]?.bytes,
    //       status: "uploaded",
    //     };
    //   }),
    // );
    // console.log("UPDATED FILES");
    // console.log(files);
  };

  return (
    <div className="w-full flex flex-col rounded-md border border-gray-800 bg-background gap-2 px-3 pt-3 pb-2">
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
        onChange={(e) => setMessage(e.target.value)}
        rows={1}
        maxLength={MESSAGE_LIMIT}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onChangeCapture={handleInput}
        className="w-full resize-none overflow-y-auto bg-transparent outline-none max-h-32"
      />
      {/* {audioBlob && (
        <div
          className="flex justify-center"
        >
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            className="h-8"
          />
        </div>
      )} */}
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
                onClick={startRecording}
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
                  onClick={stopRecording}
                >
                  {/* <span className="text-xs">Recording...</span> */}
                  <MdKeyboardVoice
                    className={`size-5 transition-transform duration-150 ${isSpeaking ? "scale-120" : "scale-100"}`}
                  />
                </Button>
              </Tooltip>
            )
          )}

          {!loading && (
            <Button
              onClick={onSubmit}
              disabled={message.length === 0 && files.length === 0}
            >
              <FaArrowUp className="size-8 cursor-pointer hover:scale-105 bg-gray-900 p-2 rounded-2xl border border-blue-950" />
            </Button>
          )}

          {loading && <LoadingCircle />}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
