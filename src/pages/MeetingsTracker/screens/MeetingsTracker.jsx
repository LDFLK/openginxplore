import MeetingSectionHighlights from "../components/meetingSectionHighlights";
import MeetingsGrid from "../components/meetingsGrid";


export default function MeetingsTracker() {

    return (
        <div className="p-2 lg:p-4">
            <div className="bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-sm border border-border">
                {/* title */}
                <h3 className="text-sm lg:text-lg font-semibold text-primary">
                    Governance Tracking initiative
                </h3>

                {/* key highlights */}
                <MeetingSectionHighlights />

                {/* meetings grid */}
                <MeetingsGrid />

            </div>

        </div>
    )
}