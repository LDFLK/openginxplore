import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { STALE_TIME, GC_TIME } from "../constants/constants";
import { getMeetingMinistryBodies, getMeetingMinistryData, getMinistryMeetingHighlight, getMinistryMeetings } from "../services/meetingsTracker";

// meetings highlights data hook
export const useMeetingsHighlightData = () => {
    return useQuery({
        queryKey: ["ministryMeetingsHighlights"],
        queryFn: async ({ signal }) => {
            return await getMinistryMeetingHighlight({ signal })
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

// meetings ministries data hook — infinite scroll / pagination
export const useMeetingsMinistriesData = (pageSize = 20) => {
    return useInfiniteQuery({
        queryKey: ["meetingsMinistries", pageSize],
        queryFn: async ({ pageParam = 1, signal }) => {
            return await getMinistryMeetings({ page: pageParam, pageSize, signal });
        },
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.page + 1 : undefined,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
}

// meetings ministry bodies data hook - infinite scroll / pagination
export const useMeetingsMinistryBodiesData = (ministryId, pageSize = 20) => {
    return useInfiniteQuery({
        queryKey: ["meetingsMinistryBodies", ministryId, pageSize],
        queryFn: async ({ pageParam = 1, signal }) => {
            return await getMeetingMinistryBodies({ ministryId, page: pageParam, pageSize, signal });
        },
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.page + 1 : undefined,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
}

// meetings ministry data
export const useMeetingsMinistryData = (ministryId) => {
    return useQuery({
        queryKey: ["meetingsMinistry", ministryId],
        queryFn: async ({ signal }) => {
            return await getMeetingMinistryData({ ministryId, signal })
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

