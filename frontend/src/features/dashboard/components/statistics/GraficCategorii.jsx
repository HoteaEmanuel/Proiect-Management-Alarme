import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const GraficCategorii = ({ data, onBarClick }) => {

  const sortedData = useMemo(() => {

    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const chartHeight = Math.max(240, sortedData.length * 32);

  return (
    <div className="statistics-category-bars">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 8, left: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={118}
            interval={0}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
          />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar
            dataKey="value"
            fill="#378ADD"
            radius={[0, 4, 4, 0]}
            onClick={(entry) => {
              if (onBarClick) onBarClick(entry.name);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficCategorii;
