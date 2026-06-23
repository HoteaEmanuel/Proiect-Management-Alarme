import React, { useEffect } from "react";
import useAuthStore from "@store/authStore.js";
import { authApi } from "../features/auth/api/auth.api";

const useCheckAuth = () => {
  const { clearAuth } = useAuthStore();
  useEffect(() => {
    authApi.me().catch(() => clearAuth());
  }, []);
};

export default useCheckAuth;
