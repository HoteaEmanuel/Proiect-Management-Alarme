import XlsxPreview from "./XlsxPreview";

const FilePreview = ({ file, onClose, ...props }) => {
  console.log("FILE HERE");

  console.log(file);
  const type = file.type;
  console.log("FILE TYPE");
  console.log(type);
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      onClick={onClose}
      {...props}
    >
      <div
        className="max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}    
      >
        {type.startsWith("image/") && (
          <img
            src={file.preview || file.url}
            className="max-h-[90vh] mx-auto object-contain"
          />
        )}

        {type === "application/pdf" && (
          <iframe src={file.preview || file.url} className="w-full h-[90vh]" />
        )}

        {type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && (
          <XlsxPreview file={file.file} url={file.url}/>
        )}

        {type.startsWith("video/") && (
          <video src={file.preview || file.url} controls className="w-full max-h-[90vh]" />
        )}
        {/* {!type.startsWith("image/") &&
          type !== "application/pdf" &&
          !type.startsWith("video/") && (
            <p className="text-white text-center">
              {file.name} — no preview available
            </p>
          )} */}
      </div>
    </div>
  );
};

export default FilePreview;
