import IconCheckbox from "@components/CheckboxButton";
import CheckboxButton from "@components/CheckboxButton";
import Tooltip from "@components/ToolTip";
import React, { useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";

import { FaFilePdf, FaRegFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import { FaFile } from "react-icons/fa";


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

const FileList = ({ files, setFiles, setPreviewFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const handleRemoveFile = (e, file) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.file.name !== file.file.name));
  };

  console.log("FILES HERE");
  console.log(files);
  if (!files || files?.length == 0) return;

  return (
    <div className="flex gap-1 overflow-hidden shadow-2xl">
      <ul className="flex gap-1 overflow-x-auto overflow-y-hidden p-5 px-7">
        {files.map((item) => (
          <li
            key={item?.url}
            className="relative overflow-visible flex flex-1 gap-2 hover:bg-gray-900 p-1 rounded-md"
            onMouseOver={() => setSelectedFile(item.file.name)}
            onMouseLeave={() => setSelectedFile(null)}
            onClick={() => setPreviewFile(item)}
          >
            {selectedFile === item.file.name && (
              <div className="absolute -top-2 -right-2 z-50 hover:text-white">
                <button
                  onClick={(e) => handleRemoveFile(e, item)}
                  classfilename="cursor-pointer"
                >
                  <CiCircleRemove classfilename="size-6" />
                </button>
              </div>
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
              className={`flex rounded-md items-center px-2 py-1 ${fileTypeColor(item.file.name.split(".").pop())}`}
            >
              <FileIcon type={item.file.name.split(".").pop()} />
            </div>

            <div className="flex flex-col gap-1 max-w-50">
              <span className="font-semibold text-sm truncate">
                {item.file.name}
              </span>
              <span className="uppercase opacity-50 text-xs">
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
