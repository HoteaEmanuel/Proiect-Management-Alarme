import React from "react";

import { FaFilePdf } from "react-icons/fa6";

import { FaCheck, FaRegFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import { FaFile } from "react-icons/fa";

const FILE_ICONS = {
  pdf: <FaFilePdf />,
  xlsx: <FaRegFileExcel />,
  csv: <FaFileCsv />,
  default: <FaFile />,
};

const File = ({ file, onClick }) => {
  console.log(file);
  const fileName = file?.filename || file?.file?.name;
  console.log(fileName);
  const ext = fileName.split(".").pop().toLowerCase();
  const icon = FILE_ICONS[ext] ?? FILE_ICONS.default;

  return (
    <button
      onClick={() => onClick(file)}
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 
                 border border-gray-700 rounded-lg px-3 py-2 text-left
                 transition-colors cursor-pointer max-w-50"
    >
      <span className="text-lg shrink-0">{icon}</span>
      <div className="overflow-hidden">
        <p className="text-xs truncate">{fileName}</p>
      </div>
    </button>
  );
};

export default File;
