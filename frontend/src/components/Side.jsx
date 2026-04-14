import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import "../styles/components/Side.css";

const Side = () => {
  const navigate = useNavigate();

  return (
    <aside className="side">
      <h1 className="side-title">Alarm Manager</h1>

      <nav className="side-nav">
        <button
          type="button"
          className="side-nav-item"
          onClick={() => navigate("/dashboard")}
        >
          <MdDashboard className="side-nav-icon" />
          <span className="side-nav-text">Dashboard</span>
        </button>

        <button
          type="button"
          className="side-nav-item"
          onClick={() => navigate("/dashboard/statistics")}
        >
          <IoIosStats className="side-nav-icon" />
          <span className="side-nav-text">Statistics</span>
        </button>

        <button
          type="button"
          className="side-nav-item"
        >
          <IoIosChatboxes className="side-nav-icon" />
          <span className="side-nav-text">Chats</span>
        </button>

        <button
          type="button"
          className="side-nav-item"
          onClick={() => navigate("/settings")}
        >
          <IoMdSettings className="side-nav-icon" />
          <span className="side-nav-text">Settings</span>
        </button>
      </nav>
    </aside>
  );
};

export default Side;