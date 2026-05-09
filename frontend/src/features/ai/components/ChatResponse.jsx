import ReactMarkdown from "react-markdown";
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

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
];

const Chart = ({ content }) => {
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
    <div className="my-4  w-1/2 flex  flex-col items-center justify-center">
      {title && (
        <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
      )}
      <ResponsiveContainer width={"100%"} height={280}>
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
