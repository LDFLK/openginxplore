import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getDatasetById } from "../services/xploredataServices";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useGetDatasetsByYears = (selectedYears = [], yearToDatasetId = {}) => {
    // Fetch datasets for all selected years
    const queries = useQueries({
        queries: selectedYears.map((year) => {
            const datasetId = yearToDatasetId[year];
            return {
                queryKey: ["dataset", datasetId],
                queryFn: ({ signal }) => getDatasetById({ datasetId, signal }),
                staleTime: STALE_TIME,
                gcTime: GC_TIME,
                enabled: !!datasetId, // Only fetch if datasetId exists
            };
        }),
    });

    // Transform query results into fetchedDatasets format
    const fetchedDatasets = useMemo(() => {
        if (selectedYears.length === 0) return [];

        return selectedYears
            .map((year, index) => {
                const query = queries[index];
                if (!query?.data) return null;
                return {
                    year,
                    data: query.data.data,
                };
            })
            .filter(Boolean);
    }, [selectedYears, queries]);

    // Check if any query is loading
    const isAnyLoading = queries.some((query) => query.isLoading);

    // Get the current loading year (first loading query)
    const loadingYear = useMemo(() => {
        const loadingIndex = queries.findIndex((query) => query.isLoading);
        return loadingIndex !== -1 ? selectedYears[loadingIndex] : null;
    }, [queries, selectedYears]);

    return {
        fetchedDatasets,
        loadingYear,
        isAnyLoading
    };
};
