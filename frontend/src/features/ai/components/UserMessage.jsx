import { FaFilePdf } from "react-icons/fa6";

import { FaCheck, FaRegFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import { toast } from "sonner";
import { useState } from "react";
import Tooltip from "@components/ToolTip";
import { MdContentCopy } from "react-icons/md";
import Button from "@components/Button";
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

const UserMessage = ({ message, onFileClick, previewFile, showOptions }) => {
  const hasFiles = message.files?.length > 0;
  const hasText = message.content?.trim().length > 0;
  const [copied, setCopied] = useState(false);

  const handleCopy = async (message) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      // Feedback copiere
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error(err?.message || "Failed to copy");
    }
  };
  const handleFileClick = (file) => {
    if (previewFile) onFileClick(null);
    else onFileClick(file);
  };
  return (
    <div className="flex">
      <div className="flex flex-col items-end gap-2">
        {hasFiles && (
          <div className="flex flex-wrap gap-2 p-2 rounded-2xl justify-end">
            {message.files.map((file, i) => (
              <File key={i} file={file} onClick={handleFileClick} />
            ))}
          </div>
        )}

        {hasText && (
          <div className="flex">
            <p className="whitespace-pre-wrap wrap-break-word bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
              {message.content}
            </p>

            {showOptions && (
              <div className="relative">
                <div className="absolute bottom-0">
                  {!copied && (
                    <Tooltip text={"Copy"}>
                      <Button
                        className="cursor-pointer hover:scale-125 hover:bg-gray-800  p-1 rounded-full"
                        onClick={() => handleCopy(message.content)}
                      >
                        <MdContentCopy className="size-3  " />
                      </Button>
                    </Tooltip>
                  )}

                  {copied && (
                    <Tooltip text={"Copied succesfully"}>
                      <FaCheck className="size-3" />
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessage;
