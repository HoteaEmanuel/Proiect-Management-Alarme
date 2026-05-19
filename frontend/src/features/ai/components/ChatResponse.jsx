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

import "@styles/features/ai/components/ChatResponse.css";
import useChatStore from "@store/chatStore";
import useScrollAnimation from "@hooks/useScrollAnimation.js";
import { useFilePreview } from "@store/filePreviewStore";

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
    return <p className="chat-response-error">Invalid chart data</p>;
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
    <div className="chat-response-chart-card">
      {title && <p className="chat-response-chart-title">{title}</p>}
      <div ref={chartRef} className="chat-response-chart">
        <ResponsiveContainer
          width={"100%"}
          height={"100%"}
          className={"chat-response-chart-container"}
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

      <div className="chat-response-chart-actions">
        <div className="chat-response-chart-actions-inner">
          <ToolTip text={"Download as .png"}>
            <Button
              onClick={downloadPNG}
              className="chat-response-chart-download-button"
            >
              <GoDownload className="chat-response-chart-download-icon" />
            </Button>
          </ToolTip>
        </div>
      </div>
    </div>
  );
};

const ChatSuggestions = ({ suggestions }) => {

  const ref = useRef(null);
  useScrollAnimation(ref);

  const { setMessage } = useChatStore();

  if (suggestions === null || suggestions?.length === 0) return null;

  return (
    
    <div className="chat-suggestions-wrapper slide-hidden" ref={ref}>
      <ul className="chat-suggestions-list">
        {suggestions.map((item) => (
          <li key={item} className="chat-suggestions-item">
            <button
              type="button"
              className="chat-suggestions-button"
              onClick={() => setMessage(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChatResponse = ({
  blocks,
  showOptions,
  smart_replies,
  last_message,
  files = null,
}) => {
  const [copied, setCopied] = useState(false);
  const { speaking, speak, stop } = useSpeechSynthesis();
  console.log("BLOCKS");
  console.log(blocks);
  console.log(copied);
  const { file, setFile } = useFilePreview();
  const handleFileClick = (fileToPreview) => {
    if (file) setFile(null);
    else setFile(fileToPreview);
  };

  const handleCopy = async (message) => {
    try {
      const text = removeMarkdown(message); // Copiez mesajul eliminand markdown ul
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Feedback copiere
      const timeOutId = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timeOutId);
    } catch (err) {
      toast.error(err?.message || "Failed to copy");
    }
  };

  return (
    <div className="chat-response">
      {blocks.map((block, index) => (
        <div key={index} className="chat-response-block">
          {block.type === "chart" ? (
            <div className="chat-response-chart-wrapper">
              <Chart content={block.content} />
            </div>
          ) : (
            <div className="chat-response-markdown">
              <div className="chat-response-markdown-content">
                {block?.stopped ? (
                  <p className="whitespace-pre-wrap text-red-500">
                    {block.content}
                  </p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {block.content}
                  </ReactMarkdown>
                )}
              </div>
              {showOptions && (
                <div className="chat-response-options">
                  <div className="chat-response-options-inner">
                    <ToolTip text={speaking ? "Stop" : "Read loud"}>
                      <Button
                        onClick={() => {
                          if (speaking) {
                            stop();
                          } else {
                            speak(block.content);
                          }
                        }}
                        className="chat-response-action-button"
                      >
                        {speaking ? (
                          <FaStop className="chat-response-action-icon" />
                        ) : (
                          <AiFillSound className="chat-response-action-icon" />
                        )}
                      </Button>
                    </ToolTip>

                    {!copied && (
                      <ToolTip text={"Copy"}>
                        <Button
                          className="chat-response-copy-button"
                          onClick={() => handleCopy(block.content)}
                        >
                          <MdContentCopy className="chat-response-action-icon" />
                        </Button>
                      </ToolTip>
                    )}

                    {copied && (
                      <ToolTip text={"Copied succesfully"}>
                        <FaCheck className="chat-response-action-icon" />
                      </ToolTip>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {files && (
        <ul className="files-wrapper">
          {files.map((file) => (
            <li key={file?.public_id}>
              <File file={file} onClick={handleFileClick} />
            </li>
          ))}
        </ul>
      )}

      {smart_replies && last_message && (
        <ChatSuggestions suggestions={smart_replies} />
      )}
    </div>
  );
};

export default ChatResponse;
