import XlsxPreview from "./XlsxPreview";

const FilePreview = ({ file, onClose, ...props }) => {
  console.log("FILE HERE");
  console.log(file);
  const fileItem = file?.file;
  console.log(file);
  const type = fileItem?.type || file.file_format;
  console.log("FILE TYPE");
  console.log(type);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      onClick={onClose}
      {...props}
    >
      <div
        className="max-w-6xl h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {type.includes("image") && (
          <img
            src={file?.url}
            className="max-h-[90vh] mx-auto object-contain"
          />
        )}

        {type.includes("pdf") && (
          <iframe
            src={file?.url}
            title={file?.filename || fileItem.name}
            width={"100%"}
            height={"100%"}
            style={{ border: "none", borderRadius: "8px" }}
          />
        )}

        {(type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          type.toLowerCase() === "xlsx") && (
          <XlsxPreview file={file?.file} url={file?.url} />
        )}

        {type.includes("video") && (
          <video
            src={file?.preview || file?.url}
            controls
            className="w-full max-h-[90vh]"
          />
        )}
      </div>
    </div>
  );
};

export default FilePreview;
