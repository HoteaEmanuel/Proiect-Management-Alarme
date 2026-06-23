
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
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
import { useSearchParams } from "react-router-dom";
import ChartDetailsModal from "@features/dashboard/components/statistics/ChartDetailsModal";
import useHeaderVisibility from "@hooks/useHeaderVisibility";
import { usePageTitle } from "@hooks/usePageTitle";

export const Statistics = () => {
  usePageTitle("Statistics");
  const containerRef = useRef(null);
  useHeaderVisibility(containerRef);
  const year = new Date().getFullYear();
  const firstDay = `${year}-01-01`;
  const lastDay = `${year}-12-31`;
  const [searchParams, setSearchParams] = useSearchParams();

  const filters =useMemo(()=> ( {
    start_date: searchParams.get("start_date") ?? firstDay,
    end_date: searchParams.get("end_date") ?? lastDay,
  }),[searchParams,firstDay,lastDay]);

  const COLORS = ["#378ADD", "#E24B4A", "#EF9F27", "#1D9E75", "#7F77DD"];

  const [statistics, setStatistics] = useState(null);

  // Logica apasare chart si descarcare/vizualizare

  // ce e apasat, gen category: Status, label: Active
  const [selectedChart, setSelectedChart] = useState(null);
  // lista alarmelor primite de la back
  const [chartDetails, setChartDetails] = useState([]);
  // request ul se incarca sau nu
  const [chartDetailsLoading, setChartDetailsLoading] = useState(false);

  const handleChartClick = async (category, label) => {
    setSelectedChart({ category, label });
    setChartDetailsLoading(true);

    try {
      const data = await alarmsApi.getChartDetails({
        category,
        label,
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
      console.log("Chart details data:", data);
      console.log("First alarm:", data[0]);

      setChartDetails(data);
    } finally {
      setChartDetailsLoading(false);
    }
  };
  const handleCloseChartDetails = () => {
    setSelectedChart(null);
    setChartDetails([]);
  };

  const handleExportChartDetails = async () => {
    if (!selectedChart) return;

    const data = await alarmsApi.exportChartDetails({
      category: selectedChart.category,
      label: selectedChart.label,
      start_date: filters.start_date,
      end_date: filters.end_date,
    });

    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `alarms_${selectedChart.category}_${selectedChart.label}.xlsx`;
    link.click();

    window.URL.revokeObjectURL(url);
  };
  // Logica apasare chart si descarcare/vizualizare

  // Refresh la statistici la fiecare modificare a filtrelor
  useEffect(() => {
    async function fetchStatistics() {
      const data = await alarmsApi.getStatistics(filters);
      setStatistics(data);
    }

    fetchStatistics();
  }, [searchParams,filters]);

  // Updateaza URL cu noul filtru, adaugandu l la URL
  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    });
  };

  if (statistics == null) {
    return <RiLoader2Fill className="statistics-loading-icon" />;
  }

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
    .map(([name, value]) => ({
      name,
      value,
    }));

  const topRecurringAlarms = Object.entries(statistics?.AlertKey ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      value,
    }));

  return (
    // <div className="app">
    <div className="statistics-page" ref={containerRef}>
      <div className="statistics-page-header">
        <h1 className="statistics-title">KPI Statistics</h1>

        <div className="statistics-date-filters">
          <div className="statistics-date-filter">
            <label className="statistics-date-filter-label">Start date</label>

            <input
              type="date"
              className="statistics-date-filter-input"
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
            />
          </div>

          <div className="statistics-date-filter">
            <label className="statistics-date-filter-label">End date</label>

            <input
              type="date"
              className="statistics-date-filter-input"
              min={filters.start_date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
            />
          </div>
        </div>
      </div>

      {statistics.General.Total === 0 ? (
        <p className="statistics-empty-message">
          No alarms found - Try filtering for other period
        </p>
      ) : (
        <>
          <div className="statistics-kpi-grid">
            <StatCard label={"Total alarms"} value={statistics.General.Total}  />

            <StatCard
              label={"Active alarms"}
              value={statistics.Status.Active}
              active={true}
            />

            <StatCard
              label={"Average Resolution Time"}
              value={statistics.TimeKPI.Avg_Resolution_Time_Minutes}
              unit={true}
            />

            <StatCard
              label={"Average Time Between Occurrences"}
              value={statistics.TimeKPI.Avg_Time_Between_Occurrences_Minutes}
              unit={true}
            />
          </div>

          <section className="statistics-two-columns">
            <div className="statistics-chart-card">
              <h2 className="statistics-card-title">Severities</h2>

              <div className="statistics-chart-body">
                <GraficBara
                  data={severities}
                  vertical={true}
                  onBarClick={(label) => handleChartClick("Severity", label)}
                />
              </div>
            </div>

            <div className="statistics-chart-card">
              <h2 className="statistics-card-title">Status</h2>
              <GraficPie
                data={status}
                onSliceClick={(label) => handleChartClick("Status", label)}
              />
            </div>
          </section>

          <section className="statistics-section">
            <h2 className="statistics-section-title">Alarms Categories</h2>

            <div className="statistics-three-columns">
              <div className="statistics-chart-card">
                <h2 className="statistics-card-title">Category 1</h2>
                <GraficPie
                  data={categoriesTier1}
                  onSliceClick={(label) =>
                    handleChartClick("CategoryTier1", label)
                  }
                />
              </div>

              <div className="statistics-chart-card">
                <h2 className="statistics-card-title">Category 2</h2>
                <GraficPie
                  data={categoriesTier2}
                  onSliceClick={(label) =>
                    handleChartClick("CategoryTier2", label)
                  }
                />
              </div>

              <div className="statistics-chart-card">
                <h2 className="statistics-card-title">Category 3</h2>
                <GraficPie
                  data={categoriesTier3}
                  legend={false}
                  onSliceClick={(label) =>
                    handleChartClick("CategoryTier3", label)
                  }
                />
              </div>
            </div>
          </section>

          <section className="statistics-two-columns statistics-bottom-grid">
            <div className="statistics-chart-section">
              <h2 className="statistics-section-title">Alarms per companies</h2>

              <div className="statistics-chart-card statistics-large-chart">
                <div className="statistics-large-chart-body">
                  <GraficBara
                    data={companies}
                    direction={"horizontal"}
                    vertical={false}
                    onBarClick={(label) => handleChartClick("Company", label)}
                  />
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
                      margin={{
                        top: 8,
                        right: 40,
                        bottom: 8,
                        left: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip formatter={(v) => `${v} alarms`} />
                      <Bar
                        dataKey="value"
                        fill="#378ADD"
                        radius={[0, 4, 4, 0]}
                        onClick={(entry) => {
                          handleChartClick("ServerName", entry.name);
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <section className="statistics-section">
            <h2 className="statistics-section-title">
              Most frequent alarms (recurring)
            </h2>

            <div className="statistics-chart-card statistics-large-chart">
              <div className="statistics-large-chart-body">
                <ResponsiveContainer width="92%" height={300}>
                  <BarChart
                    data={topRecurringAlarms}
                    layout="vertical"
                    margin={{
                      top: 8,
                      right: 40,
                      bottom: 8,
                      left: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(v) => `${v} occurrences`} />
                    <Bar
                      dataKey="value"
                      fill="#378ADD"
                      radius={[0, 4, 4, 0]}
                      onClick={(entry) => {
                        handleChartClick("AlertKey", entry.name);
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </>
      )}
      <ChartDetailsModal
        open={selectedChart !== null}
        selectedChart={selectedChart}
        chartDetails={chartDetails}
        chartDetailsLoading={chartDetailsLoading}
        onClose={handleCloseChartDetails}
        onExport={handleExportChartDetails}
      />
    </div>
    // </div>
  );
};
