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

  // const time = [
  //   {
  //     name: "Avg Resolution Time",
  //     value: statistics.TimeKPI.Avg_Resolution_Time_Minutes,
  //     fill: "#E24B4A",
  //   },
  //   {
  //     name: "Avg Time Between Occurrences",
  //     value: statistics.TimeKPI.Avg_Time_Between_Occurrences_Minutes,
  //     fill: "#378ADD",
  //   },
  // ];

  const kpi = {
    Avg_Resolution_Time_Minutes: statistics.TimeKPI.Avg_Resolution_Time_Minutes,
    Avg_Time_Between_Occurrences_Minutes:
      statistics.TimeKPI.Avg_Time_Between_Occurrences_Minutes,
  };

  const labels = {
    Avg_Resolution_Time_Minutes: "Avg Resolution Time",
    Avg_Time_Between_Occurrences_Minutes: "Avg Time Between Occurrences",
  };

  return (
    <div className="w-full flex flex-col p-5 gap-4">
      <h1 className="text-3xl font-bold">KPI Statistics</h1>
      <h1>
        Total alarms:{" "}
        <span className="font-bold">{statistics.General.Total}</span>
      </h1>

      <h1>
        Active alarms:{" "}
        <span className="font-bold">{statistics.Status.Active}</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {Object.entries(kpi).map(([key, value]) => (
          <div key={key} className="border rounded-lg flex flex-col">
            <p>{labels[key]}</p>
            <p className="font-bold">
              {value} <span>minutes</span>
            </p>
          </div>
        ))}
      </div>

      <h1>Alarms Severities</h1>
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

      <h1>Status</h1>
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

      <h1>Alarms Categories</h1>

      <div className="flex">
        <h1>Category 1</h1>
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
        <h1>Category 2</h1>
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
      </div>
      <h1>Alarms per companies</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={companies} layout="vertical" margin={{ left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={140} />
          <Tooltip formatter={(v) => `${v} alarms`} />
          <Bar dataKey="value" fill="#378ADD" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
