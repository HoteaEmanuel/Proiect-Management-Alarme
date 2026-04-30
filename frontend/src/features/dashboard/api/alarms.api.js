import { toast } from "sonner";
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

  getFilteredAlarms: async ({ filters }) => {
    console.log("FILTERS: ", filters);
    let url = `${VITE_URL_APP}/alarms/resources?`;
    if (filters?.startDate) url += "start_date=" + filters.startDate + "&&";
    if (filters?.endDate) url += "end_date=" + filters.endDate + "&&";
    if (filters?.status !== "All") url += "status=" + filters.status + "&&";
    if (filters?.severity !== "All")
      url += "severity=" + filters.severity + "&&";
    if (filters?.type !== "All") url += "type=" + filters.type + "&&";
    if (filters?.summary_like.trim().length)
      url += "summary_like=" + filters.summary_like + "&&";

    if (filters?.server_like.trim().length)
      url += "server_name_like=" + filters.server_like + "&&";
    if (filters?.description_like.trim().length)
      url += "alert_description_like=" + filters.description_like + "&&";
    url +=
      "current_page=" +
      (filters.pageIndex + 1) +
      "&&page_size=" +
      filters.pageSize;

    if (filters?.sort)
      url +=
        "&&sort_by=" +
        filters.sort +
        "&&sort_order=" +
        (filters.order === "asc" ? "asc" : "desc");
    console.log("URL: ");
    console.log(url);
    const response = await api.get(url);

    console.log(response);
    return response.data;
  },

  getStatistics: async (filters) => {
    let url = `${VITE_URL_APP}/alarms/kpi-stats?`;
    url += "start_date=" + filters.start_date + "&&";
    url += "end_date=" + filters.end_date;

    console.log("URL CALLED: ", url);
    const response = await api.get(url);
    return response.data;
  },
  export: async ({ filters }) => {
    try {
      let url = `${VITE_URL_APP}/alarms/export?`;
      if (filters?.startDate) url += "start_date=" + filters.startDate + "&&";
      if (filters?.endDate) url += "end_date=" + filters.endDate + "&&";
      if (filters?.status) url += "status=" + filters.status + "&&";
      if (filters?.severity) url += "severity=" + filters.severity + "&&";
      if (filters?.type) url += "type=" + filters.type + "&&";
      if (filters?.summary_like)
        url += "summary_like=" + filters.summary_like + "&&";

      if (filters?.server_like)
        url += "server_name_like=" + filters.server_like + "&&";
      if (filters?.description_like)
        url += "alert_description_like=" + filters.alert_description + "&&";
      url +=
        "current_page=" +
        (filters?.pageIndex + 1) +
        "&&page_size=" +
        filters.pageSize;

      if (filters.sort)
        url +=
          "&&sort_by=" +
          filters.sort +
          "&&sort_order=" +
          (filters.order === "desc" ? "desc" : "asc");
      const response = await api.get(url, {
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (e) {
      toast.error("Could not export");
      throw new Error(e);
    }
  },
};
