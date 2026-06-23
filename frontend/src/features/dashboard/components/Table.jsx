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
import "@styles/features/dashboard/components/Table.css";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { alarmsApi } from "../api/alarms.api.js";
import {
  AlarmSeverity,
  AlarmStatus,
  AlarmType,
  PaginationSizes,
} from "@constants/alarms.js";
import Loading from "@features/ai/components/Loading.jsx";
import Tooltip from "@components/ToolTip.jsx";
import Button from "@components/Button.jsx";
import { CiExport, CiFilter } from "react-icons/ci";
import AlarmDetailsModal from "./AlarmDetailsModal.jsx";
import { toast } from "sonner";
import { useGetAllAlarms } from "../hooks/alarms.queries.js";

const useDebounceCallback = (fn, delay) => {
  const timerRef = useRef();
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  
  return useCallback(
    (...args) => {
      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay],
  );
};

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
      <span
        className={`alarm-table-status alarm-table-status-${getValue().toLowerCase()}`}
      >
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ getValue }) => (
      <span
        className={`alarm-table-severity alarm-table-severity-${getValue().toLowerCase()}`}
      >
        {getValue()}
      </span>
    ),
  },
  { accessorKey: "server_name", header: "Server" },
  { accessorKey: "summary", header: "Alarm Summary" },
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

