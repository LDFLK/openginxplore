import { useQueries } from "@tanstack/react-query";
import {
  fetchAllCabinetMinistries,
  fetchAllDepartments,
  fetchAllPersons,
  fetchAllStateMinistries,
  fetchInitialGazetteData,
  fetchPresidentsData,
} from "../services/services";
import { GC_TIME } from "../constants/constants";

const bootstrapQuery = (key, queryFn, enabled) => ({
  queryKey: ["bootstrap", key],
  queryFn,
  enabled,
  staleTime: Infinity,
  gcTime: GC_TIME,
  retry: false,
});

export const useBootstrapData = ({ enabled }) => {
  const [persons, ministries, departments, gazetteDates] = useQueries({
    queries: [
      bootstrapQuery(
        "persons",
        async ({ signal }) => {
          const [personData, presidents] = await Promise.all([
            fetchAllPersons({ signal }),
            fetchPresidentsData(undefined, { signal }),
          ]);

          return {
            persons: personData?.body ?? [],
            presidents: presidents ?? [],
          };
        },
        enabled
      ),
      bootstrapQuery(
        "ministries",
        async ({ signal }) => {
          const [state, cabinet] = await Promise.all([
            fetchAllStateMinistries({ signal }),
            fetchAllCabinetMinistries({ signal }),
          ]);

          return { state, cabinet };
        },
        enabled
      ),
      bootstrapQuery(
        "departments",
        async ({ signal }) => fetchAllDepartments({ signal }),
        enabled
      ),
      bootstrapQuery(
        "gazetteDates",
        async ({ signal }) => fetchInitialGazetteData({ signal }),
        enabled
      ),
    ],
  });

  const queries = [persons, ministries, departments, gazetteDates];

  return {
    persons,
    ministries,
    departments,
    gazetteDates,
    isSettled: queries.every((query) => query.isSuccess || query.isError),
    isError: queries.some((query) => query.isError),
    error: queries.find((query) => query.error)?.error,
  };
};
