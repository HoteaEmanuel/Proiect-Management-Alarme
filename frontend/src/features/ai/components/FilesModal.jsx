import React, { useRef, useState } from "react";
import { useGetConversationFiles } from "../api/chatBot.api";
import useChatStore from "@store/chatStore";
import { RiLoader2Fill } from "react-icons/ri";
import { FaRegFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { TbFilesOff } from "react-icons/tb";
import { CiCircleList, CiCircleRemove } from "react-icons/ci";
import Button from "@components/Button";
import FilePreview from "./FilePreview";

const FileIcon = ({ type }) => {
  console.log("TYPE");
  console.log(type);
  if (type.toLowerCase() === "pdf") return <FaFilePdf />;
  if (type.toLowerCase() === "xlsx") return <FaRegFileExcel />;
  if (type.toLowerCase() === "csv") return <FaFileCsv />;
  return <FaFile />;
};

const fileTypeColor = (fileType) => {
  console.log(fileType);
  const extension = fileType.toUpperCase();
  switch (extension) {
    case "PDF":
      return "bg-red-700";
    case "XLSX":
      return "bg-green-700";
    case "CSV":
      return "bg-gray-700";
    default:
      return "bg-gray-900";
  }
};

const FilesModal = ({ close }) => {
  const modalRef1 = useRef();
  console.log("FILES MODAL Active");

  const { conversation } = useChatStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const { data, isPending } = useGetConversationFiles(
    conversation.conversation_id,
  );
  if (isPending) return <RiLoader2Fill className="size-4 animate-spin" />;
  return (
    <div
      ref={modalRef1}
      className="fixed top-full right-0 z-50 w-1/6 h-screen rounded-xl overflow-hidden border border-white/10 "
      //   onMouseLeave={() => {
      //     showOptions(false);
      //     clear(null);
      //   }}
      //   onBlur={() => {
      //     console.log("BLURRRR");
      //     showOptions(false);
      //     clear(null);
      //   }}
    >
      <Button
        className="absolute right-1 cursor-pointer hover:scale-110"
        onClick={close}
      >
        <CiCircleRemove className="size-4" />
      </Button>
      {data.length === 0 && (
        <div className="flex flex-col h-1/2 items-center justify-between py-5">
          <h2 className="font-bold text-xl text-center">No files attached</h2>
          <div className="flex flex-col  items-center gap-4">
            <p className="opacity-80 text-xs">
              No files found - try to upload some
            </p>
            <TbFilesOff className="size-10 text-white/80" />
          </div>
        </div>
      )}
      {data.length > 0 && (
        <>
          <div className="rounded-t-xl bg-gray-900 p-1">
            <h2 className="font-bold text-lg text-center">Files attached</h2>
          </div>

          <ul className="flex flex-col gap-2 overflow-y-auto  pt-5 px-4">
            {data.map((file) => (
              <li
                key={file?.url}
                className="relative overflow-hidden flex flex-1 gap-2 hover:bg-gray-900 p-1 rounded-md cursor-pointer"
                onMouseOver={() => setSelectedFile(file.filename)}
                onMouseLeave={() => setSelectedFile(null)}
                onClick={() => setPreviewFile(file)}
              >
                <div
                  className={`flex rounded-md items-center px-1.5 ${fileTypeColor(file.filename.split(".").pop())}`}
                >
                  <FileIcon type={file.filename.split(".").pop()} />
                </div>

                <div className="flex flex-col gap-1 max-w-30">
                  <span className="font-semibold text-sm truncate">
                    {file.filename}
                  </span>
                  <span className="uppercase opacity-50 text-xs">
                    {file.filename.split(".").pop()}
                    {/* File extension */}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
};

export default FilesModal;
