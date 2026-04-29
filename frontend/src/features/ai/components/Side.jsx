import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { SlOptions } from "react-icons/sl";
import { PiChatsCircleFill } from "react-icons/pi";
import "../../../styles/components/Side.css";
import {
  useGetUserConversations,
  useRenameConversation,
} from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
import Input from "@components/Input";
import { BsCloudFogFill } from "react-icons/bs";
const Side = () => {
  const { pathname } = useLocation();
  const {
    data: conversations,
    isLoading,
    isPending,
  } = useGetUserConversations();

  const { mutate: renameConversation } = useRenameConversation();

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [position, setPosition] = useState({ top: 0 }); // folosit pentru positionarea modalului de optiuni
  const navigate = useNavigate();

  if (isLoading || isPending) return <p>Loading...</p>;
  console.log("EDITING");
  console.log(editValue);
  console.log(editingId);
  const handleRename = async (e) => {
    if (e.key === "Enter") {
      // rename(conv.id, editValue);
      await renameConversation({ conversationId: editingId, title: editValue });
      setEditingId(null);
    }
    if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleBlur = async () => {
    // rename(conv.id, editValue); // salvezi
    renameConversation(editingId, editValue);
    console.log("HELLO");
    setEditingId(null);

  };

  return (
    <aside className="side">
      <NavLink
        to={"/dashboard"}
        // className="flex items-center"
        className={`side-nav-item  ${pathname === "/" && "active"}`}
        type="button"
      >
        <IoMdArrowBack className="size-7" />
        Go back
      </NavLink>

      <nav className="side-nav flex flex-col h-[90%]">
        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/chat/new" && "active"}`}
          to={"/chat/new"}
        >
          <RiChatNewFill className="side-nav-icon" />
          <span className="side-nav-text">New chat</span>
        </NavLink>

        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/chats" && "active"}`}
          to={"/chats"}
        >
          <PiChatsCircleFill className="side-nav-icon" />
          <span className="side-nav-text">Chats</span>
        </NavLink>

        <hr />
        <h1 className="text-sm opacity-50">Recents</h1>
        {conversations?.length === 0 && <h1>No chats yet!</h1>}
        {conversations?.length > 0 && (
          <ul className="overflow-y-auto flex-1 flex flex-col gap-2 text-xs">
            {conversations.map((conv) =>
              editingId === conv.conversation_id ? (
                <li key={conv.conversation_id}>
                  <Input
                    autoFocus
                    handleChange={(e) => setEditValue(e.target.value)}
                    handleKeyDown={(e) => handleRename(e)}
                    handleBlur={() => handleBlur()}
                    maxSize={50}
                    defaultValue={editValue}
                    style={{ padding: 2, fontSize: 12 }}
                  />
                </li>
              ) : (
                <li
                  key={conv.conversation_id}
                  onClick={() => navigate(`/chat/${conv.conversation_id}`)}
                  onMouseEnter={() => setSelectedConversation(conv)}
                  // onMouseLeave={() => setSelectedChat(null)}
                  className={` cursor-pointer p-1 flex items-center justify-between gap-2`}
                >
                  <span className="truncate"> {conv.conversation_title}</span>
                  {selectedConversation?.conversation_id ===
                    conv.conversation_id && (
                    <SlOptions
                      className="size-3 hover:bg-black/50 hover:scale-120 p-0.5 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(true);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPosition({ top: rect.top });
                      }}
                    />
                  )}
                </li>
              ),
            )}
          </ul>
        )}

        {showOptions && (
          <OptionsModal
            clear={setSelectedConversation}
            showOptions={setShowOptions}
            setEditingId={setEditingId}
            setEditingValue={setEditValue}
            conversation={selectedConversation}
            position={position}
          />
        )}
      </nav>
    </aside>
  );
};

export default Side;
