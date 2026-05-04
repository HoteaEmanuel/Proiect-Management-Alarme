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
  const ext = file.file.name.split(".").pop().toLowerCase();
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
        <p className="text-xs text-white truncate">{file.name}</p>
      </div>
    </button>
  );
};

const UserMessage = ({ message, onFileClick, previewFile }) => {
  console.log("MESSAGE IN THE COMPONENT: ", message);
  const hasFiles = message.files?.length > 0;
  const hasText = message.text?.trim().length > 0;
  const handleFileClick = (file) => {
    if (previewFile) onFileClick(null);
    else onFileClick(file);
  };
  return (
    <div className="flex justify-end mb-4">
      <div className="flex flex-col items-end gap-2 max-w-[75%]">
        {hasFiles && (
          <div className="flex flex-wrap gap-2 justify-end">
            {message.files.map((file, i) => (
              <File key={i} file={file} onClick={handleFileClick} />
            ))}
          </div>
        )}

        {hasText && (
          <div className="bg-gray-800 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessage;
