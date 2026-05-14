import React, { useState } from "react";
import Header from "../components/Header";
import Side from "../features/ai/components/Side";
import { Outlet } from "react-router-dom";
import "@styles/layouts/ChatLayout.css";
import ChatHeader from "@features/ai/components/ChatHeader";
import Backdrop from "@components/Backdrop";
import ChatMobileHeader from "@features/ai/components/ChatMobileHeader";
const Chatlayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggle = () => setIsSidebarOpen((prev) => !prev);
    const close = () => setIsSidebarOpen(false);
  return (
    <div className="chat-layout">
      <div className="chat-layout-body">
        
        <Side isOpen={isSidebarOpen} onNavigate={toggle}/>
        <Backdrop isOpen={isSidebarOpen} onClose={close} />
        <section className="chat-layout-content">
          {/* <ChatHeader isOpen={isSidebarOpen} onToggle={toggle} /> */}
          <ChatMobileHeader isOpen={isSidebarOpen} onToggle={toggle}/>
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Chatlayout;
