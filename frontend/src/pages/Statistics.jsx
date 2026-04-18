import React from "react";
import { alarmsApi } from "../features/dashboard/api/alarms.api";
import { useGetStatistics } from "../features/dashboard/hooks/alarms.queries";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
} from "recharts";
import StatCard from "../features/dashboard/components/StatCard";
export const Statistics = () => {
  const COLORS = ["#378ADD", "#E24B4A", "#EF9F27", "#1D9E75", "#7F77DD"];
  const { data: statistics, isPending: isPendingStatistics } =
    useGetStatistics();
  if (isPendingStatistics) return <p>Loading...</p>;
  console.log(statistics);

  const severities = Object.entries(statistics.Severity).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const status = Object.entries(statistics.Status).map(([name, value], i) => ({
    name,
    value,
    fill: COLORS[i % COLORS.length],
  }));

  const categoriesTier1 = Object.entries(statistics.CategoryTier1).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );
  const categoriesTier2 = Object.entries(statistics.CategoryTier2).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const categoriesTier3 = Object.entries(statistics.CategoryTier3).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const companies = Object.entries(statistics.Company).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );


  const topServers= Object.entries(statistics.ServerName)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([name, value]) => ({ name, value }));
  console.log(topServers);

  return (
    <div className="w-full flex flex-col gap-4 p-5 ">
      <h1 className="text-3xl font-bold">KPI Statistics</h1>
      <div className="flex gap-2 grid-cols-2 w-full mx-auto">
        <StatCard label={"Total alarms"} value={statistics.General.Total} />

        {/* <StatCard label={"Active alarms"} value={statistics.Status.Active} /> */}
        <div
          className="border rounded-xl p-5 flex flex-col gap-1 w-full h-full
      shadow-[0_0_15px_rgba(99,102,241,0.4)] 
      hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] 
      transition-shadow duration-300
      border-indigo-400/30"
        >
          <div className="flex gap-2 items-center">
            <span className="text-xs uppercase tracking-widest">
              Active alarms
            </span>
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-green-500" />
            </span>
          </div>

          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold">
              {statistics.Status.Active}
            </span>
          </div>
        </div>
        <StatCard
          label={"Average Resolution Time"}
          value={statistics.TimeKPI.Avg_Resolution_Time_Minutes}
          unit={"minutes"}
        />
        <StatCard
          label={"Average Time Between Occurrences"}
          value={statistics.TimeKPI.Avg_Time_Between_Occurrences_Minutes}
          unit={"minutes"}
        />
      </div>
      <div className="flex gap-10">
        <div className="flex flex-col w-full p-2 border border-gray-800 rounded-2xl bg-gray-900">
          <h1 className="font-bold">Severities</h1>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={severities}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-col p-2 border  border-gray-800  rounded-2xl bg-gray-900">
          <h1 className="font-bold">Status</h1>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={status}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={100}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h1 className="font-bold text-2xl">Alarms Categories</h1>
      <div className="flex gap-10">
        <div className="flex w-full flex-col p-2 border  border-gray-800  rounded-2xl bg-gray-900">
          <h1 className="font-semibold">Category 1</h1>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriesTier1}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-col p-2 border  border-gray-800  rounded-2xl bg-gray-900">
          <h1 className="font-semibold">Category 2</h1>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriesTier2}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoriesTier3}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer> */}

        <div className="flex w-full flex-col p-2 border  border-gray-800  rounded-2xl bg-gray-900">
          <h1 className="font-semibold">Category 3</h1>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriesTier3}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend
                iconSize={10}
                wrapperStyle={{ lineHeight: "10px" }}
                formatter={(value) => (
                  <span style={{ fontSize: "10px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex w-full gap-10 min-h-1/2">
        <div className="flex flex-col w-full h-full gap-2">
          <h1 className="font-bold text-2xl">Alarms per companies</h1>
          <div className="flex w-full flex-col p-2 border  border-gray-800  rounded-2xl bg-gray-900 h-full p-2">
            <ResponsiveContainer width="100%" height={"100%"}>
              <BarChart
                data={companies}
                layout="vertical"
                margin={{ left: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip formatter={(v) => `${v} alarms`} />
                <Bar dataKey="value" fill="#378ADD" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-col w-full h-full gap-2">
          <h1 className="font-bold">Top servers with the most alarms</h1>
          <div className="flex w-full flex-col p-2 border  border-gray-800  rounded-2xl bg-gray-900 h-full p-2">
            <ResponsiveContainer width="100%" height={"100%"}>
              <BarChart
                data={topServers}
                layout="vertical"
                margin={{ left: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip formatter={(v) => `${v} alarms`} />
                <Bar dataKey="value" fill="#378ADD" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
