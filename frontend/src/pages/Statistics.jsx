import React from "react";
import { alarmsApi } from "../features/dashboard/api/alarms.api";
import { useGetStatistics } from "../features/dashboard/hooks/alarms.queries";

export const Statistics = () => {
  const { data: statistics, isPending: isPendingStatistics } =
    useGetStatistics();
  if (isPendingStatistics) return <p>Loading...</p>;
  console.log(statistics);
  return (
    <div className="w-full flex">
      <p>Alarms statistics</p>
    </div>
  );
};
