import React from "react";
import { useAuthStore } from "../store/authStore";
import { Navigate, Outlet } from "react-router-dom";

const UnauthRoute = () => {
  const { user } = useAuthStore();
  console.log(user);
  if (user != null) return <Navigate to={"/dashboard"} />;
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default UnauthRoute;
