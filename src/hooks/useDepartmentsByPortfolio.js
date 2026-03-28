import { useQuery } from "@tanstack/react-query";
import { getDepartmentsByPortfolio } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const departmentsByPortfolioQueryOptions = (portfolioId, date) => ({
  queryKey: ["departmentsByPortfolio", portfolioId, date],
  queryFn: ({ signal }) =>
    getDepartmentsByPortfolio({ portfolioId, date, signal }),
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
});

export const useDepartmentsByPortfolio = (portfolioId, date) => {
  return useQuery({
    ...departmentsByPortfolioQueryOptions(portfolioId, date),
    enabled: !!portfolioId && !!date,
  });
};