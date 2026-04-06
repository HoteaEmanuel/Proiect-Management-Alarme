import React from "react";
import { Outlet } from "react-router-dom";
import Side from "../components/Side";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";

const Rootlayout = () => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="w-screen h-9/10 flex">
        <Side />
        <section className="w-full overflow-y-auto flex">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Rootlayout;
