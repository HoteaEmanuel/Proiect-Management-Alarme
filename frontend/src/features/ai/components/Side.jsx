import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { PiChatsCircleFill } from "react-icons/pi";
import "../../../styles/components/Side.css";
import { useGetUserChats } from "../api/chatBot.api";
const Side = () => {
  const { data: chats, isLoading, isPending } = useGetUserChats();
const navigate=useNavigate();
  if (isLoading || isPending) return <p>Loading...</p>;
  
  console.log(chats);
  return (
    <aside className="side max-h-[90%] gap-1">
      <Link
        to={"/dashboard"}
        className="flex items-center"
        type="button"
        className="side-nav-item"
      >
        <IoMdArrowBack className="size-7" />
        Go back
      </Link>
      {/* <h1 className="side-title">AI Assistant</h1> */}

      <nav className="side-nav flex flex-col h-full">
        <Link type="button" className="side-nav-item" to={"/chat/new"}>
          <RiChatNewFill className="side-nav-icon" />
          <span className="side-nav-text">New chat</span>
        </Link>

        <Link type="button" className="side-nav-item" to={"/chats"}>
          <PiChatsCircleFill className="side-nav-icon" />
          <span className="side-nav-text">Chats</span>
        </Link>

        <hr />
        <h1 className="text-sm opacity-50">Recents</h1>
        {chats.data.conversations.length === 0 && <h1>No chats yet!</h1>}
        {chats.data.conversations.length > 0 && (
          <ul className="overflow-y-auto flex-1 flex flex-col gap-2 text-xs">
            {chats.data.conversations.map((chat,index) => (
              <li chat={chat.conversation_id} onClick={()=>navigate(`/chat/${chat.conversation_id}`)} className={`${index % 2 ? 'bg-gray-950' : 'bg-gray-800'} cursor-pointer hover:scale-105 p-1`}>Conversation id: {chat.conversation_id}</li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default Side;
