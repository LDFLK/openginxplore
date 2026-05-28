import { statItems } from "../../../data/mockdata";

export default function MeetingSectionHighlights() {
    return (
        <div className="bg-card border border-border mt-4 mb-4 rounded-md text-primary/95 hover:text-primary bg-primary/5 hover:bg-primary/10 border-primary/10 hover:border-primary/15 cursor-pointer border transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                    {statItems.map((stat, index) =>
                        <div key={index} className="text-center flex flex-col justify-center items-center p-1 rounded-md">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-primary/70">
                                {stat.label}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
