import { useState } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { formatDate } from "@lib/formatDate";

import "@styles/features/dashboard/components/HeatMap.css";
import { useGetHeatMap } from "../hooks/alarms.queries";
import Loading from "@features/ai/components/Loading";

const FILTERS = ["Toate", "Critical", "Major", "Minor", "Warning"];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
);

const transformData = (rawData) =>
  days.map((day, dayIndex) => ({
    id: day,
    data: hours.map((hour, hourIndex) => {
      const match = rawData.find(
        (d) => d.day_of_week === dayIndex + 1 && d.hour_of_day === hourIndex,
      );

      return { x: hour, y: match?.alarm_count ?? 0 };
    }),
  }));

export const HeatMap = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [activeFilter, setActiveFilter] = useState({
    start_date: formatDate(sevenDaysAgo),
    end_date: formatDate(today),
    severity: "critical",
  });

  const { data: mapData, isPending } = useGetHeatMap(activeFilter);
  // useEffect(() => {
  //   async function fetchData() {
  //     const response = await getHeatMap(activeFilter);
  //     setData(response.data);
  //   }

  //   fetchData();
  // }, [activeFilter, getHeatMap]);

  const handleFilter = (severity) => {
    setActiveFilter((prev) => ({
      ...prev,
      severity,
    }));
  };

  if (!mapData) return null;
  if (isPending) return <Loading />;

  return (
    <div className="heatmap-card">
      <h2 className="heatmap-title">Heat map</h2>

      <div className="heatmap-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`heatmap-filter-btn ${
              activeFilter.severity === f ? "is-active" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="heatmap-container">
        <ResponsiveHeatMap
          data={transformData(mapData.data)}
          margin={{
            top: 55,
            right: 20,
            bottom: 60,
            left: 85,
          }}
          colors={{
            type: "sequential",
            colors: [
              "#162033",
              "#0d3d52",
              "#0e6e8c",
              "#0891b2",
              "#06b6d4",
              "#7dd3fc",
            ],
          }}
          emptyColor="#0d1829"
          borderRadius={3}
          borderWidth={1}
          borderColor="#0f172a"
          enableLabels={false}
          animate
          axisTop={{
            tickSize: 0,
            tickPadding: 18,
            format: (v) => (parseInt(v) % 4 === 0 ? v : ""),
            renderTick: ({ x, y, value }) => {
              const h = parseInt(value);
              if (h % 4 !== 0) return <g />;

              return (
                <g transform={`translate(${x},${y - 12})`}>
                  <text className="heatmap-axis-top">{value}</text>
                </g>
              );
            },
          }}
          axisBottom={null}
          axisRight={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 20,
            renderTick: ({ x, y, value }) => (
              <g transform={`translate(${x - 12},${y})`}>
                <text className="heatmap-axis-left">{value}</text>
              </g>
            ),
          }}
          tooltip={({ cell }) => {
            const h = parseInt(cell.data.x);
            const nextHour = `${String(h + 1).padStart(2, "0")}:00`;

            return (
              <div className="heatmap-tooltip">
                <div className="heatmap-tooltip-title">{cell.serieId}</div>

                <div className="heatmap-tooltip-sub">
                  {cell.data.x} - {nextHour}
                </div>

                <div className="heatmap-tooltip-value">{cell.value} alarms</div>
              </div>
            );
          }}
          legends={[]}
        />
      </div>

      <div className="heatmap-legend">
        <span className="heatmap-legend__label">Less</span>

        <div className="heatmap-legend__gradient" />

        <span className="heatmap-legend__label">More</span>
      </div>
    </div>
  );
};
