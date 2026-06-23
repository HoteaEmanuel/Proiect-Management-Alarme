import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useState } from "react";
import Loading from "@features/ai/components/Loading";
import { useGetAlarmsTrend } from "@features/dashboard/hooks/alarms.queries";

import "@styles/features/dashboard/components/AlarmChart.css";

const COLORS = {
  Critical: "#ef4444",
  Major: "#f59e0b",
  Minor: "#3b82f6",
  Warning: "#a855f7",
  Info: "#22c55e",
};

const CATEGORIES = ["Critical", "Major", "Minor", "Warning", "Info"];

const GRANULARITY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
];

const TITLES = {
  monthly: "Alarms in the last month",
  weekly: "Alarms in the last week",
  daily: "Alarms in the last day",
  hourly: "Alarms in the last hour",
};

const formatBucketLabel = (bucket, granularity) => {
  const date = bucket.replace("T", " ");

  switch (granularity) {
    case "daily":
    case "hourly":
      return date.slice(11, 16); // HH:mm

    default:
      return date.slice(0, 10); // 
  }
};

const transformData = (buckets = [], granularity) => {
  const grouped = {};

  buckets.forEach(({ time_bucket, group_label, alarm_count }) => {
    const label = formatBucketLabel(time_bucket, granularity);

    grouped[label] ??= { date: label };
    grouped[label][group_label] = alarm_count;
  });

  return Object.values(grouped);
};

const buildTickInterval = (length, maxTicks = 8) => {
  if (length <= maxTicks) return 0;
  return Math.ceil(length / maxTicks) - 1;
};

export const AlarmChart = () => {
  const [granularity, setGranularity] = useState("monthly");

  const { data, isPending } = useGetAlarmsTrend({
    granularity,
    group_by: "severity",
  });

  if (isPending) return <Loading />;

  const chartData = transformData(data?.buckets, granularity);

  const tickInterval = buildTickInterval(chartData.length);

  const angledLabels = granularity === "monthly" || granularity === "weekly";

  return (
    <div className="alarm-chart-wrapper">
      <div className="alarm-chart-header">
        <p className="alarm-chart-title">{TITLES[granularity]}</p>

        <select
          className="alarm-chart-select"
          value={granularity}
          onChange={(e) => setGranularity(e.target.value)}
        >
          {GRANULARITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="alarm-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 24,
              right: 24,
              left: 12,
              bottom: angledLabels ? 70 : 40,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#333"
            />

            <XAxis
              dataKey="date"
              interval={tickInterval}
              angle={angledLabels ? -35 : 0}
              textAnchor={angledLabels ? "end" : "middle"}
              tick={{ fontSize: 11 }}
              height={angledLabels ? 60 : 35}
              dy={10}
              padding={{
                left: 20,
                right: 20,
              }}
            />

            <YAxis width={50} tick={{ fontSize: 11 }} tickCount={6} />

            <Tooltip offset={15} />

            <Legend
              height={50}
              iconType="circle"
              wrapperStyle={{
                paddingTop: 12,
              }}
            />

            {CATEGORIES.map((category) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={COLORS[category]}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 7,
                }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
