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
};
