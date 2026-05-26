import { useQuery } from "@tanstack/react-query";
import { alarmsApi } from "../api/alarms.api";
export const useGetAllAlarms = () => {
  const { getAllAlerts } = alarmsApi;
  return useQuery({
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
  return useQuery({
    queryFn: async () => getAlarmsTrend(filters),
    queryKey: ["alarms-trend", filters],
  });
};

export const useGetHeapMap = (filters) => {
  const { getHeapMeap } = alarmsApi;
  return useQuery({
    queryFn: async () => getHeapMeap(filters),
    queryKey: ["alarms-heapmap", filters],
  });
};
