import { useQuery } from "@tanstack/react-query";
import { alarmsApi } from "../api/alarms.api";
export const useGetAllAlarms = () => {
  const { getAllAlerts } = alarmsApi;
  return useQuery({
    queryFn: () => getAllAlerts(),
    queryKey: ["alarms"],
  });
};
