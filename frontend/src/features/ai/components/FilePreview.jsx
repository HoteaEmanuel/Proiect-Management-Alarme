import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import XlsxPreview from "./XlsxPreview";

import "@styles/features/ai/components/FilePreview.css";
import { useFilePreview } from "@store/filePreviewStore";

const FilePreview = ({ ...props }) => {
  const { file, setFile } = useFilePreview();
  if (!file) return null;
  const fileItem = file?.file;
  const type = fileItem?.type || file.file_format;
  const isXlsx =
    type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type.toLowerCase() === "xlsx";

  const handleClose = () => setFile(null);
  return createPortal(
    <div className="file-preview-backdrop" onClick={handleClose} {...props}>
      <button
        className="file-preview-close-button"
        onClick={handleClose}
        aria-label="Close preview"
      >
        <IoClose className="file-preview-close-icon" />
      </button>

      <div
        className={`file-preview-content ${isXlsx ? "file-preview-content-xlsx" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {type.includes("image") && (
          <img src={file?.url} className="file-preview-image" />
        )}

        {type.includes("pdf") && (
          <iframe
            src={file?.url}
            title={file?.filename || fileItem.name}
            className="file-preview-pdf"
          />
        )}

        {isXlsx && <XlsxPreview file={file?.file} url={file?.url} />}

        {type.includes("video") && (
          <video
            src={file?.preview || file?.url}
            controls
            className="file-preview-video"
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

export default FilePreview;
