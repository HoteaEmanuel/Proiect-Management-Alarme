import IconCheckbox from "@components/CheckboxButton";
import CheckboxButton from "@components/CheckboxButton";
import Tooltip from "@components/ToolTip";
import React, { useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";

import { FaFilePdf, FaRegFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import { BsFiletypeDocx } from "react-icons/bs";

import "@styles/features/ai/components/FileList.css";
import { useFilePreview } from "@store/filePreviewStore";

const FileIcon = ({ type }) => {
  console.log("TYPE");
  console.log(type);
  const typeValue = type.toLowerCase();
  switch (typeValue) {
    case "pdf":
      return <FaFilePdf />;
    case "xlsx":
      return <FaRegFileExcel />;
    case "csv":
      return <FaFileCsv />;
    case "docx":
      return <BsFiletypeDocx />;
    default:
      return <FaFile />;
  }
};

const fileTypeColor = (fileType) => {
  console.log(fileType);
  const extension = fileType.toUpperCase();
  switch (extension) {
    case "PDF":
      return "file-list-type-pdf";
    case "XLSX":
      return "file-list-type-xlsx";
    case "CSV":
      return "file-list-type-csv";
    case "DOCX":
      return "file-list-type-docx";
    default:
      return "file-list-type-default";
  }
};

const FileList = ({ files, setFiles }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { setFile } = useFilePreview();
  const handleRemoveFile = (e, file) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.file.name !== file.file.name));
  };

  console.log("FILES HERE");
  console.log(files);
  if (!files || files?.length == 0) return;

  return (
    <div className="file-list-wrapper">
      <ul className="file-list">
        {files.map((item) => (
          <li
            key={item?.url}
            className="file-list-item"
            onMouseOver={() => setSelectedFile(item.file.name)}
            onMouseLeave={() => setSelectedFile(null)}
            onClick={() => setFile(item)}
          >
            {selectedFile === item.file.name && (
              <button
                className="file-list-remove-button"
                onClick={(e) => handleRemoveFile(e, item)}
              >
                <CiCircleRemove className="file-list-remove-icon" />
              </button>
            )}

            <Tooltip text={"Persist"}>
              <IconCheckbox
                checked={item.persist === true}
                onChange={() =>
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.file.name === item.file.name
                        ? { ...f, persist: !f.persist }
                        : f,
                    ),
                  )
                }
              />
            </Tooltip>

            <div
              className={`file-list-type ${fileTypeColor(item.file.name.split(".").pop())}`}
            >
              <FileIcon type={item.file.name.split(".").pop()} />
            </div>

            <div className="file-list-content">
              <span className="file-list-name">{item.file.name}</span>
              <span className="file-list-extension">
                {item.file.name.split(".").pop()}
                {/* File extension */}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
