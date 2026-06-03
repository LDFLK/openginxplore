import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { STALE_TIME, GC_TIME } from "../constants/constants";
import { getMinistryMeetingHighlight, getMinistryMeetings } from "../services/meetingsTracker";

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

// meetings data hook — infinite scroll / pagination
export const useMeetingsTrackerData = (pageSize = 20) => {
    return useInfiniteQuery({
        queryKey: ["ministryMeetings", pageSize],
        queryFn: async ({ pageParam = 1, signal }) => {
            return await getMinistryMeetings({ page: pageParam, pageSize, signal });
        },
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.page + 1 : undefined,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
}
