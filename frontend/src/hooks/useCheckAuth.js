import React, { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../features/auth/api/auth.api";

const useCheckAuth = () => {
  const { setUser, clearAuth } = useAuthStore();

  console.log("AICI")
  useEffect(() => {
    authApi.me();
  }, []);
};

export default useCheckAuth;
