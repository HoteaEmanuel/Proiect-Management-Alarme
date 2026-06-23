import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RiChatAiFill } from "react-icons/ri";
import useAuthStore from "@store/authStore";
import { authApi } from "@features/auth/api/auth.api";
import "@styles/components/Side.css";

const Side = ({ isOpen, onNavigate }) =>
{
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log("SIDE OPEN? ", isOpen);

  const handleLogout = async () =>
  {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } catch (err) {
      console.log(err);
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate("/login");
    }
  };

  return (
  <>
    <aside className={`side ${isOpen ? "open" : ""}`}>
      <h1 className="side-title">Alarm Manager</h1>

      <nav className="side-nav">
        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/dashboard/" && "active"}`}
          to={"/dashboard"}
          onClick={onNavigate}
        >
          <MdDashboard className="side-nav-icon" />
          <span className="side-nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          type="button"
          className={`side-nav-item  ${pathname === "/statistics" && "active"}`}
          // onClick={() => navigate("/dashboard/statistics")}
          to={"/statistics"}
          onClick={onNavigate}
        >
          <IoIosStats className="side-nav-icon" />
          <span className="side-nav-text">Statistics</span>
        </NavLink>

        <NavLink
          type="button"
          className="side-nav-item"
          to={"/chat/new"}
          onClick={onNavigate}
        >
          {/* <RiChatAiFill className="side-nav-icon" /> */}
          <img
            src="/images/Nyx.png"
            alt="Assistant image"
            className="side-assistant-image"
          />
          <span className="side-nav-text">AI Assistant</span>
        </NavLink>

        <button
          type="button"
          className="side-nav-item side-nav-logout"
          onClick={() => setShowLogoutModal(true)}
        >
          <MdLogout className="side-nav-icon" />
          <span className="side-nav-text">Logout</span>
        </button>
      </nav>
    </aside>

    {showLogoutModal && (
      <div className="logout-modal-backdrop">
        <div className="logout-modal">
          <h2 className="logout-modal-title">Log out?</h2>

          <p className="logout-modal-text">
            Are you sure you want to log out?
          </p>

          <div className="logout-modal-actions">
            <button
              type="button"
              className="logout-modal-cancel"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </button>

            <Button
              type="button"
              className="logout-modal-confirm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default Side;