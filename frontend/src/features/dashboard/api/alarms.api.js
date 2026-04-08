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

  getFilteredAlarms: async ({ filters, pagination, sorting }) => {
    console.log("FILTERS: ", filters);
    console.log(pagination);
    console.log(sorting[0]);
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

    if(sorting[0]?.id) url+="&&sort_by="+sorting[0].id+"&&sort_order=" +(sorting[0].desc===false ? "asc":"desc");

    console.log(url);
    const response = await api.get(url);
    console.log(response);
    return response.data;
  },
};
