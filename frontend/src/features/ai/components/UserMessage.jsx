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

import "@styles/features/ai/components/UserMessage.css";

const UserMessage = ({ message, onFileClick, previewFile, showOptions }) =>
{
  const MESSAGE_HEIGHT = 300;
  const hasFiles = message.files?.length > 0;
  const hasText = message?.content.trim().length > 0;

  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() =>
  {
    const el = contentRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > MESSAGE_HEIGHT);
  }, [message?.content]);

  const handleCopy = async (message) =>
  {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      // Feedback copiere
      setTimeout(() =>
      {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error(err?.message || "Failed to copy");
    }
  };

  console.log("CLAMPED");
  console.log(isClamped);

  const handleFileClick = (file) =>
  {
    if (previewFile) onFileClick(null);
    else onFileClick(file);
  };

  return (
    <div className="user-message">
      <div className="user-message-body">
        {hasFiles && (
          <div className="user-message-files">
            {message.files.map((file, i) => (
              <File key={i} file={file} onClick={handleFileClick} />
            ))}
          </div>
        )}

        {hasText && (
          <div className="user-message-content">
            <div className="user-message-content-wrapper">
              <div
                ref={contentRef}
                className={`user-message-bubble ${
                  expanded ? "user-message-bubble-expanded" : "user-message-bubble-collapsed"
                } ${isClamped && !expanded ? "user-message-bubble-fade" : ""}`}
              >
                {message.content}
              </div>

              {isClamped && (
                <div className="user-message-expand-wrapper">
                  <Button
                    className="user-message-expand-button"
                    onClick={() => setExpanded((prev) => !prev)}
                  >
                    <span className="user-message-expand-text">
                      {expanded ? "Show less" : "Show more"}
                    </span>
                    {expanded ? (
                      <MdExpandLess className="user-message-expand-icon" />
                    ) : (
                      <MdExpandMore className="user-message-expand-icon" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {showOptions && (
              <div className="user-message-options">
                <div className="user-message-options-inner">
                  {!copied && (
                    <Tooltip text={"Copy"}>
                      <Button
                        className="user-message-copy-button"
                        onClick={() => handleCopy(message.content)}
                      >
                        <MdContentCopy className="user-message-copy-icon" />
                      </Button>
                    </Tooltip>
                  )}

                  {copied && (
                    <Tooltip text={"Copied succesfully"}>
                      <FaCheck className="user-message-copy-icon" />
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