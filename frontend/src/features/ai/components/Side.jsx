import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { SlOptions } from "react-icons/sl";
import { PiChatsCircleFill } from "react-icons/pi";
import "../../../styles/components/Side.css";
import { useGetUserChats } from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
const Side = () => {
  const { data: chats, isLoading, isPending } = useGetUserChats();
  const [selectedChat, setSelectedChat] = useState(undefined);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();
  if (isLoading || isPending) return <p>Loading...</p>;

  console.log("SIDE");
  console.log(chats);
  // if(chats?.data) console.log(chats.data)
  return (
    <aside className="side">
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

      <nav className="side-nav flex flex-col h-[90%]">
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
        {chats?.length === 0 && <h1>No chats yet!</h1>}
        {chats?.length > 0 && (
          <ul className="overflow-y-auto flex-1 flex flex-col gap-2 text-xs">
            {chats.map((chat, index) => (
              <li
                key={chat.conversation_id}
                onClick={() => navigate(`/chat/${chat.conversation_id}`)}
                onMouseEnter={() => setSelectedChat(chat.conversation_id)}
                onMouseLeave={() => setSelectedChat(null)}
                className={`${index % 2 ? "bg-gray-950" : "bg-gray-800"} cursor-pointer p-1 flex items-center gap-2`}
              >
                <span className="truncate"> {chat.conversation_title}</span>
                {selectedChat === chat.conversation_id && (
                  <SlOptions
                    className="size-3 hover:bg-black/50 p-0.5 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(true);
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        {showOptions && <OptionsModal />}
      </nav>
    </aside>
  );
};

export default Side;
