import { useState, useCallback, useRef, useEffect } from "react";
import { useCabinetFlow } from "../../../hooks/useCabinetFlow";
import { useSelector } from "react-redux";
import { ChevronLeft, Calendar, BarChart2, CheckCircle2 } from "lucide-react";
import SankeyChart from "../components/SankyChart";

const DateRangePicker = ({ startDate, endDate, selectedDates, onToggle, maxDates = 3, gazetteDates }) => {
    const [isOpen, setIsOpen] = useState(false);

    const datePickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);


    const [viewMonth, setViewMonth] = useState(() => {
        if (startDate) {
            const [year, month] = startDate.split("-");
            return { year: parseInt(year), month: parseInt(month) - 1 };
        }
        return { year: new Date().getFullYear(), month: new Date().getMonth() };
    });

    if (!startDate || !endDate) return null;

    const allDatesSet = new Set();
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        allDatesSet.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    const isInRange = (d) => allDatesSet.has(d);
    const isSelected = (d) => selectedDates.includes(d);
    const isDisabled = (d) => !isSelected(d) && selectedDates.length >= maxDates;
    const isEdge = (d) => d === startDate || d === endDate;

    const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();

    const prevMonth = () => {
        setViewMonth((prev) => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { year: prev.year, month: prev.month - 1 };
        });
    };

    const nextMonth = () => {
        setViewMonth((prev) => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { year: prev.year, month: prev.month + 1 };
        });
    };

    const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const formatDate = (day) => {
        const m = String(viewMonth.month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${viewMonth.year}-${m}-${dd}`;
    };

    const triggerLabel =
        selectedDates.length === 0
            ? "Select up to 3 dates"
            : selectedDates.length === 1
                ? selectedDates[0]
                : `${selectedDates.length} dates selected`;

    return (
        <div className="relative inline-block" ref={datePickerRef}>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 hover:border-accent/60 transition-colors shadow-sm hover:cursor-pointer"
            >
                <Calendar size={14} className="text-accent" />
                <span>{triggerLabel}</span>
                {selectedDates.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                        {selectedDates.length}/{maxDates}
                    </span>
                )}
                <ChevronLeft
                    size={13}
                    className={`text-gray-400 transition-transform duration-200 hover:text-accent ${isOpen ? "rotate-90" : "-rotate-90"}`}
                />
            </button>

            {/* Dropdown calendar */}
            {isOpen && (
                <div className="absolute z-50 mt-2 right-0 w-72 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xl p-4">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={prevMonth}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors hover:cursor-pointer"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {monthLabel}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors hover:cursor-pointer"
                        >
                            <ChevronLeft size={15} className="rotate-180" />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} />;
                            const dateStr = formatDate(day);
                            const inRange = isInRange(dateStr);
                            const selected = isSelected(dateStr);
                            const disabled = !inRange || isDisabled(dateStr);
                            const edge = isEdge(dateStr);
                            const hasGazette = gazetteDates.includes(dateStr);

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => inRange && !disabled && onToggle(dateStr)}
                                    disabled={disabled}
                                    title={inRange ? dateStr : undefined}
                                    className={`
                                        relative mx-auto w-8 h-8 rounded-lg text-xs font-medium transition-all duration-100
                                        flex items-center justify-center
                                        ${selected
                                            ? "bg-accent text-white shadow-sm shadow-accent/30 hover:cursor-pointer" 
                                            : hasGazette
                                                ? "border-2 border-accent/50 text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent hover:cursor-pointer"
                                                : !inRange
                                                    ? "text-gray-200 dark:text-gray-700 hover:cursor-not-allowed"
                                                    : disabled
                                                        ? "text-gray-300 dark:text-gray-600 hover:cursor-not-allowed"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent hover:cursor-pointer"
                                        }
                                        ${edge && inRange && !selected ? "ring-1 ring-accent/50" : ""}
                                    `}
                                >
                                    {day}
                                    {hasGazette && !selected && (
                                        <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent/70" />
                                    )}
                                    {edge && inRange && (
                                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent/70" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            <span className="font-semibold text-accent">{selectedDates.length}</span>/{maxDates} selected
                        </p>
                        <div className="flex gap-2">
                            {selectedDates.length > 0 && (
                                <button
                                    onClick={() => selectedDates.forEach((d) => onToggle(d))}
                                    className="text-xs text-gray-400 hover:text-red-400 transition-colors hover:cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-medium text-accent hover:opacity-70 transition-opacity hover:cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CabinetFlowPanel = ({ presidentId, dates }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const { data: cabinetFlow, isLoading, error } = useCabinetFlow(presidentId, dates);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [cabinetFlow]);

    const calculateHeight = (data) => {
        if (!data) return 600;
        const nodeCount = data.nodes?.length ?? 0;
        const minHeight = 600;
        const heightPerNode = 40;
        return Math.max(minHeight, nodeCount * heightPerNode);
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading cabinet flow…</p>
            </div>
        );
    }

    if (error || !cabinetFlow) {
        return (
            <div className="w-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 gap-3">
                <BarChart2 size={36} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Could not load cabinet flow
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs text-center">
                    Something went wrong fetching the data. Try different dates or reload the page.
                </p>
            </div>
        );
    }

    const noDataDates = (cabinetFlow?.dates || []).filter((d) => d?.status === "no_data");
    const okDates = (cabinetFlow?.dates || []).filter((d) => d?.status === "ok");
    const hasLinks = Array.isArray(cabinetFlow?.links) && cabinetFlow.links.length > 0;

    return (
        <div ref={containerRef} className="w-full mt-2">
            {noDataDates.length > 0 && (
                <div className="mt-4 mb-4 ms-0 me-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                    <p className="text-sm font-medium">
                        Some selected dates don’t have active departments data.
                    </p>
                    <p className="mt-0.5 text-xs opacity-80">
                        Please deselect the following date(s):{" "}
                        <span className="font-semibold">
                            {noDataDates.map((d) => d.date).join(", ")}
                        </span>
                    </p>
                </div>
            )}
            {hasLinks ? (
                <SankeyChart data={cabinetFlow} width={containerWidth} height={calculateHeight(cabinetFlow)} />
            ) : (
                <div className="mt-4 mb-4 ms-0 me-0 rounded-xl border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
                    <BarChart2 size={28} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        No data available for this comparison
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
                        {dates?.length === 1
                            ? "Select at least two dates to compare cabinet changes."
                            : okDates.length <= 1
                                ? "Only one selected date has usable data, so there’s nothing to compare. Try selecting another date with available data."
                                : "Try different dates or adjust the selected range."}
                    </p>
                </div>
            )}
        </div>
    );
};

const CabinetFlow = ({ presidentId }) => {
    const { gazetteData } = useSelector((state) => state.gazettes);
    const gazetteDates = gazetteData.map(item => item.date);
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
        <div className="px-4 py-6 md:px-12 md:py-10 lg:px-10 xl:px-10 2xl:px-20 bg-background min-h-screen ms-4 me-4 mb-4 rounded-lg border-solid border-gray-300 border-1">
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
                            : "Start date and the End date of the Presidency is selected by default. But you can select whatever the 3 dates in between the Presidency"}
                    </p>
                </div>

            )}


        </div>
    );
};

export default CabinetFlow;