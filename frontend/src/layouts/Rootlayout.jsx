import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Side from "../components/Side";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import "../styles/layouts/Rootlayout.css";
import Backdrop from "@components/Backdrop";

const Rootlayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggle = () => setIsSidebarOpen((prev) => !prev);
  const close = () => setIsSidebarOpen(false);
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  return (
    <div className="root-layout">
      <Header onToggle={toggle} isSideBarOpen={isSidebarOpen} />
      <div className="root-layout-body">
        <Side isOpen={isSidebarOpen} onNavigate={toggle} />
        <Backdrop isOpen={isSidebarOpen} onClose={close} />
        <section className="root-layout-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Rootlayout;
