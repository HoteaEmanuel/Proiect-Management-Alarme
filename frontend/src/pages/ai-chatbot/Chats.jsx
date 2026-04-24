import React, {  useState, useMemo } from "react";
import { useGetUserChats } from "../../features/ai/api/chatBot.api.js";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input.jsx";
import LoadingCircle from "../../components/LoadingCircle.jsx";

const Chats = () => {
  const navigate = useNavigate();
  const { data: chats = [] } = useGetUserChats();
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
  // if (isPending) return <LoadingCircle />;

  console.log(search);
  return (
    <div className="w-full h-full flex flex-col items-center gap-10 p-10 ">
      {chats.conversations?.length === 0 ? (
        <p className="text-center"> No chats yet </p>
      ) : (
        <h1 className="text-center font-semibold text-3xl">
          Search your chats
        </h1>
      )}

      <Input
        placeholder={"Search any chat..."}
        onChange={(e) => setSearch(e.target.value)}
      />
      {chats?.length > 0 && (
        <ol className="flex flex-col w-full gap-2 overflow-y-auto">
          {filtered.map((conversation, index) => (
            <li
              key={index}
              className="w-full flex justify-center cursor-pointer bg-gray-900 p-1"
              onClick={() => navigate(`/chat/${conversation.conversation_id}`)}
            >
              {conversation.conversation_title}
            </li>
          ))}
          {filtered.length === 0 && (
            <p className="text-center font-semibold">No chats available</p>
          )}
        </ol>
      )}
    </div>
  );
};

export default Chats;
