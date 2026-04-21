import { api } from "../../../lib/axios.js";
const VITE_URL_APP = import.meta.env.VITE_API_URL;

export const alarmsApi = {
  getAllAlerts: async () => {
    try {
      const response = await api.get(`${VITE_URL_APP}/alarms/resources`);
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
    if (filters?.type) url += "type=" + filters.type + "&&";
    if (filters?.summary) url += "summary_like=" + filters.summary + "&&";

    if(filters?.server) url += "server_name_like=" + filters.server+"&&";  
     if(filters?.alert_description) url += "alert_description_like=" + filters.alert_description+"&&";  
    url +=
      "current_page=" +
      (pagination.pageIndex + 1) +
      "&&page_size=" +
      pagination.pageSize;

    if (sorting[0]?.id)
      url +=
        "&&sort_by=" +
        sorting[0].id +
        "&&sort_order=" +
        (sorting[0].desc === false ? "asc" : "desc");
    console.log("URL: ");
    console.log(url);
    const response = await api.get(url);
    console.log(response);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get(`${VITE_URL_APP}/alarms/kpi-stats`);
    return response.data;
  },
};
