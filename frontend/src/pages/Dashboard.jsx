import React, { useEffect } from "react";
import {
  useGetAllAlarms,
  useGetFilteredAlarms,
} from "../features/dashboard/hooks/alarms.queries";
import { AlarmsTable } from "../features/dashboard/components/Table";
import { useState } from "react";
import { alarmsApi } from "../features/dashboard/api/alarms.api";
import "../styles/pages/Dashboard.css";

const Dashboard = () => {
  const { data: alarms, isPending: isPendingAlarms } = useGetAllAlarms();
  const [filters, setFilters] = useState(undefined);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [filteredAlarms, setFilteredAlarms] = useState(alarms);
  useGetFilteredAlarms;

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

  console.log("FILTERS: ", filters);
  console.log(filteredAlarms);
  console.log("PAGINATION");
  console.log(pagination);

  console.log("SORTING");
  console.log(sorting);

  if (isPendingAlarms) return <p>Loading...</p>;

  console.log(alarms);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Alarms</h1>

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
          <span className="font-semibold">{alarms?.length}</span>{" "}
        </h2>
        <h2 className="dashboard-pagination-text">
          Total matching alarms:{" "}
          <span className="font-semibold">
            {" "}
            {filteredAlarms?.alarms?.length}
          </span>
        </h2>
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
