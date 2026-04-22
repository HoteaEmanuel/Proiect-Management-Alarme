import React from "react";
import { useGetUserChats } from "../../features/ai/api/chatBot.api.js";
import { useNavigate } from "react-router-dom";

const Chats = () => {
  const navigate = useNavigate();
  const { data: chats, isPending } = useGetUserChats();
  if (isPending) return <p>Loading...</p>;
  console.log(chats);
  console.log();
  return (
    <div className="w-screen h-screen">
      {chats.conversations?.length === 0 && (
        <p className="text-center"> No chats yet </p>
      )}
      {chats.conversations?.length > 0 && (
        <ul className="flex flex-col w-full gap-2">
          {chats?.conversations.map((conversation,index) => (
            <li
              key={index+100}
              className="w-full flex justify-center cursor-pointer bg-gray-900"
              onClick={() => navigate(`/chat/${conversation.conversation_id}`)}
            >
              {conversation.conversation_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Chats;
