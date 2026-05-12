import ReactMarkdown from "react-markdown";
import { useRef, useState } from "react";
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
import { GoDownload } from "react-icons/go";
import { toPng } from "html-to-image";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import { FaPlay, FaStop } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";
import removeMarkdown from "remove-markdown";
import File from "./File";

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
    >
      {title && (
        <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
      )}
      <div
        ref={chartRef}
        style={{
          width: "800px",
          height: "500px",
        }}
      >
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
      </div>

      <div className="relative bg-red-500 w-full">
        <div className="absolute bottom-0 right-0">
          <ToolTip text={"Download as .png"}>
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

const ChatResponse = ({
  blocks,
  showOptions,
  onFileClick,
  previewFile,
  file = null,
}) => {
  console.log("BLOCKS");
  console.log(blocks);
  console.log("FILE HE");
  console.log(file);
  const [copied, setCopied] = useState(false);
  const { speaking, speak, stop } = useSpeechSynthesis();

  console.log("SPEAKING");
  console.log(speaking);

  console.log("COPIED");
  console.log(copied);

  const handleFileClick = (file) => {
    if (previewFile) onFileClick(null);
    else onFileClick(file);
  };

  const handleCopy = async (message) => {
    try {
      const text = removeMarkdown(message); // Copiez mesajul eliminand markdown ul
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Feedback copiere
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error(err?.message || "Failed to copy");
    }
  };
  return (
    <div className="min-w-0 w-full">
      {file && <File file={file} onClick={handleFileClick} />}
      {blocks.map((block, index) => (
        <div key={index} className="">
          {block.type === "chart" ? (
            <div className="w-screen">
              <Chart content={block.content} />
            </div>
          ) : (
            <div className="prose prose-invert min-w-0 pb-5">
              <div className="mb-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.content}
                </ReactMarkdown>
              </div>
              {showOptions && (
                <div className="relative">
                  <div className="absolute flex gap-2">
                    <ToolTip text={speaking ? "Stop" : "Read loud"}>
                      <Button
                        onClick={() => {
                          if (speaking) {
                            stop();
                          } else {
                            speak(block.content);
                          }
                        }}
                        className="cursor-pointer hover:scale-120 text-white/80"
                      >
                        {speaking ? (
                          <FaStop className="size-4" />
                        ) : (
                          <AiFillSound className="size-4" />
                        )}
                      </Button>
                    </ToolTip>

                    {!copied && (
                      <ToolTip text={"Copy"}>
                        <Button
                          className="cursor-pointer hover:scale-125 hover:bg-gray-800  p-1 rounded-full"
                          onClick={() => handleCopy(block.content)}
                        >
                          <MdContentCopy className="size-4  " />
                        </Button>
                      </ToolTip>
                    )}

                    {copied && (
                      <ToolTip text={"Copied succesfully"}>
                        <FaCheck className="size-4" />
                      </ToolTip>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatResponse;