export const AlarmsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredAlarms, setFilteredAlarms] = useState(null);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [hasFiltersOpen, setHasFiltersOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  useGetAllAlarms;
  const { data: alarms } = useGetAllAlarms();
  const filters = useMemo(
    () => ({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      status: searchParams.get("status") ?? "All",
      severity: searchParams.get("severity") ?? "All",
      type: searchParams.get("type") ?? "All",
      summary_like: searchParams.get("summary_like") ?? "",
      server_like: searchParams.get("server_like") ?? "",
      description_like: searchParams.get("description_like") ?? "",
      pageIndex: Number(searchParams.get("page") ?? 1) - 1,
      pageSize: Number(searchParams.get("pageSize") ?? 10),
      sort: searchParams.get("sort") ?? "alarm_number",
      order: searchParams.get("order") ?? "desc",
    }),
    [searchParams],
  );

  const handleExport = async () => {
    try {
      startExporting(async () => {
        const data = await alarmsApi.export({
          filters,
        });
        // blob e un obiect care reprezinta un fisier in memorie,  type e tipul — in cazul asta .xlsx
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob); // Generare url care pointeaza spre acest blob

        const a = document.createElement("a");
        a.href = url;
        a.download = "export.xlsx";
        a.click();
        console.log(url);
      });
    } catch (e) {
      toast.error(e?.message || "Export failed");
    }
  };

  useEffect(() => {
    const fetchAlarms = async () => {
      setIsPending(true);
      const data = await alarmsApi.getFilteredAlarms({ filters });
      setFilteredAlarms(data);
      setIsPending(false);
    };
    fetchAlarms();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    if (value.trim().length === 0) {
      // eliminate the empty search param
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.delete(key);
        return params;
      });
      return;
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      next.set("page", "1");
      return next;
    });
  };

  const handleDescriptionChange = useDebounceCallback(
    (value) => handleFilterChange("description_like", value),
    500,
  );
  const handleServerChange = useDebounceCallback(
    (value) => handleFilterChange("server_like", value),
    500,
  );
  const handleSummaryChange = useDebounceCallback(
    (value) => handleFilterChange("summary_like", value),
    500,
  );

  const sorting = searchParams.get("sort")
    ? [{ id: filters.sort, desc: filters.order === "desc" }]
    : [];

  const pagination = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
  };

  const table = useReactTable({
    data: filteredAlarms?.alarms ?? [],
    columns,
    state: { pagination, sorting },
    manualPagination: true,
    rowCount: filteredAlarms?.total_alarms ?? 0,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", next.pageIndex + 1);
        params.set("pageSize", next.pageSize);
        return params;
      });
    },
    manualSorting: true,
    onSortingChange: (updater) => {
      const newSort =
        typeof updater === "function" ? updater(sorting) : updater;
      const safeSort = Array.isArray(newSort) ? newSort : [];
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        const col = safeSort[0];
        if (col) {
          params.set("sort", col.id);
          params.set("order", col.desc ? "desc" : "asc");
        } else {
          params.delete("sort");
          params.delete("order");
        }
        params.set("page", "1");
        return params;
      });
    },
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const {
    firstPage,
    previousPage,
    nextPage,
    getCanNextPage,
    getCanPreviousPage,
  } = table;

  const [isExporting, startExporting] = useTransition();
  // if (isPending || isPendingAlarms) return <Loading />;

  console.log("RENDERED");
  return (
    <div className="dashboard-table-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Alarms</h1>
        <Button
          className="dashboard-export-button"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span>Exporting...</span>
              <RiLoader2Fill className="dashboard-export-icon dashboard-export-icon-loading" />
            </>
          ) : (
            <>
              <span>Export</span>
              <CiExport className="dashboard-export-icon" />
            </>
          )}
        </Button>
      </div>
      <div className="dashboard-filter-toggle-tooltip">
        <Tooltip text={hasFiltersOpen ? "Hide filters" : "Show filters"}>
          <Button
            type="button"
            className="dashboard-filter-toggle"
            onClick={() => setHasFiltersOpen((c) => !c)}
            aria-expanded={hasFiltersOpen}
            aria-controls="dashboard-filters"
          >
            <CiFilter className="dashboard-filter-toggle-icon" />
            <span>{hasFiltersOpen ? "Hide filters" : "Filters"}</span>
          </Button>
        </Tooltip>
      </div>

      <div
        id="dashboard-filters"
        className={`dashboard-filters ${hasFiltersOpen ? "dashboard-filters-open" : ""}`}
      >
        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Start date</label>
          <input
            type="date"
            className="dashboard-filter-input"
            defaultValue={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">End date</label>
          <input
            type="date"
            className="dashboard-filter-input"
            defaultValue={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Status</label>
          <select
            className="dashboard-filter-input"
            defaultValue={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            {Object.entries(AlarmStatus).map(([key, value]) => (
              <option key={key} value={value}>
                {value || "All"}
              </option>
            ))}
          </select>
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Severity</label>
          <select
            className="dashboard-filter-input"
            defaultValue={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            {Object.entries(AlarmSeverity).map(([key, value]) => (
              <option key={key} value={value}>
                {value || "All"}
              </option>
            ))}
          </select>
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Type</label>
          <select
            className="dashboard-filter-input"
            defaultValue={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            {Object.entries(AlarmType).map(([key, value]) => (
              <option key={key} value={value}>
                {value || "All"}
              </option>
            ))}
          </select>
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Summary</label>
          <input
            className="dashboard-filter-input"
            placeholder="Summary"
            defaultValue={filters.summary_like}
            onChange={(e) => handleSummaryChange(e.target.value)}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Server</label>
          <input
            className="dashboard-filter-input"
            placeholder="Server name"
            defaultValue={filters.server_like}
            onChange={(e) => handleServerChange(e.target.value)}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Description</label>
          <input
            className="dashboard-filter-input"
            placeholder="Description"
            defaultValue={filters.description_like}
            onChange={(e) => handleDescriptionChange(e.target.value)}
          />
        </div>
      </div>

      <div
        className="alarm-table-wrapper"
        style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.15s" }}
      >
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
              <tr
                key={row.id}
                className="alarm-table-row"
                onClick={() => setSelectedAlarm(row.original)}
              >
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
            {getCanPreviousPage() && (
              <MdNavigateBefore className="alarm-table-icon" />
            )}
          </button>
          <button
            type="button"
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
            className="alarm-table-icon-button"
          >
            {getCanNextPage() && (
              <MdNavigateNext className="alarm-table-icon" />
            )}
          </button>
        </div>

        {filteredAlarms?.alarms?.length === 0 && (
          <div className="alarm-table-empty">Nu exista date</div>
        )}
      </div>
      <div className="dashboard-pagination-info">
        <h2 className="dashboard-pagination-text">
          Total alarms:{" "}
          <span className="dashboard-pagination-value">
            {alarms?.total_alarms}
          </span>{" "}
        </h2>
        {filteredAlarms?.total_alarms !== alarms?.total_alarms && (
          <h2 className="dashboard-pagination-text">
            Total matching alarms:{" "}
            <span className="dashboard-pagination-value">
              {" "}
              {filteredAlarms?.total_alarms}
            </span>
          </h2>
        )}
        {filteredAlarms?.total_pages > 0 && (
          <h2 className="dashboard-pagination-text">
            Page:{" "}
            <span className="dashboard-pagination-current">
              {filters.pageIndex + 1}
            </span>{" "}
            / {filteredAlarms?.total_pages}
          </h2>
        )}

        <label className="dashboard-pagination-label" htmlFor="page-size">
          Page size:
        </label>

        <select
          id="page-size"
          value={filters.pageSize}
          className="dashboard-page-size-select"
          onChange={(e) => handleFilterChange("pageSize", e.target.value)}
        >
          {Object.entries(PaginationSizes).map(([key, value]) => (
            <option key={key} value={value}>
              {value || "All"}
            </option>
          ))}
        </select>
      </div>
      <AlarmDetailsModal
        open={selectedAlarm !== null}
        alarm={selectedAlarm}
        onClose={() => setSelectedAlarm(null)}
      />
    </div>
  );
};
