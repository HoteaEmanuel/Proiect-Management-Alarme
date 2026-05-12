import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const GraficBara = ({ data, direction, vertical, onBarClick }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout={direction}
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          onClick={(entry) => {
            if (onBarClick) onBarClick(entry.name);
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default GraficBara;
