import { useQuery } from "@tanstack/react-query";
import { getActivePortfolioList } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useActivePortfolioList = (presidentId, date) => {
  return useQuery({
    queryKey: ["activePortfolioList", presidentId, date],
    queryFn: ({ signal }) =>
      getActivePortfolioList({ presidentId, date, signal }),
    enabled: !!presidentId && !!date,
    staleTime: STALE_TIME, 
    gcTime: GC_TIME, 
  });
};
