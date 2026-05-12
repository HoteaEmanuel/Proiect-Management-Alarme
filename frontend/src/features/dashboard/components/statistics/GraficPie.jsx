import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";
const GraficPie = ({ data, legend = true, onSliceClick }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={100}
          onClick={(entry) => {
            if (onSliceClick) onSliceClick(entry.name);
          }}
        />
        <Tooltip formatter={(value) => `${value}%`} />
        {legend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GraficPie;
