import React from "react";
import Header from "../components/Header";
import Side from "../features/ai/components/Side";
import { Outlet } from "react-router-dom";
import "@styles/layouts/ChatLayout.css";
import ChatHeader from "@features/ai/components/ChatHeader";

const Chatlayout = () => {
  return (
    <div className="chat-layout">
      <div className="chat-layout-body">
        <Side />
        <section className="chat-layout-content">
          {/* <ChatHeader /> */}
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Chatlayout;
