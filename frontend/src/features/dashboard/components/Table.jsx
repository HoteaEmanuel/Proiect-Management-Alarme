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
import "../../../styles/features/dashboard/components/Table.css";

const columns = [
  {
    accessorKey: "alarm_number",
    header: "Alarm number",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <span className={`alarm-table-status alarm-table-status-${getValue().toLowerCase()}`}>
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severitate",
    cell: ({ getValue }) => (
      <span className={`alarm-table-severity alarm-table-severity-${getValue().toLowerCase()}`}>
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: "server_name",
    header: "Server",
  },
  {
    accessorKey: "summary",
    header: "Alarm Summary",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "alert_group",
    header: "Alert group",
    cell: ({ getValue }) => <span>{getValue()}</span>,
  },
  {
    accessorKey: "first_occurence_datetime",
    header: "First Occurence",
    cell: ({ getValue }) => <span>{formatDate(getValue().toString())}</span>,
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ getValue }) => <span>{getValue()}</span>,
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
      const newSort =
        typeof updater === "function" ? updater(sorting) : updater;

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
    <div className="alarm-table-wrapper">
      <table className="alarm-table">
        <thead className="alarm-table-head">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="alarm-table-row">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="alarm-table-heading"
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

        <tbody className="alarm-table-body">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="alarm-table-row">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="alarm-table-cell">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="alarm-table-actions">
        <button
          type="button"
          onClick={() => firstPage()}
          className="alarm-table-button"
        >
          First page
        </button>

        <button
          type="button"
          onClick={() => previousPage()}
          disabled={!getCanPreviousPage()}
          className="alarm-table-icon-button"
        >
          {getCanPreviousPage() && <MdNavigateBefore className="alarm-table-icon" />}
        </button>

        <button
          type="button"
          onClick={() => nextPage()}
          disabled={!getCanNextPage()}
          className="alarm-table-icon-button"
        >
          {getCanNextPage() && <MdNavigateNext className="alarm-table-icon" />}
        </button>
      </div>

      {alarms?.length === 0 && (
        <div className="alarm-table-empty">Nu exista date</div>
      )}
    </div>
  );
};
