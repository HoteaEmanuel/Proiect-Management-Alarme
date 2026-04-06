import React, { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../features/auth/api/auth.api";

const useCheckAuth = () => {
  const { setUser, clearAuth } = useAuthStore();
  useEffect(() => {
    try {
      authApi.me();
    } catch (err) {
      clearAuth();
    }
  }, []);
};

export default useCheckAuth;
