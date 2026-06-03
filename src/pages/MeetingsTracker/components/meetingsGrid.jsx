import { useMeetingsTrackerData } from "../../../hooks/useMeetingsTracker";
import { getEdgeColor } from "../../../utils/common_functions";
import { Loader2, Search } from "lucide-react";
import MeetingSectionHighlights from "./meetingSectionHighlights";
import { useNavigate } from "react-router-dom";
import MeetingStatCharts from "./MeetingStatCharts";

export default function MeetingsGrid() {

    const { data, isLoading } = useMeetingsTrackerData();
    const navigate = useNavigate();


    const handleTileClick = (meetingId) => {
        navigate(`ministry/${meetingId}`);
    }
    return (
        <div>
            {/* charts */}
            <MeetingStatCharts />

            {/* key highlights */}
            <MeetingSectionHighlights />

            <form onSubmit={() => { }} className="max-w-xs ml-auto mb-4">
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
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] mt-4">
                    <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                    <p className="text-primary/70 text-sm md:text-md">Loading meetings...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
                    {
                        data?.map((meeting, index) => {
                            return (
                                <div key={index} onClick={() => handleTileClick(meeting.id)} className="w-full rounded-sm border border-border  bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex overflow-hidden group">
                                    <div className={`w-1 bg-accent shrink-0`}></div>
                                    <div className="p-4 flex flex-col gap-1 flex-1">
                                        <div className="flex items-start justify-between">
                                            <h1 className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors">{meeting.title}</h1>
                                        </div>
                                        <div className="flex items-center justify-start mt-1">
                                            <p className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
                                                {meeting.track}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            )}
        </div>
    )
}