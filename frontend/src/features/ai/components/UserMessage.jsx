import { FaFilePdf } from "react-icons/fa6";

import { FaCheck, FaRegFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import Tooltip from "@components/ToolTip";
import { MdContentCopy, MdExpandLess } from "react-icons/md";
import Button from "@components/Button";
import File from "./File";
import { MdExpandMore } from "react-icons/md";

const UserMessage = ({ message, onFileClick, previewFile, showOptions }) => {
  const MESSAGE_HEIGHT = 300;
  const hasFiles = message.files?.length > 0;
  const hasText = message?.content.trim().length > 0;

  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > MESSAGE_HEIGHT);
  }, [message?.content]);
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
  console.log("CLAMPED");
  console.log(isClamped);
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
          <div>
            <div className="relative">
              <div
                ref={contentRef}
                style={{
                  maxHeight: expanded ? "none" : `${MESSAGE_HEIGHT}px`,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                  maskImage:
                    isClamped && !expanded
                      ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                      : "none",
                  WebkitMaskImage:
                    isClamped && !expanded
                      ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                      : "none",
                }}
                className="whitespace-pre-wrap wrap-break-word bg-gray-800/50 rounded-2xl rounded-tr-sm px-4 py-2.5 pb-5 text-sm leading-relaxed"
              >
                {message.content}
              </div>

              {isClamped && (
                <div className="absolute bottom-1 left-3 flex justify-center opacity-80">
                  <Button
                    className="flex gap-2 items-center hover:scale-105 cursor-pointer"
                    onClick={() => setExpanded((prev) => !prev)}
                  >
                    <span className="italic text-xs">
                      {expanded ? "Show less" : "Show more"}
                    </span>
                    {expanded ? (
                      <MdExpandLess className="size-4" />
                    ) : (
                      <MdExpandMore className="size-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {showOptions && (
              <div className="relative">
                <div className="absolute right-0">
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
