import React from "react";
import { useGetConversationFiles } from "../api/chatBot.api";
import useChatStore from "@store/chatStore";
import { RiLoader2Fill } from "react-icons/ri";
import { TbFilesOff } from "react-icons/tb";
import { CiCircleList, CiCircleRemove, CiFileOff } from "react-icons/ci";
import Button from "@components/Button";
import FilePreview from "./FilePreview";
import FileTypeIcon from "@components/FileTypeIcon";
import { getFileTypeVariant } from "../../../utils/fileType";

import "@styles/features/ai/components/FilesModal.css";
import { useFilePreview } from "@store/filePreviewStore";

const FilesModal = ({ close }) => {
  const { conversation } = useChatStore();
  // const [selectedFile, setSelectedFile] = useState(null);
  const { setFile } = useFilePreview();
  // const [previewFile, setPreviewFile] = useState(null);

  const { data, isPending } = useGetConversationFiles(
    conversation.conversation_id,
  );

  if (isPending) return <RiLoader2Fill className="files-modal-loader" />;

  return (
    <div className="files-modal">
      <Button className="files-modal-close-button" onClick={close}>
        <CiCircleRemove className="files-modal-close-icon" />
      </Button>

      {data.user_files?.length === 0 && data.assistant_files?.length === 0 && (
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
                    onClick={() => setFile(file)}
                  >
                    <div
                      className={`files-modal-type files-modal-type-${getFileTypeVariant(file.filename.split(".").pop())}`}
                    >
                      <FileTypeIcon type={file.filename.split(".").pop()} />
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
                    onClick={() => setFile(file)}
                  >
                    <div
                      className={`files-modal-type files-modal-type-${getFileTypeVariant(file.filename.split(".").pop())}`}
                    >
                      <FileTypeIcon type={file.filename.split(".").pop()} />
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
    </div>
  );
};

export default FilesModal;
