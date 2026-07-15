import { useQuery } from "@tanstack/react-query";
import { getDataCatalog } from "../services/xploredataServices";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useDataCatalog = (categoryIds = []) => {
    return useQuery({
        queryKey: ["dataCatalog", categoryIds],
        queryFn: ({ signal }) =>
            getDataCatalog({ categoryIds, signal }),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
};