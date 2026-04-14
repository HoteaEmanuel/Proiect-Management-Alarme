import React from "react";
import { Outlet } from "react-router-dom";
import Side from "../components/Side";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import "../styles/layouts/Rootlayout.css";

const Rootlayout = () => {
  return (
    <div className="root-layout">
      <Header />
      <div className="root-layout-body">
        <Side />
        <section className="root-layout-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Rootlayout;
