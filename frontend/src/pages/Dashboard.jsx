import React, { useEffect, useTransition } from "react";
import {
  useGetAllAlarms,
  useGetFilteredAlarms,
} from "@features/dashboard/hooks/alarms.queries";
import { AlarmsTable } from "@features/dashboard/components/Table";
import { useState } from "react";
import { alarmsApi } from "@features/dashboard/api/alarms.api";
import { CiExport, CiPlug1 } from "react-icons/ci";
import { useSearchParams } from "react-router-dom";
import "@styles/pages/Dashboard.css";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "sonner";
import {
  AlarmSeverity,
  AlarmStatus,
  AlarmType,
  PaginationSizes,
} from "@constants/alarms.js";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams({ replace: false });
  const [isExporting, startExporting] = useTransition();
  const { data: alarms, isPending: isPendingAlarms } = useGetAllAlarms();
  // const [filters, setFilters] = useState(undefined);
  const filters = {
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
  };
  const [filteredAlarms, setFilteredAlarms] = useState(alarms);
  useGetFilteredAlarms;

  // Apeleaza api ul care returneaza alarmele pentru fiecare modificare a filtrelor
  useEffect(() => {
    const fetchAlarms = async () => {
      const data = await alarmsApi.getFilteredAlarms({
        filters,
      });
      setFilteredAlarms(data);
    };

    fetchAlarms();
  }, [searchParams]);

  // Updateaza URL cu noul filtru, adaugandu l la URL
  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      next.set("pageIndex", "0"); // resetam la prima pagina la fiecare schimbare de filtru
      return next;
    });
  };
  if (isPendingAlarms) return <p>Loading...</p>;

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
      toast.error("Export failed");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Alarms</h1>

        <button
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
        </button>
      </div>

      <div className="dashboard-filters">
        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Start date</label>
          <input
            type="date"
            className="dashboard-filter-input"
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">End date</label>
          <input
            type="date"
            className="dashboard-filter-input"
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Status</label>
          <select
            className="dashboard-filter-input"
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
            onChange={(e) => {
              const timeOut = setTimeout(
                () => handleFilterChange("summary_like", e.target.value),
                500,
              );

              return () => clearTimeout(timeOut);
            }}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Server</label>
          <input
            className="dashboard-filter-input"
            placeholder="Server name"
            onChange={(e) => {
              const timeOut = setTimeout(
                () => handleFilterChange("server_like", e.target.value),
                500,
              );

              return () => clearTimeout(timeOut);
            }}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Description</label>
          <input
            className="dashboard-filter-input"
            placeholder="Description"
            onChange={(e) => {
              const timeOut = setTimeout(
                () => handleFilterChange("description_like", e.target.value),
                500,
              );

              return () => clearTimeout(timeOut);
            }}
          />
        </div>
      </div>

      <AlarmsTable
        data={filteredAlarms?.alarms || []}
        totalCount={filteredAlarms?.total_alarms}
        pagination={{
          pageIndex: filters.pageIndex,
          pageSize: filters.pageSize,
        }}
        onPaginationChange={(next) => {
          // Actualizam numarul paginii si dimensiunea paginii in url
          setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", next.pageIndex + 1);
            params.set("pageSize", next.pageSize);
            return params;
          });
        }}
        sorting={
          searchParams.get("sort")
            ? [{ id: filters.sort, desc: filters.order === "desc" }]
            : []
        }
        onSortingChange={(next) => {
          const col = next[0];
          // Actualizam parametrul de sortare si ordinea
          setSearchParams((prev) => {
            
            const params = new URLSearchParams(prev);
            if (col) {
              params.set("sort", col.id);
              params.set("order", col.desc ? "desc" : "asc");
            } else {
              params.delete("sort");
              params.delete("order");
            }

            params.set("page", 1);
            return params;
          });
        }}
      />

      <div className="dashboard-pagination-info">
        <h2 className="dashboard-pagination-text">
          Total alarms:{" "}
          <span className="dashboard-pagination-value">
            {alarms?.length}
          </span>{" "}
        </h2>
        {filteredAlarms?.total_alarms !== alarms.total_alarms && (
          <h2 className="dashboard-pagination-text">
            Total matching alarms:{" "}
            <span className="dashboard-pagination-value">
              {" "}
              {filteredAlarms?.alarms?.length}
            </span>
          </h2>
        )}
        <h2 className="dashboard-pagination-text">
          Page:{" "}
          <span className="dashboard-pagination-current">
            {filters.pageIndex + 1}
          </span>{" "}
          / {filteredAlarms?.total_pages}
        </h2>

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
    </div>
  );
};

export default Dashboard;
