import React, { useEffect, useState } from "react";
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
import StatCard from "@features/dashboard/components/statistics/StatCard";
import "@styles/pages/Statistics.css";
import { alarmsApi } from "@features/dashboard/api/alarms.api";
import { RiLoader2Fill } from "react-icons/ri";
import GraficBara from "@features/dashboard/components/statistics/GraficBara";
import GraficPie from "@features/dashboard/components/statistics/GraficPie";

export const Statistics = () => {
  const COLORS = ["#378ADD", "#E24B4A", "#EF9F27", "#1D9E75", "#7F77DD"];
  const year = new Date().getFullYear();

  const firstDay = `${year}-01-01`;
  const lastDay = `${year}-12-31`;
  const [statistics, setStatistics] = useState(null);
  const [timeFilter, setTimeFilter] = useState({
    start_date: firstDay, // Prima zi din anul actual
    end_date: lastDay, // Ultima zi din anul actual
  });

  // Refresh la statistici la fiecare modificare a filtrelor
  useEffect(() => {
    async function fetchStatistics() {
      const data = await alarmsApi.getStatistics(timeFilter);
      setStatistics(data);
    }

    fetchStatistics();
  }, [timeFilter]);

  if (statistics == null)
    return <RiLoader2Fill className="animate-spin mx-auto" />;

  const severities = Object.entries(statistics?.Severity ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const status = Object.entries(statistics?.Status ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const categoriesTier1 = Object.entries(statistics?.CategoryTier1 ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const categoriesTier2 = Object.entries(statistics?.CategoryTier2 ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const categoriesTier3 = Object.entries(statistics?.CategoryTier3 ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const companies = Object.entries(statistics?.Company ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      fill: COLORS[i % COLORS.length],
    }),
  );

  const topServers = Object.entries(statistics?.ServerName ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="statistics-page">
      <div className="flex justify-between items-center">
        <h1 className="statistics-title">KPI Statistics</h1>

        <div className="flex gap-4 items-center">
          <div className="dashboard-filter">
            <label className="font-medium text-xs">Start date</label>
            <input
              type="date"
              className="dashboard-filter-input"
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setTimeFilter((prev) => ({
                  ...prev,
                  start_date: e.target.value,
                }));
              }}
            />
          </div>

          <div className="dashboard-filter">
            <label className="font-medium text-xs">End date</label>
            <input
              type="date"
              className="dashboard-filter-input"
              min={timeFilter.start_date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setTimeFilter((prev) => ({
                  ...prev,
                  end_date: e.target.value,
                }));
              }}
            />
          </div>
        </div>
      </div>
      {statistics.General.Total === 0 ? (
        <p className="text-lg font-medium text-center">
          No alarms found - Try filtering for other period
        </p>
      ) : (
        <>
          <div className="statistics-kpi-grid">
            <StatCard label={"Total alarms"} value={statistics.General.Total} />

            <div className="statistics-active-card">
              <div className="statistics-active-header">
                <span className="statistics-active-label">Active alarms</span>

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
                <GraficBara data={severities} />
              </div>
            </div>

            <div className="statistics-chart-card">
              <h2 className="statistics-card-title">Status</h2>
              <GraficPie data={status} />
            </div>
          </section>

          <section className="statistics-section">
            <h2 className="statistics-section-title">Alarms Categories</h2>

            <div className="statistics-three-columns">
              <div className="statistics-chart-card">
                <h2 className="statistics-card-title">Category 1</h2>
                <GraficPie data={categoriesTier1} />
              </div>

              <div className="statistics-chart-card">
                <h2 className="statistics-card-title">Category 2</h2>
                <GraficPie data={categoriesTier2} />
              </div>

              <div className="statistics-chart-card">
                <h2 className="statistics-card-title">Category 3</h2>
                <GraficPie data={categoriesTier3} />
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
                      <Bar
                        dataKey="value"
                        fill="#378ADD"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* <GraficBara data={companies} vertical={}/> */}
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
                      <Bar
                        dataKey="value"
                        fill="#378ADD"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
