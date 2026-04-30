import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import "@styles/components/Side.css"
const Side = () => {
  const { pathname } = useLocation();
  return (
    <aside className="side">
      <h1 className="side-title">Alarm Manager</h1>

      <nav className="side-nav">
        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/dashboard/" && "active"}`}
          to={"/dashboard"}
          isA
        >
          <MdDashboard className="side-nav-icon" />
          <span className="side-nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/statistics" && "active"}`}
          // onClick={() => navigate("/dashboard/statistics")}
          to={"/statistics"}
        >
          <IoIosStats className="side-nav-icon" />
          <span className="side-nav-text">Statistics</span>
        </NavLink>

        <NavLink type="button" className="side-nav-item" to={"/chat/new"}>
          <RiChatAiFill className="side-nav-icon" />
          <span className="side-nav-text">AI Assistant</span>
        </NavLink>

        <NavLink
          type="button"
          className="side-nav-item"
          to={"/settings"}
          // onClick={() => navigate("/settings")}
        >
          <IoMdSettings className="side-nav-icon" />
          <span className="side-nav-text">Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Side;
