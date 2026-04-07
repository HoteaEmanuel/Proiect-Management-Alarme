// src/features/alarms/components/AlarmsTable.jsx
import { useGetAllAlarms, useGetFilteredAlarms } from "../hooks/alarms.queries";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { formatDate } from "../../../utils/formatDate";

const columns = [
  {
    accessorKey: "alarm_number",
    header: "Alarm number",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },

  {
    accessorKey: "alert_group",
    header: "Alert group",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "severity",
    header: "Severitate",
    cell: ({ getValue }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          getValue().toLowerCase() === "critical"
            ? "bg-red-500 text-red-900"
            : getValue().toLowerCase() === "warning"
              ? "bg-yellow-300 text-yellow-700"
              : getValue().toLowerCase() === "major"
                ? "bg-orange-100 text-orange-700"
                : "bg-yellow-100 "
        }`}
      >
        {getValue()}
      </span>
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <span
        className={`${getValue().toLowerCase() === "active" ? "bg-green-100 text-green-700" : getValue().toLowerCase() === "acknowledged" ? "bg-amber-100 text-yellow-700" : getValue().toLowerCase() === "cleared" ? "bg-green-50 text-green-800" : "bg-red-100 text-red-700"} p-1 rounded-xl`}
      >
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: "summary",
    header: "Alarm Summary",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "first_occurence_datetime",
    header: "First Occurence",
    cell: ({ getValue }) => <span>{formatDate(getValue().toString())}</span>,
  },

  {
    accessorKey: "last_occurence_datetime",
    header: "Last Occurence",
    cell: ({ getValue }) => <span>{formatDate(getValue().toString())}</span>,
  },
  //   {
  //     id: "actions",
  //     header: "Actiuni",
  //     cell: ({ row }) => (
  //       <button
  //         onClick={() => console.log(row.original)}
  //         className="text-sm text-blue-500 hover:underline"
  //       >
  //         Vezi
  //       </button>
  //     ),
  //   },
];

export const AlarmsTable = ({ data,totalCount, pagination, onPaginationChange }) => {
  const [sorting, setSorting] = useState([]);
  console.log(data);
  console.log(pagination);
  console.log(totalCount)
  const alarms = data;
  const table = useReactTable({
    data: alarms,
    columns,
    state: { pagination },
    manualPagination: true,
    rowCount: totalCount,
    onPaginationChange,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    firstPage,
    previousPage,
    lastPage,
    nextPage,
    getCanNextPage,
    getCanPreviousPage,
  } = table;

  return (
    <div className="rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-3 text-left font-mediumcursor-pointer select-none hover:text-gray-700"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {header.column.getIsSorted() === "asc"
                    ? " ↑"
                    : header.column.getIsSorted() === "desc"
                      ? " ↓"
                      : ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.alarm_number} className="px-4 py-3 text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex w-full gap-4 bg-red-100">
        <button onClick={() => firstPage()} className="btn">
          First page
        </button>

        <button
          onClick={() => previousPage()}
          disabled={!getCanPreviousPage()}
          className="btn"
        >
          Previous page
        </button>

        <button
          onClick={() => nextPage()}
          disabled={!getCanNextPage()}
          className="btn"
        >
          Next page
        </button>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-400">Nu exista date</div>
      )}
    </div>
  );
};
