import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { Link} from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import "../styles/components/Side.css";

const Side = () => {

  return (
    <aside className="side">
      <h1 className="side-title">Alarm Monitoring</h1>

      <nav className="side-nav">
        <Link type="button" className="side-nav-item" to={"/dashboard"}>
          <MdDashboard className="side-nav-icon" />
          <span className="side-nav-text">Dashboard</span>
        </Link>

        <Link
          type="button"
          className="side-nav-item"
          // onClick={() => navigate("/dashboard/statistics")}
          to={"/dashboard/statistics"}
        >
          <IoIosStats className="side-nav-icon" />
          <span className="side-nav-text">Statistics</span>
        </Link>

        <Link type="button" className="side-nav-item" to={"/chat/new"}>
          <RiChatAiFill className="side-nav-icon" />
          <span className="side-nav-text">AI Assistant</span>
        </Link>

        <Link
          type="button"
          className="side-nav-item"
          to={'/settings'}
          // onClick={() => navigate("/settings")}
        >
          <IoMdSettings className="side-nav-icon" />
          <span className="side-nav-text">Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Side;
