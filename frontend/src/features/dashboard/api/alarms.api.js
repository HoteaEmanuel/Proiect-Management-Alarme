import { toast } from "sonner";
import { api } from "../../../lib/axios.js";
import { useQuery } from "@tanstack/react-query";
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

    console.log("ALARME DIN RESPONSE");
    console.log(response.data);
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
      toast.error(e?.message || "Could not export");
      throw new Error(e);
    }
  },

  // cere lista de alarme de la o o bucata din grafic, format json, pt popup
  getChartDetails: async ({ category, label, start_date, end_date }) => {
    const response = await api.get(`${VITE_URL_APP}/alarms/chart-details`, {
      params: { category, label, start_date, end_date },
    });
    return response.data;
  },
  // la fel dar Excel, pt descarcare
  exportChartDetails: async ({ category, label, start_date, end_date }) => {
    const response = await api.get(`${VITE_URL_APP}/alarms/chart-details`, {
      params: { category, label, start_date, end_date, export: true },
      responseType: "arraybuffer",
    });
    return response.data;
  },

  getAlarmsTrend: async (filters) => {
    console.log("FILTERES HERE BABY");
    console.log(filters.granularity);
    console.log(filters.group_by);
    try {
      const response = await api.get(
        `${VITE_URL_APP}/alarms/stats/alarm-trend`,
        {
          params: {
            granularity: filters.granularity,
            group_by: filters.group_by,
          },
        },
      );
      return response.data;
    } catch (error) {
      toast.error(error?.message || "Fetching alarms failed");
    }
  },

  getHeatMeap: async (filters) => {
    try {
      const response = await api.get(`${VITE_URL_APP}/alarms/stats/heatmap`, {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date,
          severity: filters.severity || "critical",
        },
      });
      return response.data;
    } catch (error) {
      toast.error(error?.message || "Fetching alarms failed");
    }
  },
};
