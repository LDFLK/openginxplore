import { meetings } from "../../../data/mockdata";
import { useMeetingsTrackerData } from "../../../hooks/useMeetingsTracker";
import { getEdgeColor } from "../../../utils/common_functions";
import { Loader2 } from "lucide-react";

export default function MeetingsGrid() {

    const { data, isLoading } = useMeetingsTrackerData();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] mt-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                <p className="text-primary/70 text-sm md:text-md">Loading meetings...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
            {
                data?.map((meeting, index) => {
                    return (
                        <div key={index} className="w-full rounded-sm border border-border  bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex overflow-hidden group">
                            <div className={`w-1 ${getEdgeColor(index)} shrink-0`}></div>
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
    )
}