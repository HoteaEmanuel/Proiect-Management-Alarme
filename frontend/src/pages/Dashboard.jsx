import React, { useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import {
  useGetAllAlarms,
  useGetFilteredAlarms,
} from "../features/dashboard/hooks/alarms.queries";
import { AlarmsTable } from "../features/dashboard/components/Table";
import { useState } from "react";
import { alarmsApi } from "../features/dashboard/api/alarms.api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: alarms, isPending: isPendingAlarms } = useGetAllAlarms();
  const [filters, setFilters] = useState(undefined);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [filteredAlarms, setFilteredAlarms] = useState(alarms);
  useGetFilteredAlarms;
  useEffect(() => {
    const fetchAlarms = async () => {
      console.log("SORTING AICEA: ",sorting);
      const data = await alarmsApi.getFilteredAlarms({ filters, pagination, sorting });
      setFilteredAlarms(data);
    };

    fetchAlarms();
  }, [filters, pagination,sorting]);
  console.log("FILTERS: ", filters);
  console.log(filteredAlarms);
  console.log("PAGINATION");
  console.log(pagination);

    console.log("SORTING");
    console.log(sorting);
  if (isPendingAlarms) return <p>Loading...</p>;
  console.log(alarms);
  return (
    <div className="w-full flex flex-col p-5">
      <h1 className="heading mb-10">Alarms</h1>
      <div className="flex gap-4 p-2">
        <div className="flex flex-col">
          Start date
          <input
            type="date"
            className="border"
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

        <div className="flex flex-col">
          End date
          <input
            type="date"
            className="border"
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

        <div className="flex flex-col">
          Status
          <select
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
            className="border p-2"
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Cleared">Cleared</option>
            <option value="Acknowledged">Acknowledged</option>
          </select>
        </div>

        <div className="flex flex-col">
          Severity
          <select
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
            className="border p-2"
          >
            {/* <option value="">Status</option> */}
            <option value="">All</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>
        </div>
      </div>
      <AlarmsTable
        data={filteredAlarms?.alarms}
        totalCount={filteredAlarms?.total_alarms}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
      />

      <div className="flex w-full gap-4 justify-end">
        <h1>Total alarms: {alarms?.length}</h1>
        <h1>Total filteredAlarms: {filteredAlarms?.alarms?.length}</h1>
        <h1>
          Page: <span className="font-bold">{pagination.pageIndex + 1} </span> /{" "}
          {filteredAlarms?.total_pages}
        </h1>
      </div>
    </div>
  );
};

export default Dashboard;
