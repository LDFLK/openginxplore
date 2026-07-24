import { useQuery } from "@tanstack/react-query";
import { getBodiesByDepartment } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const bodiesByDepartmentQueryOptions = (departmentId) => ({
  queryKey: ["bodiesByDepartment", departmentId],
  queryFn: ({ signal }) =>
    getBodiesByDepartment({ departmentId, signal }),
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
});

export const useBodiesByDepartment = (departmentId) => {
  return useQuery({
    ...bodiesByDepartmentQueryOptions(departmentId),
    enabled: !!departmentId,
  });
};
