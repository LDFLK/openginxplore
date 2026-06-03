import { useQuery } from "@tanstack/react-query";
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

// meetings data hook
export const useMeetingsTrackerData = () => {
    return useQuery({
        queryKey: ["ministryMeetings"],
        queryFn: async ({ signal }) => {
            return await getMinistryMeetings({ signal });
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });
}


