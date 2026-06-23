import React from "react";
import { FaRegFileExcel, FaFilePdf, FaFileCsv, FaFile } from "react-icons/fa";
import { BsFiletypeDocx } from "react-icons/bs";
import { getFileTypeVariant } from "../utils/fileType";

const FileTypeIcon = ({ type }) => {
  switch (getFileTypeVariant(type)) {
    case "pdf":
      return <FaFilePdf />;
    case "xlsx":
      return <FaRegFileExcel />;
    case "csv":
      return <FaFileCsv />;
    case "docx":
      return <BsFiletypeDocx />;
    default:
      return <FaFile />;
  }
};

export default FileTypeIcon;
