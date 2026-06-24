import { toast } from "sonner";
import { api } from "../../../lib/axios";
const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const authApi = {
  register: async (data) => {
    const response = await api.post(`${VITE_URL_APP}/auth/register`, data);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post(`${VITE_URL_APP}/auth/login`, credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post(`${VITE_URL_APP}/auth/logout`);
    return response.data;
  },
  refresh: async () => {
    const response = await api.get(`${VITE_URL_APP}/auth/refresh`);
    return response.data;
  },
  me: async () => {
    const response = await api.get(`${VITE_URL_APP}/auth/me`);
    return response.data;
  },
  changePassword: async ({ old_password, new_password }) => {
    const response = await api.put(`${VITE_URL_APP}/auth/change-password`, {
      old_password,
      new_password,
    });
    return response.data;
  },
};
