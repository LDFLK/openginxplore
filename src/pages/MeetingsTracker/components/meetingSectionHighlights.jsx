import { useMeetingsHighlightData } from "../../../hooks/useMeetingsTracker";

export default function MeetingSectionHighlights() {

    const { data, isLoading } = useMeetingsHighlightData();

    if (isLoading) {
        return (
            <div className="bg-card border border-border mt-4 mb-4 rounded-md border-primary/10 border transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex flex-col justify-center items-center p-1 rounded-md animate-pulse">
                                <div className="h-12 w-12 bg-gray-500/20 rounded-md mb-2"></div>
                                <div className="h-3 w-24 bg-gray-500/20 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border mt-4 mb-4 rounded-md text-primary/95 hover:text-primary border-primary/10 hover:border-primary/15 cursor-pointer border transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                    {data?.map((stat, index) =>
                        <div key={index} className="text-center flex flex-col justify-center items-center p-1 rounded-md">
                            <div className="text-sm sm:text-2xl font-bold mb-1">
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
