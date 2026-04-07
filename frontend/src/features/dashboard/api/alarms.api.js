import axios from "axios";
import { api } from "../../../lib/axios.js";
const VITE_URL_APP = import.meta.env.VITE_API_URL;

export const alarmsApi = {
  getAllAlerts: async () => {
    try {
      const response = await api.get(`${VITE_URL_APP}/alarms`);
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  },

  getFilteredAlarms: async ({ filters, pagination }) => {
    console.log("FILTERS: ", filters);
    console.log(pagination);
    let url = `${VITE_URL_APP}/alarms/resources?`;
    if (filters?.startDate) url += "start_date=" + filters.startDate + "&&";
    if (filters?.endDate) url += "end_date=" + filters.endDate + "&&";
    if (filters?.status) url += "status=" + filters.status + "&&";
    if (filters?.severity) url += "severity=" + filters.severity + "&&";
    url +=
      "current_page=" +
      (pagination.pageIndex+1) +
      "&&page_size=" +
      pagination.pageSize;

    console.log(url);
    const response = await api.get(url);
    console.log(response);
    return response.data;
  },
};
