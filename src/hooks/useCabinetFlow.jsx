import { useQuery } from "@tanstack/react-query";
import { getCabinetFlow } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useCabinetFlow = (presidentId, dates) => {
  return useQuery({
    queryKey: ["cabinet-flow", presidentId, dates],
    queryFn: () => getCabinetFlow({ presidentId, dates }),
    enabled: !!presidentId && !!dates,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};