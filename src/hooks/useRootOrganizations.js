import { useQueries } from "@tanstack/react-query";
import { getRootOrganization } from "../services/xploredataServices";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useRootOrganizations = (datasetIds = []) => {
    const queries = useQueries({
        queries: datasetIds.map((datasetId) => ({
            queryKey: ["datasetRootOrganization", datasetId],
            queryFn: ({ signal }) => getRootOrganization({ datasetId, signal }),
            enabled: !!datasetId,
            staleTime: STALE_TIME,
            gcTime: GC_TIME,
        })),
    });

    // Extract data and loading states
    const isLoading = queries.some((query) => query.isLoading);
    const isError = queries.some((query) => query.isError);
    const data = queries.map((query) => query.data).filter(Boolean);

    return { data, isLoading, isError, queries };
};
