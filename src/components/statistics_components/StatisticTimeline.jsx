import React, { useState, useRef, useEffect } from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function StatisticTimeline({ startYear, onDateChange }) {
  const endYear = new Date().getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const [selectedRange, setSelectedRange] = useState([startYear, endYear]);
  const [startDate, setStartDate] = useState(
    new Date(Date.UTC(startYear, 0, 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [isDragging, setIsDragging] = useState(null);
  const [isMovingWindow, setIsMovingWindow] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [preciseMode, setPreciseMode] = useState(true);

  const containerRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const dragStartRef = useRef(null);
  const calendarButtonRef = useRef(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);

  useEffect(() => {
    onDateChange?.([startDate, endDate]);
  }, [startDate, endDate, onDateChange]);

  // Close on outside click and handle keyboard navigation
  useEffect(() => {
    if (!calendarOpen) return;
    const handleClick = (e) => {
      if (!popoverRef.current) return;
      if (popoverRef.current.contains(e.target)) return;
      if (
        calendarButtonRef.current &&
        calendarButtonRef.current.contains(e.target)
      )
        return;
      setCalendarOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setCalendarOpen(false);
      } else if (e.key === "Tab") {
        // Focus trap inside popover
        const focusable = popoverRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    // Focus the popover for screen readers and tab flow
    setTimeout(() => {
      try {
        popoverRef.current?.focus();
      } catch (_) {}
    }, 0);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [calendarOpen]);

  // Utility: check if endDate is today
  function isEndDateToday() {
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const endDateUTC = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    );
    return endDateUTC.getTime() === todayUTC.getTime();
  }

  // Get precise overlay metrics (left, width) for selected range
  function getPreciseOverlayMetrics() {
    const startYearVal = startDate.getUTCFullYear();
    const endYearVal = endDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const startDay = startDate.getUTCDate();
    const endMonth = endDate.getUTCMonth();
    const endDay = endDate.getUTCDate();

    const daysInStartMonth = new Date(
      Date.UTC(startYearVal, startMonth + 1, 0)
    ).getUTCDate();
    const dayProgressInStartMonth = (startDay - 1) / daysInStartMonth;
    const monthProgress = (startMonth + dayProgressInStartMonth) / 12;
    const startYearIndex = years.indexOf(startYearVal);
    const startPosition =
      ((startYearIndex + monthProgress) / years.length) * 100;

    const currentYear = new Date().getFullYear();
    const endYearIndex = years.indexOf(endYearVal);
    let endPosition;

    if (endYearVal === currentYear && isEndDateToday()) {
      endPosition = ((endYearIndex + 1) / years.length) * 100;
    } else {
      const daysInEndMonth = new Date(
        Date.UTC(endYearVal, endMonth + 1, 0)
      ).getUTCDate();
      const dayProgressInEndMonth = endDay / daysInEndMonth;
      const endMonthProgress = (endMonth + dayProgressInEndMonth) / 12;
      endPosition = ((endYearIndex + endMonthProgress) / years.length) * 100;
    }

    return {
      left: `${startPosition}%`,
      width: `${endPosition - startPosition}%`,
    };
  }

  // Get drag handle positions
  function getHandlePositions() {
    const startYearVal = startDate.getUTCFullYear();
    const endYearVal = endDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const startDay = startDate.getUTCDate();
    const endMonth = endDate.getUTCMonth();
    const endDay = endDate.getUTCDate();

    const daysInStartMonth = new Date(
      Date.UTC(startYearVal, startMonth + 1, 0)
    ).getUTCDate();
    const dayProgressInStartMonth = (startDay - 1) / daysInStartMonth;
    const monthProgress = (startMonth + dayProgressInStartMonth) / 12;
    const startYearIndex = years.indexOf(startYearVal);
    const startPosition =
      ((startYearIndex + monthProgress) / years.length) * 100;

    const currentYear = new Date().getFullYear();
    const endYearIndex = years.indexOf(endYearVal);
    let endPosition;

    if (endYearVal === currentYear && isEndDateToday()) {
      endPosition = ((endYearIndex + 1) / years.length) * 100;
    } else {
      const daysInEndMonth = new Date(
        Date.UTC(endYearVal, endMonth + 1, 0)
      ).getUTCDate();
      const dayProgressInEndMonth = endDay / daysInEndMonth;
      const endMonthProgress = (endMonth + dayProgressInEndMonth) / 12;
      endPosition = ((endYearIndex + endMonthProgress) / years.length) * 100;
    }

    return {
      startLeft: `${startPosition}%`,
      endLeft: `${endPosition}%`,
    };
  }

  const overlayMetrics = React.useMemo(
    () => getPreciseOverlayMetrics(),
    [startDate, endDate]
  );
  const handlePositions = React.useMemo(
    () => getHandlePositions(),
    [startDate, endDate]
  );

  // Dragging logic
  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(handle);
    setPreciseMode(true);
    setActivePreset(null);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const totalYears = years.length;
    const exactYearPosition = percentage * totalYears;

    // Calculate the exact date based on position
    const yearIndex = Math.floor(exactYearPosition);
    const yearProgress = exactYearPosition - yearIndex;
    const targetYear =
      years[Math.max(0, Math.min(yearIndex, years.length - 1))];

    // Convert year progress to month and day
    const monthProgress = yearProgress * 12;
    const month = Math.floor(monthProgress);
    const dayProgress = monthProgress - month;
    const daysInMonth = new Date(
      Date.UTC(targetYear, month + 1, 0)
    ).getUTCDate();
    const day = Math.max(1, Math.floor(dayProgress * daysInMonth) + 1);

    const newDate = new Date(Date.UTC(targetYear, month, day));

    if (isDragging === "start" && newDate <= endDate) {
      setStartDate(newDate);
      setSelectedRange([newDate.getUTCFullYear(), endDate.getUTCFullYear()]);
    }
    if (isDragging === "end" && newDate >= startDate) {
      setEndDate(newDate);
      setSelectedRange([startDate.getUTCFullYear(), newDate.getUTCFullYear()]);
    }
  };

  const handleWindowMove = (e) => {
    if (!isMovingWindow || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current;
    const percentageDelta = deltaX / rect.width;
    const totalYears = years.length;
    const yearDelta = percentageDelta * totalYears;

    // Calculate new start position
    const currentStartYearPos =
      years.indexOf(startDate.getUTCFullYear()) +
      (startDate.getUTCMonth() +
        (startDate.getUTCDate() - 1) /
          new Date(
            Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0)
          ).getUTCDate()) /
        12;

    // Calculate new end position
    const currentEndYearPos =
      years.indexOf(endDate.getUTCFullYear()) +
      (endDate.getUTCMonth() +
        endDate.getUTCDate() /
          new Date(
            Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 0)
          ).getUTCDate()) /
        12;

    const newStartYearPos = currentStartYearPos + yearDelta;
    const newEndYearPos = currentEndYearPos + yearDelta;

    // Clamp to bounds and convert back to dates
    const clampedStartPos = Math.max(
      0,
      Math.min(newStartYearPos, totalYears - 1)
    );
    const clampedEndPos = Math.max(0, Math.min(newEndYearPos, totalYears - 1));

    // If clamped, adjust both positions to maintain window size
    let finalStartPos = clampedStartPos;
    let finalEndPos = clampedEndPos;

    if (newStartYearPos < 0) {
      const diff = -newStartYearPos;
      finalStartPos = 0;
      finalEndPos = Math.min(
        totalYears - 1,
        currentEndYearPos - currentStartYearPos
      );
    } else if (newEndYearPos > totalYears - 1) {
      const diff = newEndYearPos - (totalYears - 1);
      finalEndPos = totalYears - 1;
      finalStartPos = Math.max(
        0,
        totalYears - 1 - (currentEndYearPos - currentStartYearPos)
      );
    }

    // Convert positions back to dates
    function positionToDate(pos) {
      const yearIndex = Math.floor(pos);
      const yearProgress = pos - yearIndex;
      const targetYear =
        years[Math.max(0, Math.min(yearIndex, years.length - 1))];

      const monthProgress = yearProgress * 12;
      const month = Math.floor(monthProgress);
      const dayProgress = monthProgress - month;
      const daysInMonth = new Date(
        Date.UTC(targetYear, month + 1, 0)
      ).getUTCDate();
      const day = Math.max(1, Math.floor(dayProgress * daysInMonth) + 1);

      return new Date(Date.UTC(targetYear, month, day));
    }

    const newStartDate = positionToDate(finalStartPos);
    const newEndDate = positionToDate(finalEndPos);

    if (newStartDate <= newEndDate) {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setSelectedRange([
        newStartDate.getUTCFullYear(),
        newEndDate.getUTCFullYear(),
      ]);
    }

    dragStartRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setIsMovingWindow(false);
  };

  useEffect(() => {
    if (isDragging || isMovingWindow) {
      const moveHandler = isDragging ? handleMouseMove : handleWindowMove;
      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isMovingWindow, startDate, endDate]);

  return (
    <div className="bg-gray-800 p-6 rounded-2xl w-full border border-gray-800/60 text-gray-200">
      {/* Presets and controls */}
      <div className="flex gap-2 mb-6 flex-wrap sm:justify-start justify-center">
        {[
          { label: "1Y", years: 1 },
          { label: "2Y", years: 2 },
          { label: "3Y", years: 3 },
          { label: "5Y", years: 5 },
          { label: "All", years: endYear - startYear + 1 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              if (preset.label === "All") {
                setStartDate(new Date(Date.UTC(startYear, 0, 1)));
                setEndDate(new Date());
                setSelectedRange([startYear, endYear]);
              } else {
                const today = new Date();
                const start = new Date(
                  Date.UTC(
                    today.getUTCFullYear() - preset.years,
                    today.getUTCMonth(),
                    today.getUTCDate()
                  )
                );
                setStartDate(start);
                setEndDate(today);
                setSelectedRange([
                  start.getUTCFullYear(),
                  today.getUTCFullYear(),
                ]);
              }
              setPreciseMode(true);
              setActivePreset(preset.label);
            }}
            className={`px-2 text-sm font-medium rounded-lg transition-colors ${
              activePreset === preset.label
                ? "bg-blue-600 text-white hover:cursor-pointer"
                : "bg-gray-700 text-gray-300 hover:bg-gray-800 hover:cursor-pointer"
            }
						`}
          >
            {preset.label}
          </button>
        ))}

        {/* Calendar Button */}
        <div className="relative">
          <button
            ref={calendarButtonRef}
            onClick={() => {
              setTempStartDate(startDate);
              setTempEndDate(endDate);
              const rect = calendarButtonRef.current?.getBoundingClientRect();
              if (rect) {
                const desiredWidth = 640; // target width for two calendars
                let left = rect.left + window.scrollX;
                const top = rect.bottom + window.scrollY + 8;
                if (left + desiredWidth > window.innerWidth) {
                  left =
                    Math.max(16, window.innerWidth - desiredWidth - 16) +
                    window.scrollX;
                }
                setPopoverPosition({ top, left });
              }
              setCalendarOpen(!calendarOpen);
            }}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              calendarOpen
                ? "bg-blue-600 text-white hover:cursor-pointer"
                : "bg-gray-700 text-gray-300 hover:bg-gray-800 hover:cursor-pointer"
            }
						`}
          >
            Select Range
          </button>

          {/* {calendarOpen && (
							<div className="fixed z-[9999]" style={{ top: popoverPosition.top, left: popoverPosition.left }}>
							<div ref={popoverRef} tabIndex={-1} role="dialog" aria-label="Select date range" className="bg-gray-900 text-gray-100 p-4 rounded-2xl shadow-2xl border border-gray-800/60 flex flex-col">
									<style>{`
									  .react-datepicker { background-color: #0b1220; border: 1px solid rgba(148,163,184,0.25); color: #e5e7eb; border-radius: 14px; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system; }
									  .react-datepicker__header { background-color: rgba(17,24,39,0.85); border-bottom: 1px solid rgba(148,163,184,0.25); }
									  .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: #d1d5db; font-weight: 600; }
									  .react-datepicker__day-name { color: #9ca3af; font-weight: 500; }
									  .react-datepicker__day { color: #e5e7eb; }
									  .react-datepicker__day:hover { background-color: rgba(59,130,246,0.2); }
									  .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: rgba(59,130,246,0.45); color: #fff; }
									  .react-datepicker__day--in-range, .react-datepicker__day--in-selecting-range { background-color: rgba(59,130,246,0.3); color: #fff; }
									  .react-datepicker__day--today { outline: 1px solid rgba(59,130,246,0.6); }
									  .react-datepicker__navigation-icon::before { border-color: #93c5fd; }
									`}</style>
									<div className="flex flex-col sm:flex-row gap-6" style={{ minWidth: 640 }}>
										<div className="flex-1 flex flex-col">
											<p className="text-xs text-gray-400 mb-2 font-medium tracking-wide">From</p>
											<div className="rounded-xl overflow-hidden border border-gray-800/60 w-[300px]">
												<DatePicker selected={tempStartDate} onChange={setTempStartDate} inline monthsShown={1} minDate={new Date(startYear, 0, 1)} maxDate={new Date()} calendarStartDay={1} />
											</div>
										</div>
										<div className="flex-1 flex flex-col">
											<p className="text-xs text-gray-400 mb-2 font-medium tracking-wide">To</p>
											<div className="rounded-xl overflow-hidden border border-gray-800/60 w-[300px]">
												<DatePicker selected={tempEndDate} onChange={setTempEndDate} inline monthsShown={1} minDate={tempStartDate} maxDate={new Date()} calendarStartDay={1} />
											</div>
										</div>
									</div>
									<div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
										<button onClick={() => setCalendarOpen(false)} className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg border border-gray-700">Cancel</button>
										<button onClick={() => { if (tempStartDate && tempEndDate && tempStartDate <= tempEndDate) { setStartDate(tempStartDate); setEndDate(tempEndDate); setSelectedRange([tempStartDate.getUTCFullYear(), tempEndDate.getUTCFullYear()]); setPreciseMode(true); setCalendarOpen(false); setActivePreset(null); } }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Apply</button>
									</div>
								</div>
							</div>
						)} */}
          {calendarOpen && (
            <div className="absolute right-0 mt-2 z-50 w-full sm:w-auto bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <p className="text-xs text-gray-300 mb-2">From</p>
                  <DatePicker
                    selected={tempStartDate}
                    onChange={setTempStartDate}
                    inline
                    monthsShown={1}
                    minDate={new Date(startYear, 0, 1)}
                    maxDate={new Date()}
                    dayClassName={(date) => {
                      if (!tempStartDate) return "";
                      const start = tempStartDate;
                      const endOfMonth = new Date(
                        start.getFullYear(),
                        start.getMonth() + 1,
                        0
                      );
                      if (date >= start && date <= endOfMonth) {
                        return "bg-blue-500/20 rounded-none";
                      }
                      return "";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-xs text-gray-300 mb-2">To</p>
                  <DatePicker
                    selected={tempEndDate}
                    onChange={setTempEndDate}
                    inline
                    monthsShown={1}
                    minDate={tempStartDate}
                    maxDate={new Date()}
                    dayClassName={(date) => {
                      if (!tempEndDate) return "";
                      const end = tempEndDate;
                      const startOfMonth = new Date(
                        end.getFullYear(),
                        end.getMonth(),
                        1
                      );
                      if (date >= startOfMonth && date <= end) {
                        return "bg-blue-500/20 rounded-none";
                      }
                      return "";
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-300 bg-gray-600 rounded-lg hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      tempStartDate &&
                      tempEndDate &&
                      tempStartDate <= tempEndDate
                    ) {
                      setStartDate(tempStartDate);
                      setEndDate(tempEndDate);
                      setSelectedRange([
                        tempStartDate.getUTCFullYear(),
                        tempEndDate.getUTCFullYear(),
                      ]);
                      setPreciseMode(true);
                      setCalendarOpen(false);
                      setActivePreset(null);
                      //   setActivePresident("");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected range display */}
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <div className="px-3 py-1.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
            {startDate.toISOString().split("T")[0]}
          </div>
          <span className="text-blue-300 font-medium">→</span>
          <div className="px-3 py-1.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
            {endDate.toISOString().split("T")[0]}
          </div>
        </div>
      </div>

      {/* Scrollable year blocks */}
      <div
        ref={scrollWrapperRef}
        className="overflow-x-auto overflow-y-hidden scroll-wrapper"
        style={{ paddingRight: "15px", paddingLeft: "15px" }}
      >
        <div
          ref={containerRef}
          className="relative bg-gray-50 bg-gray-700 mb-6"
          style={{ height: "30px", minWidth: `${years.length * 80}px` }}
        >
          <div className="flex h-full items-end">
            {years.map((year) => {
              const isInRange =
                year >= selectedRange[0] && year <= selectedRange[1];
              return (
                <div
                  key={year}
                  className={`relative transition-all duration-200 ${
                    isInRange ? "opacity-100" : "opacity-40"
                  } border-l-1 border-r-1 border-gray-500`}
                  style={{ height: "80px", flex: "1 0 0" }}
                  onClick={() => {
                    setSelectedRange([year, year]);
                    const newStartDate = new Date(Date.UTC(year, 0, 1));
                    let newEndDate;
                    const currentYear = new Date().getUTCFullYear();
                    if (year === currentYear) {
                      const today = new Date();
                      newEndDate = new Date(
                        Date.UTC(
                          today.getUTCFullYear(),
                          today.getUTCMonth(),
                          today.getUTCDate()
                        )
                      );
                    } else {
                      newEndDate = new Date(Date.UTC(year, 11, 31));
                    }

                    setStartDate(newStartDate);
                    setEndDate(newEndDate);
                    setActivePreset(null);
                  }}
                >
                  <div
                    className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                      isInRange
                        ? "text-blue-500 text-blue-400"
                        : "text-gray-500 text-gray-400"
                    }`}
                  >
                    {year}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overlay */}
          <div
            className="absolute top-0 bg-blue-500/40 border-t-2 border-blue-500 transition-all duration-200"
            style={{
              left: overlayMetrics.left,
              width: overlayMetrics.width,
              height: "100%",
              pointerEvents: "none",
            }}
          />

          {/* Drag window - Fixed mouse down handler */}
          <div
            className="absolute top-0 h-full cursor-move z-10"
            style={{ left: overlayMetrics.left, width: overlayMetrics.width }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMovingWindow(true);
              setPreciseMode(true);
              setActivePreset(null);
              dragStartRef.current = e.clientX;
            }}
          />

          {/* Drag handles */}
          <div
            className="absolute top-4 transform -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-blue-500 rounded cursor-ew-resize flex items-center justify-center shadow hover:bg-blue-500 z-30"
            style={{ left: handlePositions.startLeft }}
            onMouseDown={(e) => handleMouseDown(e, "start")}
          >
            <DragIndicatorIcon className="w-4 h-4 text-white" />
          </div>
          <div
            className="absolute top-4 transform -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-blue-500 rounded cursor-ew-resize flex items-center justify-center shadow hover:bg-blue-500 z-30"
            style={{ left: handlePositions.endLeft }}
            onMouseDown={(e) => handleMouseDown(e, "end")}
          >
            <DragIndicatorIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
