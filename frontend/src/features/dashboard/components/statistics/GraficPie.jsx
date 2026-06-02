import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";

const getPieChartConfig = (width, itemsCount) => {

  const hasManyItems = itemsCount > 10;

  if (width <= 360) {

    return {
      height: hasManyItems ? 390 : 330,
      outerRadius: hasManyItems ? 64 : 74,
      cy: hasManyItems ? "34%" : "42%",
      legendFontSize: hasManyItems ? 11 : 13,
      legendIconSize: hasManyItems ? 8 : 10,
    };
  }

  if (width <= 425) {

    return {
      height: hasManyItems ? 400 : 340,
      outerRadius: hasManyItems ? 70 : 82,
      cy: hasManyItems ? "34%" : "43%",
      legendFontSize: hasManyItems ? 12 : 14,
      legendIconSize: hasManyItems ? 8 : 10,
    };
  }

  return {
    height: hasManyItems ? 350 : 300,
    outerRadius: hasManyItems ? 84 : 100,
    cy: hasManyItems ? "38%" : "50%",
    legendFontSize: hasManyItems ? 12 : 14,
    legendIconSize: hasManyItems ? 9 : 10,
  };
};

const GraficPie = ({ data, legend = true, onSliceClick }) => {

  const visibleData = data.filter((item) => item.value > 0);

  const [chartConfig, setChartConfig] = useState(() =>
    getPieChartConfig(window.innerWidth, visibleData.length)
  );

  useEffect(() => {

    const handleResize = () => {

      setChartConfig(getPieChartConfig(window.innerWidth, visibleData.length));
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {

      window.removeEventListener("resize", handleResize);
    };
  }, [visibleData.length]);

  return (
    <ResponsiveContainer width="100%" height={chartConfig.height}>
      <PieChart>
        <Pie
          data={visibleData}
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

        <Tooltip formatter={(value) => `${value} alarms`} />

        {legend && (
          <Legend
            verticalAlign="bottom"
            align="center"
            iconSize={chartConfig.legendIconSize}
            wrapperStyle={{
              lineHeight: "1.25",
              paddingTop: "8px",
            }}
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