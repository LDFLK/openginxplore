import { useQuery } from "@tanstack/react-query";
import { getDepartmentsByPortfolio } from "../services/services";

export const useDepartmentsByPortfolio = (portfolioId, date) => {
  return useQuery({
    queryKey: ["departmentsByPortfolio", portfolioId, date],
    queryFn: ({ signal }) =>
      getDepartmentsByPortfolio({ portfolioId, date, signal }),
    enabled: !!portfolioId && !!date,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10,
  });
};