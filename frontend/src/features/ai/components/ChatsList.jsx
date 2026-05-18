import React, { useMemo } from "react";
import { useGetUserConversations } from "../api/chatBot.api";
import { useNavigate } from "react-router-dom";

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
  return (
    <div className="w-full flex gap-1 flex-col items-center justify-center overflow-y-auto max-h-full">
      {conversations?.length === 0 && (
        <h1 className="conversation-side-empty">No chats yet!</h1>
      )}
      {filtered.length === 0 && (
        <p className="chats-empty-message">No chats found</p>
      )}
      {filtered.length > 0 && (
        <ol className="chats-list">
          {filtered.map((conv) => (
            <li
              className="chats-list-item"
              key={conv.conversation_id}
              onClick={() => navigate(`/chat/${conv.conversation_id}`)}
            >
              <span>{conv.conversation_title}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default ChatsList;
