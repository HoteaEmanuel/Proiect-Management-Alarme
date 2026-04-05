import React from "react";
import { Outlet } from "react-router-dom";
import Side from "../components/Side";
import ProtectedRoute from "../components/ProtectedRoute";

const Rootlayout = () => {
  

  return (
      <div className="w-screen h-screen flex">
        <Side />
        <section className="w-full p-5 overflow-y-auto">
          <Outlet />
        </section>
      </div>
  );
};

export default Rootlayout;
