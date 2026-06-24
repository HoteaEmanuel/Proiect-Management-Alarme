import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RiLoader2Fill } from "react-icons/ri";
import { CiFilter } from "react-icons/ci";
import { TbFilesOff } from "react-icons/tb";
import { useVirtualizer } from "@tanstack/react-virtual";

import Button from "@components/Button";
import FileTypeIcon from "@components/FileTypeIcon";
import { getFileTypeVariant } from "../../utils/fileType";
import { usePageTitle } from "@hooks/usePageTitle";
import {
  useGetLibraryFiles,
  useGetUserConversations,
} from "@features/ai/api/chatBot.api";
import { useFilePreview } from "@store/filePreviewStore";
import { formatDate } from "../../utils/formatDate";
import FilePreview from "@features/ai/components/FilePreview";

import "@styles/pages/Library.css";

const GROUP_OPTIONS = [
  { value: "none", label: "None" },
  { value: "conversation", label: "Conversation" },
  { value: "file_format", label: "Format" },
  { value: "date", label: "Date" },
];

const groupFiles = (files, groupBy) => {
  if (groupBy === "none") return { "All files": files };

  return files.reduce((groups, file) => {
    let key;
    if (groupBy === "conversation")
      key = file.conversation_title || "Untitled conversation";
    else if (groupBy === "file_format")
      key = (file.file_format || "unknown").toUpperCase();
    else key = formatDate(file.created_at).split(",")[0];

    groups[key] = groups[key] || [];
    groups[key].push(file);
    return groups;
  }, {});
};

const flattenGroups = (groupedFiles) => {
  const rows = [];

  for (const [groupName, groupItems] of Object.entries(groupedFiles)) {
    if (groupItems.length === 0) continue;

    rows.push({ type: "header", groupName });
    for (const file of groupItems) rows.push({ type: "file", file });
  }

  return rows;
};

const Library = () => {
  usePageTitle("Library");
  const { setFile } = useFilePreview();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      file_format: fileFormat || undefined,
      conversation_id: conversationId || undefined,
    }),
    [dateFrom, dateTo, fileFormat, conversationId],
  );

  const { data: files, isPending } = useGetLibraryFiles(filters);
  const { data: conversations } = useGetUserConversations();

  const groupedFiles = useMemo(
    () => groupFiles(files ?? [], groupBy),
    [files, groupBy],
  );
  const rows = useMemo(() => flattenGroups(groupedFiles), [groupedFiles]);

  const scrollRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => (rows[index]?.type === "header" ? 32 : 64),
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 8,
  });

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title">Library</h1>

        <Button
          className="library-filters-toggle"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <CiFilter className="library-filters-toggle-icon" />
          Filters
        </Button>
      </div>

      <div
        className={`library-filters ${showFilters ? "library-filters-open" : ""}`}
      >
        <label className="library-filter">
          <span>From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>

        <label className="library-filter">
          <span>To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>

        <label className="library-filter">
          <span>Format</span>
          <select
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
          >
            <option value="">All</option>
            <option value="pdf">PDF</option>
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="docx">DOCX</option>
          </select>
        </label>

        <label className="library-filter">
          <span>Conversation</span>
          <select
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
          >
            <option value="">All</option>
            {conversations?.map((conversation) => (
              <option
                key={conversation.conversation_id}
                value={conversation.conversation_id}
              >
                {conversation.conversation_title || "Untitled conversation"}
              </option>
            ))}
          </select>
        </label>

        <label className="library-filter">
          <span>Group by</span>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            {GROUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="library-content" ref={scrollRef}>
        {isPending && <RiLoader2Fill className="library-loader" />}

        {!isPending && files?.length === 0 && (
          <div className="library-empty">
            <h2 className="library-empty-title">No files found</h2>
            <p className="library-empty-text">Try adjusting your filters</p>
            <TbFilesOff className="library-empty-icon" />
          </div>
        )}

        {!isPending && rows.length > 0 && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: virtualizer.getTotalSize(),
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    paddingBottom: row.type === "header" ? 0 : "0.5rem",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.type === "header" ? (
                    <h2 className="library-group-title">{row.groupName}</h2>
                  ) : (
                    <ul className="library-list">
                      <li
                        className="library-item"
                        onClick={() => setFile(row.file)}
                      >
                        <div
                          className={`library-file-type library-file-type-${getFileTypeVariant(row.file.file_format)}`}
                        >
                          <FileTypeIcon type={row.file.file_format} />
                        </div>

                        <div className="library-file-content">
                          <span className="library-file-name">
                            {row.file.filename}
                          </span>
                          <span className="library-file-meta">
                            {formatDate(row.file.created_at)} ·{" "}
                            <Link
                              to={`/chat/${row.file.conversation_id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {row.file.conversation_title ||
                                "Untitled conversation"}
                            </Link>
                          </span>
                        </div>
                      </li>
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FilePreview />
    </div>
  );
};

export default Library;
