import { useQuery } from "@tanstack/react-query";
import { getPresidents } from "../services/services";
import { STALE_TIME, GC_TIME } from "../constants/constants";
import personImages from "../assets/personImages.json";

const toIsoTime = (date) => (date ? `${date}T00:00:00Z` : null);

const personImageMap = Object.fromEntries(
  personImages.map((img) => [img.personName.trim(), img])
);

export const usePresidents = () => {
  return useQuery({
    queryKey: ["presidents"],
    queryFn: ({ signal }) => getPresidents({ signal }),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,

    select: (data) => {
      // Oldest first: downstream code treats the last entry as the sitting president.
      const body = [...(data?.body ?? [])].sort(
        (a, b) =>
          new Date(a.tenureList?.[0]?.startDate ?? 0) -
          new Date(b.tenureList?.[0]?.startDate ?? 0)
      );

      // Cards: president identity plus the image/theme from the local asset.
      const presidentList = body.map((president) => {
        const imgData = personImageMap[president.name?.trim()];
        return {
          id: president.id,
          name: president.name,
          imageUrl: imgData?.imageUrl ?? null,
          themeColorLight: imgData?.themeColorLight ?? null,
        };
      });

      // Time range lookup: first and last tenure bound each president's term.
      const presidentRelationDict = {};
      body.forEach((president) => {
        const tenureList = president.tenureList ?? [];
        if (tenureList.length === 0) return;
        const first = tenureList[0];
        const last = tenureList[tenureList.length - 1];

        presidentRelationDict[president.id] = {
          id: president.id,
          startTime: toIsoTime(first?.startDate),
          endTime: toIsoTime(last?.endDate),
        };
      });

      // Gazette dots: every gazette across every president, merged per date.
      // A handover gazette appears in both the outgoing and incoming tenure,
      // so ids are collected into a Set to keep each one once.
      const gazetteMap = new Map();
      body.forEach((president) => {
        (president.tenureList ?? []).forEach((tenure) => {
          (tenure.gazetteList ?? []).forEach(({ date, idList }) => {
            if (!gazetteMap.has(date)) gazetteMap.set(date, new Set());
            const ids = gazetteMap.get(date);
            (idList ?? []).forEach((id) => ids.add(id));
          });
        });
      });

      const gazetteDataClassic = [...gazetteMap.entries()]
        .map(([date, ids]) => ({ date, gazetteId: [...ids] }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return { presidentList, presidentRelationDict, gazetteDataClassic };
    },
  });
};

export default usePresidents;
