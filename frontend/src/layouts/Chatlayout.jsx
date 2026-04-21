import React from "react";
import Header from "../components/Header";
import Side from "../features/ai/components/Side";
import { Outlet } from "react-router-dom";
const Chatlayout = () => {
  return (
      <div className="root-layout">
        <Header />
        <div className="root-layout-body">
          <Side />
          <section className="root-layout-content overflow-y-auto">
            <Outlet />
          </section>
        </div>
      </div>
  );
};

export default Chatlayout;
