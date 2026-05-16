import Button from "@components/Button";
import { useEffect, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import * as XLSX from "xlsx";

import "@styles/features/ai/components/XlsxPreview.css";

// Excel preview
const XlsxPreview = ({ file, url }) =>
{
  console.log("XLSX PREVIEW")
  const [rows, setRows] = useState([]);
  console.log(file,url);

  useEffect(() =>
  {
    const loadExcel = async () =>
    {
      let data;

      if (file) {
        // fisierul inca nu a fost uploaded
        data = await file.arrayBuffer();
      } else if (url) {
        const res = await fetch(url);
        data = await res.arrayBuffer();
      }

      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      setRows(rows);
    };

    loadExcel();
  }, [file, url]);

  const handleDownload = async () =>
  {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = url.split("/").pop();
      a.click();
    }
  };

  return (
    // Afisare asemanatoare cu un xlsx
    <div className="xlsx-preview">
      <div className="xlsx-preview-header">
        <Button
          className="xlsx-preview-download-button"
          onClick={handleDownload}
        >
          <MdFileDownload className="xlsx-preview-download-icon" />
        </Button>
      </div>

      <div className="xlsx-preview-table-wrapper">
        <table className="xlsx-preview-table">
          <thead>
            <tr>
              <th className="xlsx-preview-heading xlsx-preview-corner-cell"></th>

              {rows[0]?.map((_, i) => (
                <th
                  key={i}
                  className="xlsx-preview-heading"
                >
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="xlsx-preview-row-number">
                  {i + 1}
                </td>

                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="xlsx-preview-cell"
                  >
                    {cell ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default XlsxPreview;
