import React, { useRef, useState } from "react";
import { useGetConversationFiles } from "../api/chatBot.api";
import useChatStore from "@store/chatStore";
import { RiLoader2Fill } from "react-icons/ri";
import { FaRegFileExcel, FaFilePdf, FaFileCsv, FaFile } from "react-icons/fa";
import { TbFilesOff } from "react-icons/tb";
import { CiCircleList, CiCircleRemove, CiFileOff } from "react-icons/ci";
import Button from "@components/Button";
import FilePreview from "./FilePreview";

import "@styles/features/ai/components/FilesModal.css";

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
      return "files-modal-type-pdf";
    case "XLSX":
      return "files-modal-type-xlsx";
    case "CSV":
      return "files-modal-type-csv";
    default:
      return "files-modal-type-default";
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

  if (isPending) return <RiLoader2Fill className="files-modal-loader" />;

  return (
    <div ref={modalRef1} className="files-modal">
      <Button className="files-modal-close-button" onClick={close}>
        <CiCircleRemove className="files-modal-close-icon" />
      </Button>

      {data.user_files === 0 && data.assistant_files === 0 && (
        <div className="files-modal-empty">
          <h2 className="files-modal-empty-title">No files attached</h2>
          <div className="files-modal-empty-content">
            <p className="files-modal-empty-text">
              No files found - try to upload some
            </p>
            <TbFilesOff className="files-modal-empty-icon" />
          </div>
        </div>
      )}
      { /* Verificare in caz de siguranta  */}
      {data.user_files.length === 0 && data.assistant_files.length === 0 && (
        <div className="files-modal-header">
          <p className="font-semibold">No files found</p>
          <CiFileOff className="size-4"/>
        </div>
      )}
      {(data.user_files.length > 0 || data.assistant_files.length > 0) && (
        <>
          <div className="files-modal-header">
            <h2 className="files-modal-title">Chat Files</h2>
          </div>

          <ul className="files-modal-list">
            {data?.user_files?.length > 0 && (
              <>
                <p>Your files</p>
                {data.user_files.map((file) => (
                  <li
                    key={file?.url}
                    className="files-modal-item"
                    onMouseOver={() => setSelectedFile(file.filename)}
                    onMouseLeave={() => setSelectedFile(null)}
                    onClick={() => setPreviewFile(file)}
                  >
                    <div
                      className={`files-modal-type ${fileTypeColor(file.filename.split(".").pop())}`}
                    >
                      <FileIcon type={file.filename.split(".").pop()} />
                    </div>

                    <div className="files-modal-file-content">
                      <span className="files-modal-file-name">
                        {file.filename}
                      </span>
                      <span className="files-modal-file-extension">
                        {file.filename.split(".").pop()}
                        {/* File extension */}
                      </span>
                    </div>
                  </li>
                ))}
              </>
            )}
            {data?.assistant_files.length > 0 && (
              <>
                <p>Assistant generated files</p>
                {data.assistant_files.map((file) => (
                  <li
                    key={file?.url}
                    className="files-modal-item"
                    onMouseOver={() => setSelectedFile(file.filename)}
                    onMouseLeave={() => setSelectedFile(null)}
                    onClick={() => setPreviewFile(file)}
                  >
                    <div
                      className={`files-modal-type ${fileTypeColor(file.filename.split(".").pop())}`}
                    >
                      <FileIcon type={file.filename.split(".").pop()} />
                    </div>

                    <div className="files-modal-file-content">
                      <span className="files-modal-file-name">
                        {file.filename}
                      </span>
                      <span className="files-modal-file-extension">
                        {file.filename.split(".").pop()}
                        {/* File extension */}
                      </span>
                    </div>
                  </li>
                ))}
              </>
            )}
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
