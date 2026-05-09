import ReactMarkdown from "react-markdown";
import { useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import remarkGfm from "remark-gfm";
import ToolTip from "@components/ToolTip";
import Button from "@components/Button";
import { BiDownload } from "react-icons/bi";
import { GoDownload } from "react-icons/go";
import { toPng } from "html-to-image";
const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
];

const Chart = ({ content }) => {
  console.log("CHART CONTENT ");
  console.log(content);
  const chartRef = useRef(null);

  const downloadPNG = async () => {
    if (!chartRef.current) return;

    const dataUrl = await toPng(chartRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#111827",
    });

    const a = document.createElement("a");

    a.download = `${title || "chart"}.png`;
    a.href = dataUrl;
    a.click();
  };

  const downloadSVG = () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    // add namespaces if missing
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "chart.svg";
    a.click();

    URL.revokeObjectURL(url);
  };

  let config;
  try {
    config = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    return <p className="text-red-400 text-sm">Invalid chart data</p>;
  }

  const { chart_type, title, data, x_key, y_keys } = config;

  const commonProps = {
    data,
    margin: { top: 10, right: 20, left: 0, bottom: 0 },
  };

  const renderLines = () =>
    y_keys.map((key, i) => {
      const color = COLORS[i % COLORS.length];
      if (chart_type === "bar")
        return <Bar key={key} dataKey={key} fill={color} />;
      if (chart_type === "line")
        return (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            dot={false}
          />
        );
      if (chart_type === "area")
        return (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            fill={color}
            fillOpacity={0.2}
          />
        );
    });

  return (
    <div
      className="statistics-chart-card  max-w-1/2 flex  flex-col items-center justify-center "
      style={{
        width: "800px",
        height: "500px",
      }}
      ref={chartRef}
    >
      {title && (
        <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
      )}

      <ResponsiveContainer
        width={"100%"}
        height={"100%"}
        className={"space-y-4"}
      >
        {chart_type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={y_keys[0]}
              nameKey={x_key}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : chart_type === "bar" ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={x_key} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            />
            <Legend />
            {renderLines()}
          </BarChart>
        ) : chart_type === "line" ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={x_key} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            />
            <Legend />
            {renderLines()}
          </LineChart>
        ) : (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={x_key} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            />
            <Legend />
            {renderLines()}
          </AreaChart>
        )}
      </ResponsiveContainer>
      <div className="relative bg-red-500 w-full">
        <div className="absolute bottom-0 right-0">
          <ToolTip text={".Png"}>
            <Button
              onClick={downloadPNG}
              className="p-2 rounded-full hover:bg-gray-800 hover:scale-110 cursor-pointer"
            >
              <GoDownload className="size-5" />
            </Button>
          </ToolTip>
        </div>
      </div>
    </div>
  );
};

const ChatResponse = ({ blocks }) => {
  console.log("BLOCKS");
  console.log(blocks);
  return (
    <div className="min-w-0 w-full">
      {blocks.map((block, index) => (
        <div key={index} className="min-w-0 w-screen">
          {block.type === "chart" ? (
            <div className="min-w-full">
              <Chart content={block.content} />
            </div>
          ) : (
            <div className="prose prose-invert min-w-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {block.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatResponse;
