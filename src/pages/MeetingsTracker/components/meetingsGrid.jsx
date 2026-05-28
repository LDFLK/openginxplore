import { meetings } from "../../../data/mockdata";

export default function MeetingsGrid() {

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
            {
                meetings.map((meeting, index) => {
                    return (
                        <div key={index} className="w-full rounded-sm border border-border bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex overflow-hidden group">
                            <div className="w-1 bg-accent/50 shrink-0"></div>
                            <div className="p-2.5 flex flex-col gap-1 flex-1">
                                <div className="flex items-start justify-between">
                                    <h1 className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors">{meeting.title}</h1>
                                </div>
                                <div className="flex items-center justify-start mt-1">
                                    <p className="text-[11px] font-medium text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10 px-2 py-1 rounded-sm border border-green-300 dark:border-green-500/50">
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