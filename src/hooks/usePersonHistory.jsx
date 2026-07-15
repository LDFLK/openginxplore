import { useQuery } from "@tanstack/react-query";
import { getPersonHistory } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const usePersonHistory = (personId) => {
    return useQuery({
        queryKey: ["personHistory", personId],
        queryFn: ({ signal }) =>
            getPersonHistory({ personId, signal }),
        enabled: !!personId,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
};