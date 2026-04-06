import { api } from "../../../lib/axios";
const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const authApi = {
  register: async (data) => {
    const response = await api.post(`${VITE_URL_APP}/auth/register`, data);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post(`${VITE_URL_APP}/auth/login`, credentials);
    console.log(response);
    return response.data;
  },
  refresh: async () => {
    const response = await api.get(`${VITE_URL_APP}/auth/refresh`);
    console.log(response);
    return response.data;
  },
  me: async () => {
    const response = await api.get(`${VITE_URL_APP}/auth/me`);
    return response.data;
  },
};
