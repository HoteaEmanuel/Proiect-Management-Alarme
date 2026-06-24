import React from "react";

import { FaFilePdf } from "react-icons/fa6";

import { FaCheck, FaRegFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import { BsFiletypeDocx } from "react-icons/bs";

import "@styles/features/ai/components/File.css";

const FILE_ICONS = {
  pdf: <FaFilePdf />,
  xlsx: <FaRegFileExcel />,
  csv: <FaFileCsv />,
  docx: <BsFiletypeDocx />,
  default: <FaFile />,
};

const File = ({ file, onClick }) => {
  const fileName = file?.filename || file?.file?.name;
  const ext = fileName.split(".").pop().toLowerCase();
  const icon = FILE_ICONS[ext] ?? FILE_ICONS.default;

  return (
    <button onClick={() => onClick(file)} className="chat-file">
      <span className="chat-file-icon">{icon}</span>
      <div className="chat-file-content">
        <p className="chat-file-name">{fileName}</p>
      </div>
    </button>
  );
};

export default File;
