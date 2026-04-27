import React, { useState } from "react";
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
} from "recharts";
import StatCard from "../features/dashboard/components/StatCard";
import "../styles/pages/Statistics.css";


export const Statistics = () =>
{
  const COLORS = ["#378ADD", "#E24B4A", "#EF9F27", "#1D9E75", "#7F77DD"];

  const { data: statistics, isPending: isPendingStatistics } =
    useGetStatistics();

    const [timePeriod, setTimePeriod] = useState({ start_date:'2026-',end_date:2026})

  if (isPendingStatistics) return <p>Loading...</p>;

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

  const topServers = Object.entries(statistics.ServerName)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    
    <div className="statistics-page">
      <h1 className="statistics-title">KPI Statistics</h1>
      

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

      <div className="statistics-kpi-grid">
        <StatCard label={"Total alarms"} value={statistics.General.Total} />

        <div className="statistics-active-card">
          <div className="statistics-active-header">
            <span className="statistics-active-label">
              Active alarms
            </span>

            <span className="statistics-active-status">
              <span className="statistics-active-pulse"></span>
              <span className="statistics-active-dot"></span>
            </span>
          </div>

          <div className="statistics-active-value-row">
            <span className="statistics-active-value">
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

      <section className="statistics-two-columns">
        <div className="statistics-chart-card">
          <h2 className="statistics-card-title">Severities</h2>

          <div className="statistics-chart-body">
            <ResponsiveContainer width="100%" height={280}>
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

        </div>

        <div className="statistics-chart-card">
          <h2 className="statistics-card-title">Status</h2>

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
      </section>

      <section className="statistics-section">
        <h2 className="statistics-section-title">Alarms Categories</h2>

        <div className="statistics-three-columns">
          <div className="statistics-chart-card">
            <h2 className="statistics-card-title">Category 1</h2>

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

          <div className="statistics-chart-card">
            <h2 className="statistics-card-title">Category 2</h2>

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

          <div className="statistics-chart-card">
            <h2 className="statistics-card-title">Category 3</h2>

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
      </section>


      <section className="statistics-two-columns statistics-bottom-grid">
        <div className="statistics-chart-section">
          <h2 className="statistics-section-title">Alarms per companies</h2>

          <div className="statistics-chart-card statistics-large-chart">
            <div className="statistics-large-chart-body">
              <ResponsiveContainer width="92%" height={300}>
                <BarChart
                  data={companies}
                  layout="vertical"
                  margin={{ top: 8, right: 40, bottom: 8, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(v) => `${v} alarms`} />
                  <Bar dataKey="value" fill="#378ADD" radius={[0, 4, 4, 0]} />
                </BarChart>

              </ResponsiveContainer>
          </div>

          </div>
        </div>

        <div className="statistics-chart-section">
          <h2 className="statistics-section-title">
            Top servers with the most alarms
          </h2>

          <div className="statistics-chart-card statistics-large-chart">
            <div className="statistics-large-chart-body">
              <ResponsiveContainer width="92%" height={300}>
                <BarChart
                  data={topServers}
                  layout="vertical"
                  margin={{ top: 8, right: 40, bottom: 8, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(v) => `${v} alarms`} />
                  <Bar dataKey="value" fill="#378ADD" radius={[0, 4, 4, 0]} />
                </BarChart>

              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
