import { useEffect, useRef } from "react";
import { useMeetingsTrackerData } from "../../../hooks/useMeetingsTracker";
import { Loader2, Search } from "lucide-react";
import MeetingSectionHighlights from "./meetingSectionHighlights";
import { useNavigate } from "react-router-dom";
import MeetingStatCharts from "./MeetingStatCharts";

export default function MeetingsGrid() {

    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useMeetingsTrackerData(20);

    const navigate = useNavigate();
    const sentinelRef = useRef(null);

    // Flatten all pages into a single list
    const meetings = data?.pages?.flatMap((page) => page.data) ?? [];

    // IntersectionObserver — fires fetchNextPage when sentinel scrolls into view
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleTileClick = (meetingId) => {
        navigate(`ministry/${meetingId}`);
    };

    return (
        <>
            {/* title */}
            <h3 className="text-md lg:text-xl font-semibold mb-2 text-accent">
                Governance Tracking Initiative
            </h3>

            {/* charts */}
            <MeetingStatCharts />

            {/* key highlights */}
            <MeetingSectionHighlights />

            <div className="w-full p-3 bg-card border border-border mt-4 mb-4 rounded-md border-primary/10 transition-all">

                <div className="flex justify-between items-center">

                    <div className="text-md font-semibold text-accent">
                        Tracking Ministries
                    </div>

                    <form onSubmit={() => { }} className="max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                            <input
                                type="text"
                                value={''}
                                onChange={() => { }}
                                placeholder="Enter at least 2 characters..."
                                className="w-full pl-9 pr-3 py-1.5 md:py-2 text-xs md:text-sm bg-background border border-border rounded-md
                           text-primary placeholder:text-primary/50
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                           transition-colors"
                            />
                        </div>
                    </form>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] mt-4">
                        <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                        <p className="text-primary/70 text-sm md:text-md">Loading meetings...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
                            {meetings.map((meeting, index) => (
                                <div
                                    key={`${meeting.id}-${index}`}
                                    onClick={() => handleTileClick(meeting.id)}
                                    className="w-full rounded-sm border border-border bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex overflow-hidden group"
                                >
                                    <div className="w-1 bg-accent shrink-0"></div>
                                    <div className="p-4 flex flex-col gap-1 flex-1">
                                        <div className="flex items-start justify-between">
                                            <h1 className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                                                {meeting.title}
                                            </h1>
                                        </div>
                                        <div className="flex items-center justify-start mt-1">
                                            <p className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
                                                {meeting.track}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scroll sentinel — triggers next page load */}
                        <div ref={sentinelRef} className="mt-4 flex justify-center min-h-[40px]">
                            {isFetchingNextPage && (
                                <div className="flex items-center gap-2 text-primary/60 text-sm py-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading more...
                                </div>
                            )}
                            {!hasNextPage && meetings.length > 0 && (
                                <p className="text-xs text-primary/40 py-2">
                                    All {meetings.length} ministries loaded
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}