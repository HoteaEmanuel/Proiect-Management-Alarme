import React, { useMemo, useRef } from "react";
import { useGetUserConversations } from "../api/chatBot.api";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
const ROW_HEIGHT = 56;
const ChatsList = ({ search }) => {
  const navigate = useNavigate();
  const { data: conversations = [] } = useGetUserConversations();
  const filtered = useMemo(
    () =>
      conversations.filter((chat) =>
        chat?.conversation_title
          ?.toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [conversations, search],
  );
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });
  return (
    <div className="w-full flex gap-1 flex-col items-center justify-center overflow-y-auto max-h-full">
      {conversations?.length === 0 && (
        <h1 className="conversation-side-empty">No chats yet!</h1>
      )}
      {filtered.length === 0 && (
        <p className="chats-empty-message">No chats found</p>
      )}
      {filtered.length > 0 && (
        <ol className="chats-list" ref={parentRef}>
          <li
            style={{
              position: "relative",
              width: "100%",
              height: virtualizer.getTotalSize(),
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const conv = filtered[virtualRow.index];

              return (
                <li
                  className="chats-list-item"
                  key={conv.conversation_id}
                  onClick={() => navigate(`/chat/${conv.conversation_id}`)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <span>{conv.conversation_title}</span>
                </li>
              );
            })}
          </li>
        </ol>
      )}
    </div>
  );
};

export default ChatsList;
