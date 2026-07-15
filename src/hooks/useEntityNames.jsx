import { useQuery } from "@tanstack/react-query";
import { getEntityNames } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const entityNamesQueryOptions = (entityIds) => ({
  queryKey: ["entityNames", entityIds],
  queryFn: ({ signal }) => getEntityNames({ entityIds, signal }),
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
});

export const useEntityNames = (entityIds) => {
  return useQuery({
    ...entityNamesQueryOptions(entityIds),
    enabled: Array.isArray(entityIds) && entityIds.length > 0,
  });
};
