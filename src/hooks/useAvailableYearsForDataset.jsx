import { useQuery } from "@tanstack/react-query";
import { getAvailableYearsForDataset } from "../services/xploredataServices";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useAvailableYearsForDataset = (datasetIds = []) => {
    return useQuery({
        queryKey: ["availableYearsForDataset", datasetIds],
        queryFn: ({ signal }) =>
            getAvailableYearsForDataset({ datasetIds, signal }),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
};