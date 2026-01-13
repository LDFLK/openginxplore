import { useQuery } from "@tanstack/react-query";
import { getPrimeMinister } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";
import personImages from "../assets/personImages.json";

export const usePrimeMinister = (date) => {
  return useQuery({
    queryKey: ["primeMinister", date],
    queryFn: ({ signal }) =>
      getPrimeMinister({ date, signal }),
    enabled: !!date,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,

    select: (data) => {
      const person = data?.body;
      if (!person?.name) return data;

      const found = personImages.find(
        (img) => img.presidentName.trim() === person.name.trim()
      );

      if (!found?.imageUrl) return data;

      return {
        ...data,
        body: {
          ...person,
          imageUrl: found.imageUrl,
        },
      };
    },
  });
};
