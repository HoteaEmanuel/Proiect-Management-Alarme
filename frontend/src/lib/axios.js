import axios from "axios";

import { useAuthStore } from "../store/authStore";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials:true
});
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Request in care trimitem acces okenul stocat in localStorage
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry && !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshResponse = await refreshClient.post("/auth/refresh");

      const newToken = refreshResponse.data.accessToken;

      useAuthStore().getState().setAccesToken(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);





