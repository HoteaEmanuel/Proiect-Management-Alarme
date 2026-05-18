import React, { Suspense, useState} from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import {
  Link,
  NavLink,
  useLocation,
  useParams,
} from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { SlOptions } from "react-icons/sl";
import { PiChatsCircleFill } from "react-icons/pi";
import "@styles/components/Side.css";
import OptionsModal from "./OptionsModal";
import Input from "@components/Input";
import { BsCloudFogFill } from "react-icons/bs";
import ChatSkeleton from "./Skeletons/ChatSkeleton";
import ChatsSideList from "./ChatsSideList";
import ChatsListSkeleton from "./Skeletons/ChatsListSkeleton";

const Side = ({ isOpen, onNavigate }) =>
{
  const { pathname } = useLocation();
  const { id } = useParams();
  console.log("ID CONV");
  console.log(id);
  console.log("IS OPEN?");
  console.log(isOpen);
  console.log("NAVIGATIN");
  console.log(onNavigate);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [position, setPosition] = useState({ top: 0 }); // folosit pentru positionarea modalului de optiuni

  return (
    <aside className={`side chat-side ${isOpen ? "open" : ''}  `}>
      <NavLink
        to={"/dashboard"}
        className={`side-nav-item  ${pathname === "/" && "active"}`}
        type="button"
        onClick={onNavigate}
      >
        <IoMdArrowBack className="chat-side-back-icon" />
        Go back
      </NavLink>

      <nav className="side-nav chat-side-nav">
        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/chat/new" && "active"}`}
          to={"/chat/new"}
          onClick={onNavigate}
          // onClick={}
        >
          <RiChatNewFill className="side-nav-icon" />
          <span className="side-nav-text">New chat</span>
        </NavLink>

        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/chats" && "active"}`}
          to={"/chats"}
          onClick={onNavigate}
        >
          <PiChatsCircleFill className="side-nav-icon" />
          <span className="side-nav-text">Chats</span>
        </NavLink>

        <hr />
        <h1 className="chat-side-recents-title">Recents</h1>
        <Suspense fallback={<ChatsListSkeleton />}>
          <ChatsSideList onNavigate={onNavigate} />
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