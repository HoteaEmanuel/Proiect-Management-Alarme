import { useEffect, useState } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { formatDate } from "@lib/formatDate";
import { alarmsApi } from "../api/alarms.api";

const FILTERS = ["Toate", "Critical", "Major", "Minor", "Warning"];

const days = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
);

const transformData = (rawData) => {
  return days.map((day, dayIndex) => ({
    id: day,
    data: hours.map((hour, hourIndex) => {
      const match = rawData.find(
        (d) => d.day_of_week === dayIndex + 1 && d.hour_of_day === hourIndex,
      );
      return { x: hour, y: match?.alarm_count ?? 0 };
    }),
  }));
};

const filterButtonStyle = (isActive) => ({
  padding: "7px 18px",
  borderRadius: 6,
  border: "1px solid",
  borderColor: isActive ? "#06b6d4" : "#1f2a3d",
  background: isActive ? "rgba(6,182,212,0.12)" : "#162033",
  color: isActive ? "#06b6d4" : "#e5e7eb",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  letterSpacing: "0.02em",
  transition: "all 0.15s ease",
  outline: "none",
});

export const HeatMap = () => {
  const { getHeatMeap } = alarmsApi;
  const [data, setData] = useState(null);
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
  // const { data: heapMapData, isPending: isPendingHeatMap } = useGetHeapMap({
  //   start_date: formatDate(sevenDaysAgo),
  //   end_date: formatDate(today),
  //   severity: "critical",
  // });
  useEffect(() => {
    async function getData() {
      const response = await getHeatMeap(activeFilter);
      setData(response.data);
    }
    getData();
  }, [activeFilter, getHeatMeap]);

  const handleFilter = (f) => {
    setActiveFilter((prev) => ({
      ...prev,
      severity: f,
    }));
    // onFilterChange?.(f);
  };

  if (data === null) return null;
  console.log("HEEEAT DATA");
  console.log(data);
  return (
    <div
      style={{
        background: "#111827",
        borderRadius: 12,
        padding: "16px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: "2rem",
      }}
    >
      <h2 className="font-semibold text-2xl">Heat map</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            style={filterButtonStyle(activeFilter.severity === f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ height: 260 }}>
        <ResponsiveHeatMap
          data={transformData(data)}
          margin={{ top: 24, right: 10, bottom: 36, left: 40 }}
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
          borderRadius={5}
          borderWidth={3}
          borderColor="#0b1220"
          enableLabels={false}
          axisTop={{
            tickSize: 0,
            tickPadding: 6,
            tickRotation: 0,
            format: (v) => {
              const h = parseInt(v);
              return h % 4 === 0 ? v : "";
            },
            renderTick: ({ x, y, value }) => {
              const h = parseInt(value);
              if (h % 4 !== 0) return <g />;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="auto"
                    style={{
                      fill: "#94a3b8",
                      fontSize: 11,
                      fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                    }}
                  >
                    {value}
                  </text>
                </g>
              );
            },
          }}
          axisBottom={null}
          axisRight={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            renderTick: ({ x, y, value }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  textAnchor="end"
                  dominantBaseline="central"
                  style={{
                    fill: "#94a3b8",
                    fontSize: 12,
                    fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                  }}
                >
                  {value}
                </text>
              </g>
            ),
          }}
          tooltip={({ cell }) => {
            const h = parseInt(cell.data.x);
            const nextHour = `${String(h + 1).padStart(2, "0")}:00`;
            return (
              <div
                style={{
                  background: "#1a2235",
                  border: "1px solid #1f2a3d",
                  padding: "8px 14px",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  fontSize: 13,
                  color: "#e5e7eb",
                  lineHeight: 1.7,
                  fontFamily: "inherit",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontWeight: 700, color: "#e5e7eb" }}>
                  {cell.serieId}, {cell.data.x}–{nextHour}
                </div>
                <div style={{ color: "#94a3b8" }}>{cell.value} alarme</div>
              </div>
            );
          }}
          legends={[
            {
              anchor: "bottom-left",
              translateX: 0,
              translateY: 34,
              length: 180,
              thickness: 10,
              direction: "row",
              tickPosition: "after",
              tickSize: 0,
              tickSpacing: 6,
              tickOverlap: false,
              title: "Puțin",
              titleAlign: "start",
              titleOffset: 6,
            },
          ]}
          theme={{
            background: "transparent",
            text: {
              fontSize: 11,
              fill: "#94a3b8",
              fontFamily: "ui-monospace, 'Cascadia Code', monospace",
            },
            legends: {
              text: {
                fontSize: 11,
                fill: "#94a3b8",
                fontFamily: "ui-monospace, 'Cascadia Code', monospace",
              },
              ticks: {
                text: {
                  fontSize: 11,
                  fill: "#94a3b8",
                },
              },
              title: {
                text: {
                  fontSize: 11,
                  fill: "#94a3b8",
                },
              },
            },
          }}
        />
      </div>

      <div
        style={{
          marginTop: -16,
          paddingLeft: 196,
          fontSize: 11,
          color: "#94a3b8",
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
        }}
      >
        Mult
      </div>
    </div>
  );
};
