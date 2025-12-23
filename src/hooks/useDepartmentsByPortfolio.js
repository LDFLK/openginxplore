import { useQuery } from "@tanstack/react-query";
import { getDepartmentsByPortfolio } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useDepartmentsByPortfolio = (portfolioId, date) => {
  return useQuery({
    queryKey: ["departmentsByPortfolio", portfolioId, date],
    queryFn: ({ signal }) =>
      getDepartmentsByPortfolio({ portfolioId, date, signal }),
    enabled: !!portfolioId && !!date,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};