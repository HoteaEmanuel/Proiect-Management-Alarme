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

import "@styles/features/dashboard/components/AlarmChart.css"

const COLORS = {
  Critical: "#ef4444",
  Major: "#f59e0b",
  Minor: "#3b82f6",
  Warning: "#a855f7",
  Info: "#22c55e",
};

const transformData = (raw) => {
  const map = {};
  raw.forEach(({ time_bucket, group_label, alarm_count }) => {
    const date = time_bucket.split("T")[0];
    if (!map[date]) map[date] = { date };
    map[date][group_label] = alarm_count;
  });
  return Object.values(map);
};

const AlarmChart = ({ data }) => {
  console.log("ALARM DATAA");
  console.log(data);
  const chartData = transformData(data);
  const categories = ["Critical", "Major", "Minor", "Warning", "Info"];

  return (
    <div className="alarm-chart-wrapper">
      <ResponsiveContainer width="100%" height={"100%"}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
          <YAxis tick={{ fill: "#aaa" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e1e1e", border: "none" }}
          />
          <Legend />
          {categories.map((cat) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={COLORS[cat]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls // ← conecteaza liniile chiar daca lipseste data pt o zi
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default AlarmChart;
