import React from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useGetAllAlarms } from "../features/dashboard/hooks/alarms.queries";
import { AlarmsTable } from "../features/dashboard/components/Table";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  console.log(user);

  const { data: alarms, isPending: isPendingAlarms } = useGetAllAlarms();
  if (isPendingAlarms) return <p>Loading...</p>;

  console.log(alarms);
  return (
    <div className="w-full flex flex-col">
      <h1 className="heading mb-10">Alarms</h1>
      <AlarmsTable data={alarms}/>
    </div>
  );
};

export default Dashboard;
