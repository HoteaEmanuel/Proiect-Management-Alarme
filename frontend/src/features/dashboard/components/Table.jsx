import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { formatDate } from "../../../utils/formatDate.js";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
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
    // cell: ({ getValue }) => <span>{getValue()}</span>,
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
];

export const AlarmsTable = ({
  data,
  totalCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}) => {
  console.log(data);
  console.log(pagination);
  console.log(totalCount);
  console.log(data?.length);
  const alarms = data;
  const table = useReactTable({
    data: alarms,
    columns,
    state: { pagination, sorting: sorting ?? [] },
    manualPagination: true,
    rowCount: totalCount,
    onPaginationChange: onPaginationChange,
    manualSorting: true,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newSort = typeof updater === "function" ? updater(sorting) : updater;
      const safeSort = Array.isArray(newSort) ? newSort : [];
      onSortingChange?.(safeSort);
      onPaginationChange((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    firstPage,
    previousPage,
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
                  className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-gray-700"
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

        <button onClick={() => previousPage()} disabled={!getCanPreviousPage()}>
          {getCanPreviousPage() && (
            <MdNavigateBefore className="size-7 hover:scale-110 cursor-pointer" />
          )}
        </button>

        <button
          onClick={() => nextPage()}
          disabled={!getCanNextPage()}

          // className="btn"
        >
          {getCanNextPage() && (
            <MdNavigateNext className="size-7 hover:scale-110 cursor-pointer" />
          )}
        </button>
      </div>

      {alarms?.length === 0 && (
        <div className="text-center py-12 text-gray-400">Nu exista date</div>
      )}
    </div>
  );
};
