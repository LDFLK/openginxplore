import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Calendar, BarChart2 } from "lucide-react";
import DateRangePicker from "../components/DateRangePicker";
import CabinetFlowPanel from "../components/CabinetFlowPanel";

const CabinetFlow = ({ presidentId }) => {
    const { gazetteData } = useSelector((state) => state.gazettes);
    const gazetteDates = Array.isArray(gazetteData) ? gazetteData.map(item => item.date) : [];
    const presidentRelationDict = useSelector(
        (s) => s.presidency.presidentRelationDict
    );
    const presidentRelation = presidentRelationDict[presidentId];
    const startDate = presidentRelation?.startTime?.split("T")[0];
    let endDate = presidentRelation?.endTime;

    if (!endDate) {
        endDate = new Date().toISOString().split("T")[0];
    } else {
        const d = new Date(endDate);
        d.setDate(d.getDate() - 1);
        endDate = d.toISOString().split("T")[0];
    }

    const [selectedDates, setSelectedDates] = useState(() => {
        const init = [];
        if (startDate) init.push(startDate);
        if (endDate && endDate !== startDate) init.push(endDate);
        return init;
    });

    const handleToggleDate = useCallback((date) => {
        setSelectedDates((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    }, []);

    const sortedDates = [...selectedDates].sort();

    return (
        <div className="px-4 py-6 md:px-8 md:py-10 lg:px-12 xl:px-10 2xl:px-20 bg-background min-h-screen ms-4 me-4 mb-4 rounded-lg border border-gray-300">
            {/* ── Header ── */}
            <div className="w-full mb-6">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                            <p>This chart visualizes how ministries and departments evolved during the president's tenure.</p>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                                <li>Each column represents a gazette date when one or more changes occurred.</li>
                                <li>Hover over a flow to view details about the departments involved.</li>
                                <li>You can select up to 3 dates to compare.</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        {selectedDates.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-end pt-1 mb-3">
                                {sortedDates.map((d) => (
                                    <span
                                        key={d}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mt-1"
                                    >
                                        <Calendar size={11} />
                                        {d}
                                        <button
                                            onClick={() => handleToggleDate(d)}
                                            className="ml-1 hover:text-red-400 transition-colors hover:cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                selectedDates={selectedDates}
                                onToggle={handleToggleDate}
                                maxDates={3}
                                gazetteDates={gazetteDates}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {selectedDates.length > 1 ? (
                <CabinetFlowPanel presidentId={presidentId} dates={sortedDates} />
            ) : (
                <div className="mt-4 mb-4 ms-0 me-0 rounded-xl border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-2 py-20 px-6 text-center">
                    <BarChart2 size={28} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedDates.length === 1 ? "Select at least 2 dates to compare" : "Select up to 3 dates to compare"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
                        {selectedDates.length === 1
                            ? "You have selected 1 date. Please select one more date to view the cabinet flow."
                            : "Start date and the End date of the Presidency is selected by default."}
                    </p>
                </div>

            )}


        </div>
    );
};

export default CabinetFlow;