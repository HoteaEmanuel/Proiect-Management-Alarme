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
        // blob e un obiect care reprezinta un fiser in memorie,  type e tipul — in cazul asta .xlsx
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
  console.log("ALL ALARMS");
  console.log(alarms);
  console.log("FILTERED ALARMS");
  console.log(filteredAlarms);

  return (
    <div className="dashboard-page">
      <div className="flex w-full justify-between items-center">
        <h1 className="dashboard-title">Alarms</h1>

        <button
          className="flex gap-1 items-center shadow-2xs rounded-2xl py-1 px-3 border border-gray-800 cursor-pointer hover:scale-105 bg-gray-900"
          onClick={handleExport}
        >
          {isExporting ? (
            <>
              Exporting...
              <RiLoader2Fill className="animate-spin" />
            </>
          ) : (
            <>
              Export
              <CiExport />
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
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Cleared">Cleared</option>
            <option value="Acknowledged">Acknowledged</option>
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
            <option value="">All</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
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
            <option value="">All</option>
            <option value="System">System</option>
            <option value="Application">Application</option>
            <option value="Network">Network</option>
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
          <span className="font-semibold">{alarms?.total_alarms}</span>{" "}
        </h2>
        {filteredAlarms?.total_alarms !== alarms.total_alarms && (
          <h2 className="dashboard-pagination-text">
            Total matching alarms:{" "}
            <span className="font-semibold">
              {" "}
              {filteredAlarms?.total_alarms}
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
          <option value={10}>10</option>
          <option value={20}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default Dashboard;
