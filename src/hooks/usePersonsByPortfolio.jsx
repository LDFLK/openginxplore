// hooks/usePersonsByPortfolio.js
import { useQuery } from "@tanstack/react-query";
import { getPersonsByPortfolio } from "../services/services";
import { GC_TIME, STALE_TIME } from "../constants/constants";

export const usePersonsByPortfolio = (portfolioId, date) => {
  return useQuery({
    queryKey: ["personsByPortfolio", portfolioId, date],
    queryFn: ({ signal }) => getPersonsByPortfolio({ portfolioId, date, signal }),
    enabled: !!portfolioId && !!date,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};