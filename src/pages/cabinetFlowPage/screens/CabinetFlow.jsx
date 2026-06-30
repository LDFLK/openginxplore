import { useState, useCallback, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, BarChart2, Building2 } from "lucide-react";
import DateRangePicker from "../components/DateRangePicker";
import CabinetFlowPanel from "../components/CabinetFlowPanel";
import RightSidePanel from "../../../components/RightSidePanel";

const formatEndDateForPicker = (finalEnd, hasPresidentEndTime) => {
    if (!hasPresidentEndTime) {
        return finalEnd.toISOString().split("T")[0];
    }
    const d = new Date(finalEnd);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
};

const CabinetFlow = ({ presidentId, dateRange = [null, null], onMinistryNodeClick }) => {
    const { gazetteData } = useSelector((state) => state.gazettes);
    const gazetteDates = Array.isArray(gazetteData) ? gazetteData.map(item => item.date) : [];
    const presidentRelationDict = useSelector(
        (s) => s.presidency.presidentRelationDict
    );
    const presidentRelation = presidentRelationDict[presidentId];

    const [rangeStart, rangeEnd] = dateRange;

    const { startDate, endDate } = useMemo(() => {
        if (!presidentRelation?.startTime) {
            return { startDate: null, endDate: null };
        }

        const presStart = new Date(presidentRelation.startTime.split("T")[0]);
        const hasPresidentEndTime = !!presidentRelation.endTime;
        const presEnd = hasPresidentEndTime
            ? new Date(presidentRelation.endTime.split("T")[0])
            : new Date();

        const finalStart = rangeStart
            ? new Date(Math.max(presStart.getTime(), rangeStart.getTime()))
            : presStart;
        const finalEnd = rangeEnd
            ? new Date(Math.min(presEnd.getTime(), rangeEnd.getTime()))
            : presEnd;

        const start = finalStart.toISOString().split("T")[0];
        let end = formatEndDateForPicker(finalEnd, hasPresidentEndTime);

        if (start > end) {
            end = start;
        }

        return { startDate: start, endDate: end };
    }, [presidentRelation, rangeStart, rangeEnd]);

    const [selectedDates, setSelectedDates] = useState([]);

    useEffect(() => {
        if (!startDate) {
            setSelectedDates([]);
            return;
        }
        const init = [startDate];
        if (endDate && endDate !== startDate) {
            init.push(endDate);
        }
        setSelectedDates(init);
    }, [startDate, endDate, presidentId]);

    const handleToggleDate = useCallback((date) => {
        setSelectedDates((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    }, []);

    const sortedDates = [...selectedDates].sort();

    const [selectedLink, setSelectedLink] = useState(null);
    const handleLinkClick = useCallback((link) => {
        setSelectedLink(link);
    }, []);
    const handleClosePanel = useCallback(() => {
        setSelectedLink(null);
    }, []);

    return (
        <div className="px-4 py-6 md:px-8 md:py-10 lg:px-12 xl:px-10 2xl:px-20 bg-background min-h-screen ms-4 me-4 mb-4 rounded-lg border border-border">
            {/* ── Header ── */}
            <div className="w-full mb-6">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="space-y-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                            <p>This chart visualizes how ministries and departments evolved during the president's tenure.</p>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                                <li>Each column represents a date when one or more changes may have occurred.</li>
                                <li>Hover over a flow to view details about the departments involved.</li>
                                <li>You can select up to 3 dates to compare.</li>
                                <li>Click a ministry to view its information.</li>
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

            <div className="flex items-stretch gap-0">
                <div className="flex-1 min-w-0">
                    {selectedDates.length > 1 ? (
                        <CabinetFlowPanel
                            presidentId={presidentId}
                            dates={sortedDates}
                            onMinistryNodeClick={onMinistryNodeClick}
                            onLinkClick={handleLinkClick}
                        />
                    ) : (
                        <div className="mt-4 mb-4 ms-0 me-0 rounded-xl border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-2 py-20 px-6 text-center">
                            <BarChart2 size={28} className="text-gray-300 dark:text-gray-600" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {selectedDates.length === 1 ? "Select at least 2 dates to compare" : "Select up to 3 dates to compare"}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
                                {selectedDates.length === 1
                                    ? "You have selected 1 date. Please select one more date to view the department flow."
                                    : "The start and end dates of the presidency are selected by default."}
                            </p>
                        </div>
                    )}
                </div>

                <RightSidePanel
                    isOpen={!!selectedLink}
                    onClose={handleClosePanel}
                    title="Department Changes"
                >
                    {selectedLink && (
                        <div className="flex flex-col gap-3">
                            <div className="text-sm text-foreground/80 dark:text-white/80">
                                <span className="font-medium">{selectedLink.source?.name}</span>
                                {" → "}
                                <span className="font-medium">{selectedLink.target?.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedLink.value} department{selectedLink.value > 1 ? "s" : ""} moved
                            </p>

                            <div className="mt-2 rounded-lg border border-dashed border-border p-4 flex flex-col items-center justify-center gap-2 text-center">
                                <Building2 size={24} className="text-gray-300 dark:text-gray-600" />
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Department list will be loaded here.
                                </p>
                            </div>
                        </div>
                    )}
                </RightSidePanel>
            </div>
        </div>
    );
};

export default CabinetFlow;