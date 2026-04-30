import axios from "axios";

import { useAuthStore } from "../store/authStore";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request in care trimitem acces tokenul stocat in localStorage
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteaza requestul si daca e unauthorized da request la refresh pentru a actualiza acces tokenul
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refreshClient.post("/auth/refresh");
        const newToken = refreshResponse.data.accessToken;
        const user = refreshResponse.data.user;
        console.log("REFRESH OK : ", newToken, user);
        useAuthStore.getState().setAuth(user, newToken);
        console.log("AICEA");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log("AICI S A AJUNS");
        return api(originalRequest);
      } catch (err) {
        // Refresh failed => log the user out
        // Refresh token expired or other problem
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);
