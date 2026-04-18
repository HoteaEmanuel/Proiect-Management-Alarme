import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { Link } from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { PiChatsCircleFill } from "react-icons/pi";
import "../../../styles/components/Side.css";
const Side = () => {
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

      <nav className="side-nav">
        <Link type="button" className="side-nav-item" to={"/chat/new"}>
          <RiChatNewFill className="side-nav-icon" />
          <span className="side-nav-text">New chat</span>
        </Link>

        <Link type="button" className="side-nav-item" to={"/chats"}>
          <PiChatsCircleFill className="side-nav-icon" />
          <span className="side-nav-text">Chats</span>
        </Link>

        <hr />
        <h1 className="text-sm">Recent chats</h1>
      </nav>
    </aside>
  );
};

export default Side;
