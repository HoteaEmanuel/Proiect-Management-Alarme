import { useQuery } from "@tanstack/react-query";
import { alarmsApi } from "../api/alarms.api";
export const useGetAllAlarms = () => {
  const { getAllAlerts } = alarmsApi;
  return useQuery({
    queryFn: () => getAllAlerts(),
    queryKey: ["alarms"],
  });
};

export const useGetFilteredAlarms=(filters)=>{
  const { getFilteredAlarms } = alarmsApi;
  return useQuery({
    queryFn:()=>getFilteredAlarms(filters),
    queryKey:["filtered_alarms"]
  })
}
