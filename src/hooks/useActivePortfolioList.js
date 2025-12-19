import { useQuery } from "@tanstack/react-query";
import { getActivePortfolioList } from "../services/services";

export const useActivePortfolioList = (presidentId, date) => {
  return useQuery({
    queryKey: ["activePortfolioList", presidentId, date],
    queryFn: ({ signal }) =>
      getActivePortfolioList({ presidentId, date, signal }),
    enabled: !!presidentId && !!date,
    staleTime: 1000 * 60 * 5, // data becomes stale, but still cached
    gcTime: 1000 * 60 * 10, // If no component uses the query, it gets garbage-collected after this
  });
};
