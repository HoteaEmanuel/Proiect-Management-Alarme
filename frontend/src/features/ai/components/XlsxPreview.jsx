import Button from "@components/Button";
import { useEffect, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import * as XLSX from "xlsx";
// Excel preview
const XlsxPreview = ({ file, url }) => {
  console.log("XLSX PREVIEW")
  const [rows, setRows] = useState([]);
  console.log(file,url);

  useEffect(() => {
    const loadExcel = async () => {
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

  const handleDownload = async () => {
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
    <div className="max-h-[90vh] bg-[#1e1e1e] p-2 rounded-lg ">
      <div className="w-full h-full flex justify-end">
        <Button onClick={handleDownload}>
          <MdFileDownload className="size-7 cursor-pointer text-white p-1 hover:bg-gray-900 rounded-full hover:scale-110" />
        </Button>
      </div>
      <div className="overflow-auto">
        <table className="border-collapse text-sm overflow-auto ">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-[#2b2b2b] border border-gray-700 px-3 py-1"></th>

              {rows[0]?.map((_, i) => (
                <th
                  key={i}
                  className="bg-[#2b2b2b] border border-gray-700 px-3 py-1 text-gray-300 font-medium text-center"
                >
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="sticky left-0 bg-[#2b2b2b] border border-gray-700 px-3 py-1 text-gray-400 text-center">
                  {i + 1}
                </td>

                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="border border-gray-700 px-3 py-1 text-gray-100 min-w-[80px] hover:bg-[#2a2a2a] transition"
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
