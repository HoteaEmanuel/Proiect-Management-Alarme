import React, { useEffect, useTransition } from "react";
import {
  useGetAllAlarms,
  useGetFilteredAlarms,
} from "@features/dashboard/hooks/alarms.queries";
import { AlarmsTable } from "@features/dashboard/components/Table";
import { useState } from "react";
import { alarmsApi } from "@features/dashboard/api/alarms.api";
import { CiExport, CiPlug1 } from "react-icons/ci";
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
  const [isExporting, startExporting] = useTransition();
  const { data: alarms, isPending: isPendingAlarms } = useGetAllAlarms();
  const [filters, setFilters] = useState(undefined);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [filteredAlarms, setFilteredAlarms] = useState(alarms);
  useGetFilteredAlarms;

  // Apeleaza api ul care returneaza alarmele pentru fiecare modificare a paginarii, a filtrelor sau a sortarii
  useEffect(() => {
    const fetchAlarms = async () => {
      const data = await alarmsApi.getFilteredAlarms({
        filters,
        pagination,
        sorting,
      });
      setFilteredAlarms(data);
    };

    fetchAlarms();
  }, [filters, pagination, sorting]);

  if (isPendingAlarms) return <p>Loading...</p>;

  const handleExport = async () => {
    try {
      startExporting(async () => {
        const data = await alarmsApi.export({
          filters,
          pagination,
          sorting,
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
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">End date</label>
          <input
            type="date"
            className="dashboard-filter-input"
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Status</label>
          <select
            className="dashboard-filter-input"
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
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
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                severity: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
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
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                type: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
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
              setFilters((prev) => ({
                ...prev,
                summary: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Server</label>
          <input
            className="dashboard-filter-input"
            placeholder="Server name"
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                server: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
          />
        </div>

        <div className="dashboard-filter">
          <label className="dashboard-filter-label">Description</label>
          <input
            className="dashboard-filter-input"
            placeholder="Description"
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                alert_description: e.target.value,
              }));

              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
          />
        </div>
      </div>

      <AlarmsTable
        data={filteredAlarms?.alarms || []}
        totalCount={filteredAlarms?.total_alarms}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
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
            {pagination.pageIndex + 1}
          </span>{" "}
          / {filteredAlarms?.total_pages}
        </h2>

        <label className="dashboard-pagination-label" htmlFor="page-size">
          Page size:
        </label>

        <select
          id="page-size"
          value={pagination.pageSize}
          className="dashboard-page-size-select"
          onChange={(e) =>
            setPagination({
              pageIndex: 0,
              pageSize: e.target.value,
            })
          }
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
