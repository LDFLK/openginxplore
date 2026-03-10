import { useState, useCallback } from "react";
import { useCabinetFlow } from "../../../hooks/useCabinetFlow";
import { useSelector } from "react-redux";
import utils from "../../../utils/utils";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, BarChart2, CheckCircle2, Circle } from "lucide-react";
import ShareLinkButton from "../../../components/ShareLinkButton";
import SankeyChart from "../components/SankyChart";

const DateRangePicker = ({ startDate, endDate, selectedDates, onToggle, maxDates = 3, collapsed = false }) => {
    if (!startDate || !endDate) return null;

    const allDates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        allDates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    const isSelected = (d) => selectedDates.includes(d);
    const isDisabled = (d) => !isSelected(d) && selectedDates.length >= maxDates;
    const isEdge = (d) => d === startDate || d === endDate;

    // Group by year-month for display
    const grouped = allDates.reduce((acc, d) => {
        const [year, month] = d.split("-");
        const key = `${year}-${month}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d);
        return acc;
    }, {});

    const monthLabel = (key) => {
        const [year, month] = key.split("-");
        return new Date(year, parseInt(month) - 1, 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    };

    const dayLabel = (d) => {
        const [, , day] = d.split("-");
        return parseInt(day, 10);
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select up to <span className="font-semibold text-accent">{maxDates} dates</span> to compare
                    &nbsp;·&nbsp;
                    <span className="font-semibold text-accent">{selectedDates.length}</span> selected
                </p>
                <div className="flex items-center gap-3">
                    {selectedDates.length > 0 && (
                        <button
                            onClick={() => selectedDates.forEach((d) => onToggle(d))}
                            className="text-xs text-gray-400 hover:text-red-400 transition-colors underline underline-offset-2"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {!collapsed && (
                <div className="max-h-72 overflow-y-auto pr-1 space-y-5 custom-scroll">
                    {Object.entries(grouped).map(([key, days]) => (
                        <div key={key}>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                                {monthLabel(key)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {days.map((d) => {
                                    const selected = isSelected(d);
                                    const disabled = isDisabled(d);
                                    const edge = isEdge(d);

                                    return (
                                        <button
                                            key={d}
                                            onClick={() => !disabled && onToggle(d)}
                                            disabled={disabled}
                                            title={d}
                                            className={`
                                                relative w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150
                                                flex items-center justify-center
                                                ${selected
                                                    ? "bg-accent text-white shadow-md shadow-accent/30 ring-2 ring-accent/40"
                                                    : disabled
                                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent cursor-pointer"
                                                }
                                                ${edge && !selected ? "ring-1 ring-accent/40" : ""}
                                            `}
                                        >
                                            {dayLabel(d)}
                                            {edge && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent/70" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected dates summary */}
            {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                    {selectedDates.map((d) => (
                        <span
                            key={d}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
                        >
                            <Calendar size={11} />
                            {d}
                            <button
                                onClick={() => onToggle(d)}
                                className="ml-1 hover:text-red-400 transition-colors"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};


// const DateRangePicker = ({ startDate, endDate, selectedDates, onToggle, maxDates = 3 }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [viewMonth, setViewMonth] = useState(() => {
//         if (startDate) {
//             const [year, month] = startDate.split("-");
//             return { year: parseInt(year), month: parseInt(month) - 1 };
//         }
//         return { year: new Date().getFullYear(), month: new Date().getMonth() };
//     });

//     if (!startDate || !endDate) return null;

//     const allDatesSet = new Set();
//     const current = new Date(startDate);
//     const end = new Date(endDate);
//     while (current <= end) {
//         allDatesSet.add(current.toISOString().split("T")[0]);
//         current.setDate(current.getDate() + 1);
//     }

//     const isInRange = (d) => allDatesSet.has(d);
//     const isSelected = (d) => selectedDates.includes(d);
//     const isDisabled = (d) => !isSelected(d) && selectedDates.length >= maxDates;
//     const isEdge = (d) => d === startDate || d === endDate;

//     const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
//     const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();

//     const prevMonth = () => {
//         setViewMonth((prev) => {
//             if (prev.month === 0) return { year: prev.year - 1, month: 11 };
//             return { year: prev.year, month: prev.month - 1 };
//         });
//     };

//     const nextMonth = () => {
//         setViewMonth((prev) => {
//             if (prev.month === 11) return { year: prev.year + 1, month: 0 };
//             return { year: prev.year, month: prev.month + 1 };
//         });
//     };

//     const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleString("default", {
//         month: "long",
//         year: "numeric",
//     });

//     const cells = [];
//     for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
//     for (let d = 1; d <= daysInMonth; d++) cells.push(d);

//     const formatDate = (day) => {
//         const m = String(viewMonth.month + 1).padStart(2, "0");
//         const dd = String(day).padStart(2, "0");
//         return `${viewMonth.year}-${m}-${dd}`;
//     };

//     const triggerLabel =
//         selectedDates.length === 0
//             ? "Select dates"
//             : selectedDates.length === 1
//             ? selectedDates[0]
//             : `${selectedDates.length} dates selected`;

//     return (
//         <div className="relative inline-block">
//             {/* Trigger button */}
//             <button
//                 onClick={() => setIsOpen((o) => !o)}
//                 className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 hover:border-accent/60 transition-colors shadow-sm"
//             >
//                 <Calendar size={14} className="text-accent" />
//                 <span>{triggerLabel}</span>
//                 {selectedDates.length > 0 && (
//                     <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
//                         {selectedDates.length}/{maxDates}
//                     </span>
//                 )}
//                 <ChevronLeft
//                     size={13}
//                     className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-90" : "-rotate-90"}`}
//                 />
//             </button>

//             {/* Dropdown calendar */}
//             {isOpen && (
//                 <div className="absolute z-50 mt-2 left-0 w-72 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xl p-4">
//                     {/* Month navigation */}
//                     <div className="flex items-center justify-between mb-3">
//                         <button
//                             onClick={prevMonth}
//                             className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
//                         >
//                             <ChevronLeft size={15} />
//                         </button>
//                         <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
//                             {monthLabel}
//                         </span>
//                         <button
//                             onClick={nextMonth}
//                             className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
//                         >
//                             <ChevronLeft size={15} className="rotate-180" />
//                         </button>
//                     </div>

//                     {/* Day headers */}
//                     <div className="grid grid-cols-7 mb-1">
//                         {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
//                             <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
//                                 {d}
//                             </div>
//                         ))}
//                     </div>

//                     {/* Day cells */}
//                     <div className="grid grid-cols-7 gap-y-1">
//                         {cells.map((day, idx) => {
//                             if (!day) return <div key={`empty-${idx}`} />;
//                             const dateStr = formatDate(day);
//                             const inRange = isInRange(dateStr);
//                             const selected = isSelected(dateStr);
//                             const disabled = !inRange || isDisabled(dateStr);
//                             const edge = isEdge(dateStr);

//                             return (
//                                 <button
//                                     key={dateStr}
//                                     onClick={() => inRange && !disabled && onToggle(dateStr)}
//                                     disabled={disabled}
//                                     title={inRange ? dateStr : undefined}
//                                     className={`
//                                         relative mx-auto w-8 h-8 rounded-lg text-xs font-medium transition-all duration-100
//                                         flex items-center justify-center
//                                         ${selected
//                                             ? "bg-accent text-white shadow-sm shadow-accent/30"
//                                             : !inRange
//                                             ? "text-gray-200 dark:text-gray-700 cursor-default"
//                                             : disabled
//                                             ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
//                                             : "text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent cursor-pointer"
//                                         }
//                                         ${edge && inRange && !selected ? "ring-1 ring-accent/50" : ""}
//                                     `}
//                                 >
//                                     {day}
//                                     {edge && inRange && (
//                                         <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent/70" />
//                                     )}
//                                 </button>
//                             );
//                         })}
//                     </div>

//                     {/* Footer */}
//                     <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
//                         <p className="text-xs text-gray-400">
//                             <span className="font-semibold text-accent">{selectedDates.length}</span>/{maxDates} selected
//                         </p>
//                         <div className="flex gap-2">
//                             {selectedDates.length > 0 && (
//                                 <button
//                                     onClick={() => selectedDates.forEach((d) => onToggle(d))}
//                                     className="text-xs text-gray-400 hover:text-red-400 transition-colors"
//                                 >
//                                     Clear
//                                 </button>
//                             )}
//                             <button
//                                 onClick={() => setIsOpen(false)}
//                                 className="text-xs font-medium text-accent hover:opacity-70 transition-opacity"
//                             >
//                                 Done
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

const CabinetFlowPanel = ({ presidentId, dates }) => {
    const { data: cabinetFlow, isLoading, error } = useCabinetFlow(presidentId, dates);

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
            <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
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
        <div className="w-full mt-2 inline-block rounded border border-slate-200 shadow bg-white">
            {noDataDates.length > 0 && (
                <div className="m-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
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
                <SankeyChart data={cabinetFlow} width={700} height={400} />
            ) : (
                <div className="m-4 rounded-xl border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
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


const CabinetFlow = () => {
    const navigate = useNavigate();
    const { presidentId } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const state = location.state || {};
    const presidents = useSelector((s) => s.presidency.presidentDict);
    const [collapsed, setCollapsed] = useState(false);

    const currentpresident = presidents.find((p) => p.id === presidentId);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const [selectedDates, setSelectedDates] = useState(() => {
        const init = [];
        if (startDate) init.push(startDate);
        if (endDate && endDate !== startDate) init.push(endDate);
        return init;
    });

    const [committedDates, setCommittedDates] = useState(null);

    const handleToggleDate = useCallback((date) => {
        setSelectedDates((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    }, []);

    const handleViewFlow = () => {
        if (selectedDates.length === 0) return;
        setCommittedDates([...selectedDates].sort());
    };

    return (
        <div className="px-4 py-6 md:px-12 md:py-10 lg:px-20 xl:px-28 2xl:px-40 w-full bg-background min-h-screen">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() =>
                        state.from && state.from !== ""
                            ? navigate(state.from, {
                                state: {
                                    from: state.callback === true && state.callbackLink,
                                },
                            })
                            : navigate("/")
                    }
                    className="flex items-center gap-1 text-accent hover:text-accent/70 cursor-pointer transition-colors"
                >
                    <ChevronLeft size={18} />
                    <span className="text-sm font-medium">
                        {state.from && state.from !== "" ? "Back" : "Go to OpenGINXplore"}
                    </span>
                </button>

                <ShareLinkButton />
            </div>

            {/* ── Header ── */}
            <div className="w-full mb-8">
                <div className="flex items-center gap-3 mb-4">
                    {currentpresident && (
                        <img
                            src={currentpresident.imageUrl || ""}
                            alt={utils.extractNameFromProtobuf(currentpresident.name)}
                            className="md:w-14 w-10 md:h-14 h-10 object-cover rounded-full border border-border flex-shrink-0"
                        />
                    )}
                    <div>
                        {currentpresident && (
                            <h1 className="text-xl text-gray-900 dark:text-gray-400">
                                {utils.extractNameFromProtobuf(currentpresident.name)}
                            </h1>
                        )}
                        <h1 className="text-sm text-gray-500 dark:text-white leading-tight">
                            Cabinet Flow
                        </h1>
                    </div>
                </div>

                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                    <p>This chart visualizes how ministries and departments evolved during the president's tenure.</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                        <li>Each column represents a gazette date when one or more changes occurred.</li>
                        <li>Each rectangle within a column represents a ministry — its size reflects the number of departments under it.</li>
                        <li>The flows between columns show departments moving between ministries; thickness indicates the number moved.</li>
                        <li>Hover over a flow to view details about the departments involved.</li>
                    </ul>
                </div>
            </div>

            {/* ── Date picker card ── */}
            <div className="w-full mb-8 rounded-xl border border-border bg-white dark:bg-gray-900 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-accent" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Select Dates to Compare
                    </h2>
                    <button
                        type="button"
                        onClick={() => setCollapsed((v) => !v)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-accent transition-colors underline underline-offset-2"
                    >
                        {collapsed ? "Show date picker" : "Collapse date picker"}
                    </button>
                </div>

                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    selectedDates={selectedDates}
                    onToggle={handleToggleDate}
                    maxDates={3}
                    collapsed={collapsed}
                />

                <div className="mt-5 flex items-center justify-end gap-3">
                    {committedDates && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-green-500" />
                            Showing flow for: {committedDates.join(", ")}
                        </p>
                    )}
                    <button
                        onClick={handleViewFlow}
                        disabled={selectedDates.length === 0}
                        className="
                            inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                            text-sm font-medium text-white bg-accent
                            hover:opacity-90 active:scale-95 transition-all duration-150
                            disabled:opacity-40 disabled:cursor-not-allowed
                            shadow-md shadow-accent/20
                        "
                    >
                        <BarChart2 size={15} />
                        View Cabinet Flow
                    </button>
                </div>
            </div>

            {/* ── Flow visualisation — only mounts / fetches when committedDates is set ── */}
            {committedDates && (
                <CabinetFlowPanel presidentId={presidentId} dates={committedDates} />
            )}
        </div>
    );
};

export default CabinetFlow;