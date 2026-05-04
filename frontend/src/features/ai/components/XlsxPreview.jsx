import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
// Excel preview
const XlsxPreview = ({ file, url }) => {
  const [rows, setRows] = useState([]);

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

  return (
    // Afisare asemanatoare cu un xlsx
    <div className="overflow-auto max-h-[90vh] bg-[#1e1e1e] p-2 rounded-lg">
      <table className="border-collapse text-sm">
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
  );
};

export default XlsxPreview;
