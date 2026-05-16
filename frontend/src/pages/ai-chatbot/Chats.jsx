import React, { useState, useMemo } from "react";
import { useGetUserConversations } from "../../features/ai/api/chatBot.api.js";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input.jsx";
import LoadingCircle from "../../components/LoadingCircle.jsx";

import { CiSearch } from "react-icons/ci";

import "@styles/pages/ai-chatbot/Chats.css";

const Chats = () => {
  const navigate = useNavigate();
  const { data: chats = [], isPending } = useGetUserConversations();
  const [search, setSearch] = useState("");
  console.log(chats);
  const filtered = useMemo(
    () =>
      chats.filter((chat) =>
        chat.conversation_title
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [chats, search],
  );

  if (isPending) return <LoadingCircle />;
  console.log(search);

  return (
    <div className="chats-page">
      <div className="chats-container">
        {chats.conversations?.length === 0 ? (
          <p className="chats-empty-message"> No chats yet </p>
        ) : (
          <h1 className="chats-title">
            Search your chats
          </h1>
        )}

        <div className="chats-search-wrapper">
          <Input
            placeholder={"Search any chat..."}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="chats-search-icon-wrapper">
            <CiSearch className="chats-search-icon" />
          </div>
        </div>

        {chats?.length > 0 && (
          <ol className="chats-list">
            {filtered.map((conversation, index) => (
              <li
                key={index}
                className="chats-list-item"
                onClick={() => navigate(`/chat/${conversation.conversation_id}`)}
              >
                {conversation.conversation_title}
              </li>
            ))}
            {filtered.length === 0 && (
              <p className="chats-empty-message">No chats available</p>
            )}
          </ol>
        )}
      </div>
    </div>
  );
};

export default Chats;