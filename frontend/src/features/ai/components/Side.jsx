import React, { Suspense, useState, useTransition } from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { SlOptions } from "react-icons/sl";
import { PiChatsCircleFill } from "react-icons/pi";
import "@styles/components/Side.css";
import {
  useGetUserConversations,
  useRenameConversation,
} from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
import Input from "@components/Input";
import { BsCloudFogFill } from "react-icons/bs";
import useChatStore from "@store/chatStore";
import ChatSkeleton from "./Skeletons/ChatSkeleton";
import ConversationSideList from "./ConversationSideList";
import ConversationListSkeleton from "./Skeletons/ConversationListSkeleton";
const Side = () => {
  const { pathname } = useLocation();
  const { id } = useParams();
  console.log("ID CONV");
  console.log(id);

  const { mutateAsync: renameConversation } = useRenameConversation();

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [position, setPosition] = useState({ top: 0 }); // folosit pentru positionarea modalului de optiuni
  const navigate = useNavigate();
  const handleRename = async (e) => {
    if (e.key === "Enter") {
      await renameConversation({
        conversationId: editingId,
        new_title: editValue,
      });
      setEditingId(null);
    }
    if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleBlur = async () => {
    await renameConversation(editingId, editValue);
    setEditingId(null);
  };

  const handleNavigateToConversation = (conversation) => {
    console.log("NAVIGATIN");
    console.log(conversation);
    return navigate(`/chat/${conversation.conversation_id}`);
  };

  // if (isLoading || isPending) return <p>Loading...</p>; //! Implement loading skeletons

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
        <Suspense fallback={<ConversationListSkeleton />}>
          <ConversationSideList />
        </Suspense>

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
