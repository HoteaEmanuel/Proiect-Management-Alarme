import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { alarmsApi } from "../api/alarms.api";
export const useGetAllAlarms = () => {
  const { getAllAlerts } = alarmsApi;
  return useSuspenseQuery({
    queryFn: () => getAllAlerts(),
    queryKey: ["alarms"],
  });
};

export const useGetFilteredAlarms = (filters) => {
  const { getFilteredAlarms } = alarmsApi;
  return useQuery({
    queryFn: () => getFilteredAlarms(filters),
    queryKey: ["filtered_alarms"],
    staleTime: 1000 * 30,
  });
};

export const useGetStatistics = () => {
  const { getStatistics } = alarmsApi;
  return useQuery({
    queryFn: () => getStatistics(),
    queryKey: ["statistics"],
    staleTime: 1000 * 30, // 30 sec
  });
};

export const useGetAlarmsTrend = (filters) => {
  console.log("TREND FILETERS");
  console.log(filters);
  const { getAlarmsTrend } = alarmsApi;
  return useSuspenseQuery({
    queryFn: async () => getAlarmsTrend(filters),
    queryKey: ["alarms-trend", filters],
  });
};

export const useGetHeatMap = (filters) => {
  const { getHeatMap } = alarmsApi;
  return useSuspenseQuery({
    queryFn: async () => getHeatMap(filters),
    queryKey: ["alarms-heapmap", filters],
  });
};
