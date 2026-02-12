import { useQuery } from "@tanstack/react-query";
import { search } from "../services/searchServices";
import { STALE_TIME, GC_TIME } from "../constants/constants";

/**
 * React Query hook for searching entities
 * @param {string} query - Search query
 * @param {string} [type] - Filter by entity type
 * @returns {Object} React Query result object
 */
export const useSearch = (query, type = null) => {
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: ({ signal }) => search({ query, type, signal }),
    enabled: !!query && query.length >= 2,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};
