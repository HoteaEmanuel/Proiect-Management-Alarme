import axios from "axios";
import { api } from "../../../lib/axios.js";
const VITE_URL_APP = import.meta.env.VITE_API_URL;

export const alarmsApi = {
  getAllAlerts: async () => {
    try {
      console.log("QUERY FIRED");
      console.log(VITE_URL_APP);
      const response = await api.get(`${VITE_URL_APP}/alarms`);

      console.log(response);
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  },
};
