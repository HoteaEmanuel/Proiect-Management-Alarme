import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";

const getPieChartConfig = (width) => {

  if (width <= 360) {

    return {
      height: 340,
      outerRadius: 76,
      cy: "44%",
      legendFontSize: 14,
    };
  }

  if (width <= 425) {

    return {
      height: 330,
      outerRadius: 84,
      cy: "45%",
      legendFontSize: 14,
    };
  }

  return {
    height: 300,
    outerRadius: 100,
    cy: "50%",
    legendFontSize: 14,
  };
};

const GraficPie = ({ data, legend = true, onSliceClick }) => {

  const [chartConfig, setChartConfig] = useState(() =>
    getPieChartConfig(window.innerWidth)
  );

  useEffect(() => {

    const handleResize = () => {

      setChartConfig(getPieChartConfig(window.innerWidth));
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {

      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ResponsiveContainer width="100%" height={chartConfig.height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy={chartConfig.cy}
          innerRadius={0}
          outerRadius={chartConfig.outerRadius}
          onClick={(entry) => {
            if (onSliceClick) onSliceClick(entry.name);
          }}
        />

        <Tooltip formatter={(value) => `${value}%`} />

        {legend && (
          <Legend
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <span
                style={{
                  color: "var(--color-text)",
                  fontSize: `${chartConfig.legendFontSize}px`,
                }}
              >
                {value}
              </span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GraficPie;