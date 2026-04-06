import React, { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { data, useNavigate } from "react-router-dom";
import {
  useGetAllAlarms,
  useGetFilteredAlarms,
} from "../features/dashboard/hooks/alarms.queries";
import { AlarmsTable } from "../features/dashboard/components/Table";
import { authApi } from "../features/auth/api/auth.api";
import useCheckAuth from "../hooks/useCheckAuth";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { alarmsApi } from "../features/dashboard/api/alarms.api";
const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: alarms, isPending: isPendingAlarms } = useGetAllAlarms();
  const [filters, setFilters] = useState(undefined);
  const [filteredAlarms, setFilteredAlarms] = useState(alarms);
  useGetFilteredAlarms;
  useEffect(() => {
    const fetchAlarms = async () => {
      const data = await alarmsApi.getFilteredAlarms(filters);
      setFilteredAlarms(data);
    };

    fetchAlarms();
  }, [filters]);
  console.log("FILTERS: ", filters);
  console.log(filteredAlarms);
  if (isPendingAlarms) return <p>Loading...</p>;
  return (
    <div className="w-full flex flex-col p-5">
      <h1 className="heading mb-10">Alarms</h1>
      <div className="flex gap-4 p-2">
        <div className="flex flex-col">
          Start date
          <input
            type="date"
            className="border"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col">
          End date
          <input
            type="date"
            className="border"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col">
          Status
          <select
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className="border p-2"
          >
            {/* <option value="">Status</option> */}
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Cleared">Cleared</option>
            <option value="Acknowledged">Acknowledged</option>
          </select>
        </div>

        <div className="flex flex-col">
          Severity
          <select
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                severity: e.target.value,
              }))
            }
            className="border p-2"
          >
            {/* <option value="">Status</option> */}
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>
        </div>
      </div>
      <AlarmsTable data={filteredAlarms ? filteredAlarms.alarms : alarms} />
      <h1>Total alarms: {alarms?.length}</h1>
      <h1>Total filteredAlarms: {filteredAlarms?.alarms?.length}</h1>
    </div>
  );
};

export default Dashboard;
