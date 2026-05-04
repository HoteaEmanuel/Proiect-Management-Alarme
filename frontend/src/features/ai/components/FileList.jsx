import React, { useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";

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
    setFiles((prev) => prev.filter((f) => f.name !== file.name));
  };

  console.log("FILES HERE");
  console.log(files);

  return (
    <div className="flex gap-1 overflow-x-auto shadow-2xl">
      <ul className="flex gap-1 overflow-x-auto py-3 px-2">
        {files.map((file) => (
          <li
            key={file.name}
            className="relative overflow-visible flex flex-1 gap-2 hover:bg-gray-900 p-1 rounded-md"
            onMouseOver={() => setSelectedFile(file.name)}
            onMouseLeave={() => setSelectedFile(null)}
            onClick={() => setPreviewFile(file)}
          >
            {selectedFile === file.name && (
              <div className="absolute -top-2 -right-2 z-50 hover:text-white">
                <button
                  onClick={(e) => handleRemoveFile(e, file)}
                  className="cursor-pointer"
                >
                  <CiCircleRemove className="size-6" />
                </button>
              </div>
            )}

            <div
              className={`flex rounded-md items-center px-2 py-1 ${fileTypeColor(file.name.split(".").pop())}`}
            >
              <CiFileOn className="size-5" />
            </div>

            <div className="flex flex-col gap-1 max-w-50">
              <span className="font-semibold text-sm truncate">
                {file.name}
                {file.status === "pending" && "Uploading..."}
              </span>
              <span className="uppercase opacity-50 text-xs">
                {file.name.split(".").pop()}
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
