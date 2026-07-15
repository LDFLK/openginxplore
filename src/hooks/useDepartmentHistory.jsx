import { useQuery } from "@tanstack/react-query";
import { getDepartmentHistory } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const useDepartmentHistory = (departmentId) => {
    return useQuery({
        queryKey: ["departmentHistory", departmentId],
        queryFn: ({ signal }) =>
            getDepartmentHistory({ departmentId, signal }),
        enabled: !!departmentId,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
};
