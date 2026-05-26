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

import "@styles/features/dashboard/components/AlarmChart.css";

const COLORS = {
  Critical: "#ef4444",
  Major: "#f59e0b",
  Minor: "#3b82f6",
  Warning: "#a855f7",
  Info: "#22c55e",
};

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

const formatBucketLabel = (timeBucket, granularity) => {
  const normalizedBucket = timeBucket.replace("T", " ");

  if (granularity === "daily") {
    return normalizedBucket.slice(11, 16);
  }

  if (granularity === "hourly") {
    return normalizedBucket.slice(11, 16);
  }

  return normalizedBucket.slice(0, 10);
};

const transformData = (raw, granularity) => {
  const map = {};

  raw.forEach(({ time_bucket, group_label, alarm_count }) => {
    const bucketLabel = formatBucketLabel(time_bucket, granularity);

    if (!map[bucketLabel]) {
      map[bucketLabel] = { date: bucketLabel };
    }

    map[bucketLabel][group_label] = alarm_count;
  });

  return Object.values(map);
};

const AlarmChart = ({ data, granularity, onGranularityChange, isLoading }) => {
  console.log("ALARM DATAA");
  console.log(data);

  const chartData = transformData(data, granularity);
  const categories = ["Critical", "Major", "Minor", "Warning", "Info"];

  return (
    <div className="alarm-chart-wrapper">
      <div className="alarm-chart-header">
        <p className="alarm-chart-title">{TITLES[granularity]}</p>
        <select
          className="alarm-chart-select"
          value={granularity}
          onChange={(e) => onGranularityChange(e.target.value)}
        >
          {GRANULARITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="alarm-chart-container">
        {isLoading && (
          <div className="alarm-chart-loading">
            Loading chart...
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 28 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />

            <XAxis
              dataKey="date"
              className="alarm-chart-axis alarm-chart-x-axis"
            />

            <YAxis
              width={60}
              className="alarm-chart-axis"
            />

            <Tooltip wrapperClassName="alarm-chart-tooltip" />

            <Legend
              height={64}
              className="alarm-chart-legend"
            />

            {categories.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={COLORS[cat]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AlarmChart;