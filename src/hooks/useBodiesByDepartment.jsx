import { useQuery } from "@tanstack/react-query";
import { getBodiesByDepartment } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";

export const bodiesByDepartmentQueryOptions = (departmentId, date) => ({
  queryKey: ["bodiesByDepartment", departmentId, date],
  queryFn: ({ signal }) =>
    getBodiesByDepartment({ departmentId, date, signal }),
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
});

export const useBodiesByDepartment = (departmentId, date) => {
  return useQuery({
    ...bodiesByDepartmentQueryOptions(departmentId, date),
    enabled: !!departmentId && !!date,
  });
};
