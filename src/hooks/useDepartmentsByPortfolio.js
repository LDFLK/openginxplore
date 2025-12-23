import { useQuery } from "@tanstack/react-query";
import { getDepartmentsByPortfolio } from "../services/services";

const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const TEN_MINUTES_IN_MS = 1000 * 60 * 10;

export const useDepartmentsByPortfolio = (portfolioId, date) => {
  return useQuery({
    queryKey: ["departmentsByPortfolio", portfolioId, date],
    queryFn: ({ signal }) =>
      getDepartmentsByPortfolio({ portfolioId, date, signal }),
    enabled: !!portfolioId && !!date,
    staleTime: FIVE_MINUTES_IN_MS,
    gcTime: TEN_MINUTES_IN_MS,
  });
};