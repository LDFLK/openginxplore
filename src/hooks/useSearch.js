import { useQuery } from "@tanstack/react-query";
import { search } from "../services/searchServices";
import { STALE_TIME, GC_TIME } from "../constants/constants";

/**
 * React Query hook for searching entities
 * @param {string} query - Search query
 * @param {string} [type] - Filter by entity type
 * @param {number} [limit=20] - Maximum results
 * @returns {Object} React Query result object
 */
export const useSearch = (query, type = null, limit = 20) => {
  return useQuery({
    queryKey: ["search", query, type, limit],
    queryFn: ({ signal }) => search({ query, type, limit, signal }),
    enabled: !!query && query.length >= 2,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};
