import { useState, useCallback } from "react";
import { useCabinetFlow } from "../../../hooks/useCabinetFlow";
import { useSelector } from "react-redux";
import utils from "../../../utils/utils";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, BarChart2, CheckCircle2, Circle } from "lucide-react";
import ShareLinkButton from "../../../components/ShareLinkButton";

const DateRangePicker = ({ startDate, endDate, selectedDates, onToggle, maxDates = 3 }) => {
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
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select up to <span className="font-semibold text-accent">{maxDates} dates</span> to compare
                    &nbsp;·&nbsp;
                    <span className="font-semibold text-accent">{selectedDates.length}</span> selected
                </p>
                {selectedDates.length > 0 && (
                    <button
                        onClick={() => selectedDates.forEach((d) => onToggle(d))}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors underline underline-offset-2"
                    >
                        Clear all
                    </button>
                )}
            </div>

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

    return (
        <div className="w-full mt-2">
            {/* TODO: render your Sankey / flow chart here using `cabinetFlow` */}
            <div className="rounded-xl border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-3 py-24 px-6 text-center">
                <BarChart2 size={40} className="text-accent/50" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Cabinet Flow Chart — placeholder
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
                    Data loaded successfully for {dates.length} date{dates.length !== 1 ? "s" : ""}.
                    Replace this block with your Sankey / flow visualisation component.
                </p>
                <pre className="mt-2 text-left text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-full overflow-auto text-gray-500 dark:text-gray-400 max-h-48">
                    {JSON.stringify(cabinetFlow, null, 2)}
                </pre>
            </div>
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
                </div>

                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    selectedDates={selectedDates}
                    onToggle={handleToggleDate}
                    maxDates={3}
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