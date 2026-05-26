import React, { useState, Suspense } from "react";
import Input from "../../components/Input.jsx";
import LoadingCircle from "../../components/LoadingCircle.jsx";

import { CiSearch } from "react-icons/ci";

import "@styles/pages/ai-chatbot/Chats.css";
import { Skeleton } from "@mui/material";
import ChatsList from "@features/ai/components/ChatsList.jsx";
import ChatsListSkeleton from "@features/ai/components/Skeletons/ChatsListSkeleton.jsx";
import { usePageTitle } from "@hooks/usePageTitle.js";
import useDebounce from "@hooks/useDebounce.js";

const Chats = () => {
  usePageTitle("Chats");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  return (
    <div className="chats-page">
      <div className="chats-container">
        {/* {chats.conversations?.length === 0 ? (
          <p className="chats-empty-message"> No chats yet </p>
        ) : (
          <h1 className="chats-title">Search your chats</h1>
        )} */}
        <h1 className="chats-title">Search your chats</h1>
        <div className="chats-search-wrapper">
          <Input
            placeholder={"Search any chat..."}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="chats-search-icon-wrapper">
            <CiSearch className="chats-search-icon" />
          </div>
        </div>
        <Suspense fallback={<ChatsListSkeleton />}>
          <ChatsList search={debouncedSearch} />
        </Suspense>
      </div>
    </div>
  );
};

export default Chats;
