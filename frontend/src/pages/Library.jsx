import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RiLoader2Fill } from "react-icons/ri";
import { CiFilter } from "react-icons/ci";
import { TbFilesOff } from "react-icons/tb";

import Button from "@components/Button";
import FileTypeIcon from "@components/FileTypeIcon";
import { getFileTypeVariant } from "../utils/fileType";
import { usePageTitle } from "@hooks/usePageTitle";
import { useGetLibraryFiles, useGetUserConversations } from "@features/ai/api/chatBot.api";
import { useFilePreview } from "@store/filePreviewStore";
import { formatDate } from "../utils/formatDate";
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
    if (groupBy === "conversation") key = file.conversation_title || "Untitled conversation";
    else if (groupBy === "file_format") key = (file.file_format || "unknown").toUpperCase();
    else key = formatDate(file.created_at).split(",")[0];

    groups[key] = groups[key] || [];
    groups[key].push(file);
    return groups;
  }, {});
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

  const groupedFiles = useMemo(() => groupFiles(files ?? [], groupBy), [files, groupBy]);

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

      <div className={`library-filters ${showFilters ? "library-filters-open" : ""}`}>
        <label className="library-filter">
          <span>From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>

        <label className="library-filter">
          <span>To</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>

        <label className="library-filter">
          <span>Format</span>
          <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
            <option value="">All</option>
            <option value="pdf">PDF</option>
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="docx">DOCX</option>
          </select>
        </label>

        <label className="library-filter">
          <span>Conversation</span>
          <select value={conversationId} onChange={(e) => setConversationId(e.target.value)}>
            <option value="">All</option>
            {conversations?.map((conversation) => (
              <option key={conversation.conversation_id} value={conversation.conversation_id}>
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

      <div className="library-content">
        {isPending && <RiLoader2Fill className="library-loader" />}

        {!isPending && files?.length === 0 && (
          <div className="library-empty">
            <h2 className="library-empty-title">No files found</h2>
            <p className="library-empty-text">Try adjusting your filters</p>
            <TbFilesOff className="library-empty-icon" />
          </div>
        )}

        {!isPending &&
          Object.entries(groupedFiles).map(([groupName, groupItems]) =>
            groupItems.length === 0 ? null : (
              <section key={groupName} className="library-group">
                <h2 className="library-group-title">{groupName}</h2>

                <ul className="library-list">
                  {groupItems.map((file) => (
                    <li key={file.url} className="library-item" onClick={() => setFile(file)}>
                      <div className={`library-file-type library-file-type-${getFileTypeVariant(file.file_format)}`}>
                        <FileTypeIcon type={file.file_format} />
                      </div>

                      <div className="library-file-content">
                        <span className="library-file-name">{file.filename}</span>
                        <span className="library-file-meta">
                          {formatDate(file.created_at)} ·{" "}
                          <Link
                            to={`/chat/${file.conversation_id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {file.conversation_title || "Untitled conversation"}
                          </Link>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )}
      </div>

      <FilePreview />
    </div>
  );
};

export default Library;
