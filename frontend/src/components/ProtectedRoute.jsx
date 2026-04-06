import React from "react";
import { useAuthStore } from "../store/authStore";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, accessToken } = useAuthStore();

  console.log(user,accessToken);
  if (user == null) return <Navigate to={"/login"} />;
  return <div>
    <Outlet/>
  </div>
};

export default ProtectedRoute;
