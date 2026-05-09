import { FaFilePdf } from "react-icons/fa6";

import { FaRegFileExcel } from "react-icons/fa";
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
  const fileName=file?.filename || file?.file?.name;
  console.log(fileName);
  const ext = fileName.split(".").pop().toLowerCase();
  const icon = FILE_ICONS[ext] ?? FILE_ICONS.default;

  return (
    <button
      onClick={() => onClick(file)}
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 
                 border border-gray-700 rounded-lg px-3 py-2 text-left
                 transition-colors cursor-pointer max-w-[200px]"
    >
      <span className="text-lg shrink-0">{icon}</span>
      <div className="overflow-hidden">
        <p className="text-xs text-white truncate">{file.filename}</p>
      </div>
    </button>
  );
};

const UserMessage = ({ message, onFileClick, previewFile }) => {
  const hasFiles = message.files?.length > 0;
  const hasText = message.content?.trim().length > 0;
  const handleFileClick = (file) => {
    if (previewFile) onFileClick(null);
    else onFileClick(file);
  };
  return (
    <div className="flex">
      <div className="flex flex-col items-end gap-2">
        {hasFiles && (
          <div className="flex flex-wrap gap-2 justify-end">
            {message.files.map((file, i) => (
              <File key={i} file={file} onClick={handleFileClick} />
            ))}
          </div>
        )}

        {hasText && (
          <p className="whitespace-pre-wrap wrap-break-word bg-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserMessage;
