import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft } from "lucide-react";

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

export default DateRangePicker;

