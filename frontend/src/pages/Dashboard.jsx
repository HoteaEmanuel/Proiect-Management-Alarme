import React, { Suspense } from "react";

import { AlarmsTable } from "@features/dashboard/components/Table";
import "@styles/pages/Dashboard.css";
import { usePageTitle } from "@hooks/usePageTitle";
import { AlarmChart } from "@features/dashboard/components/statistics/AlarmChart";
import { HeatMap } from "@features/dashboard/components/HeatMap";
import { AlarmsTableSkeleton } from "@features/dashboard/components/skeletons/AlarmTableSkeleton";
import { AlarmChartSkeleton } from "@features/dashboard/components/skeletons/AlarmsChart";
import { HeatMapSkeleton } from "@features/dashboard/components/skeletons/HeatMapSkeleton";

const Dashboard = () => {
  usePageTitle("Dashboard");
  return (
    <div className="dashboard-page">
      <Suspense fallback={<AlarmsTableSkeleton />}>
        <AlarmsTable />
      </Suspense>

      <Suspense fallback={<AlarmChartSkeleton />}>
        <AlarmChart />
      </Suspense>

      <Suspense fallback={<HeatMapSkeleton />}>
        <HeatMap />
      </Suspense>
    </div>
  );
};

export default Dashboard;
