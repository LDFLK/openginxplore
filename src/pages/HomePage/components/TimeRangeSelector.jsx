import React, { useState, useRef, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import utils from "../../../utils/utils";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function TimeRangeSelector({
  startYear,
  dates,
  latestPresStartDate,
  onDateChange,
  externalRange,
  activePreset,
  setActivePreset,
  activePresident,
  setActivePresident
}) {
  const presidentsArray = useSelector(
    (state) => state.presidency.presidentDict
  );
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const location = useLocation();
  const containerRef = useRef(null);
  const dragStartRef = useRef(null);
  const scrollWrapperRef = useRef(null);

  // Helper: safely parse YYYY-MM-DD → Date
  const parseDate = (dateStr, fallback) => {
    if (!dateStr) return fallback;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? fallback : date;
  };

  // Consolidate URL parsing for initial state
  const getInitialDates = () => {
    const params = new URLSearchParams(window.location.search);
    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const selectedDateParam = params.get("selectedDate");

    const minDate = new Date(`${startYear}-01-01`);
    const maxDate = new Date();

    let urlStart = parseDate(startDateParam, null);
    let urlEnd = parseDate(endDateParam, null);

    if (!urlStart || !urlEnd) {
      urlStart = parseDate(startDateParam, latestPresStartDate);
      urlEnd = parseDate(endDateParam, new Date());
    }

    if (selectedDateParam) {
      const targetDate = new Date(selectedDateParam);
      if (!(targetDate >= urlStart && targetDate <= urlEnd)) {
        if (targetDate >= minDate && targetDate <= maxDate) {
          urlStart = new Date(`${targetDate.getFullYear()}-01-01`);
          urlEnd = new Date(`${targetDate.getFullYear()}-12-31`);
        } else {
          urlStart = minDate;
          urlEnd = maxDate;
        }
      }
    } else {
      urlStart = urlStart < minDate ? minDate : urlStart;
      urlEnd = urlEnd > maxDate ? maxDate : urlEnd;
      if (urlEnd < urlStart) {
        urlStart = minDate;
        urlEnd = maxDate;
      }
    }

    return { urlStart, urlEnd };
  };

  const { urlStart: initialStart, urlEnd: initialEnd } = getInitialDates();

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(null);
  const [isMovingWindow, setIsMovingWindow] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(initialStart);
  const [tempEndDate, setTempEndDate] = useState(initialEnd);
  const [preciseMode, setPreciseMode] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [calendarRange, setCalendarRange] = useState(null);
  const [calendarStart, setCalendarStart] = useState(startDate);
  const [calendarEnd, setCalendarEnd] = useState(endDate);

  const endYear = new Date().getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const [selectedRange, setSelectedRange] = useState([
    initialStart.getUTCFullYear(),
    initialEnd.getUTCFullYear(),
  ]);
  useEffect(() => {
    if (!externalRange) return;

    const [extStart, extEnd] = externalRange;

    // Only update if both dates are valid
    if (extStart instanceof Date && !isNaN(extStart) && extEnd instanceof Date && !isNaN(extEnd)) {
      if (
        extStart.getTime() !== startDate?.getTime() ||
        extEnd.getTime() !== endDate?.getTime()
      ) {
        setStartDate(extStart);
        setEndDate(extEnd);
        setTempStartDate(extStart);
        setTempEndDate(extEnd);
        setSelectedRange([extStart.getFullYear(), extEnd.getFullYear()]);

        // Clear active states on external update
        setActivePreset(null);
        setActivePresident("");
      }
    }
  }, [externalRange, startDate, endDate, setActivePreset, setActivePresident]);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const params = new URLSearchParams(window.location.search);
    const newStart = startDate.toISOString().split("T")[0];
    const newEnd = endDate.toISOString().split("T")[0];

    // Check if URL already matches. Use ISO string comparison to match UTC dates.
    const urlStart = params.get("startDate");
    const urlEnd = params.get("endDate");

    if (urlStart === newStart && urlEnd === newEnd) return;

    // Only update if current URL is missing dates OR if the change seems to be 
    // internal (i.e. path hasn't changed, but dates did)
    // Actually, if we are transitioning to a NEW path, we should let that path's 
    // initial parameters win.
    params.set("startDate", newStart);
    params.set("endDate", newEnd);

    const path = location.pathname;
    window.history.replaceState({}, "", `${path}?${params.toString()}`);
  }, [startDate, endDate]); // Remove location.pathname from deps to avoid overwriting on navigation

  useEffect(() => {
    // We use window.location.search directly to ensure we have the latest params
    // regardless of the searchParams hook state or router updates.
    const params = new URLSearchParams(window.location.search);
    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const selectedDateParam = params.get("selectedDate");

    const minDate = new Date(`${startYear}-01-01`);
    const maxDate = new Date();

    // If params exist, we prioritize them over defaults/latestPresStartDate
    let urlStart;
    let urlEnd;

    // 1. Try to parse from params
    if (startDateParam && endDateParam) {
      urlStart = parseDate(startDateParam, null);
      urlEnd = parseDate(endDateParam, null);
    }

    // 2. If parsing failed or params missing, use fallback logic
    if (!urlStart || !urlEnd) {
      urlStart = parseDate(startDateParam, latestPresStartDate);
      urlEnd = parseDate(endDateParam, new Date());
    }

    if (selectedDateParam) {
      const targetDate = new Date(selectedDateParam);

      // If outside calculated range, update it
      if (!(targetDate >= urlStart && targetDate <= urlEnd)) {
        // SelectedDate year is outside URL range but within available range → override range to full year
        if (targetDate >= minDate && targetDate <= maxDate) {
          urlStart = new Date(`${targetDate.getFullYear()}-01-01`);
          urlEnd = new Date(`${targetDate.getFullYear()}-12-31`);
        }
        // SelectedDate outside available range → default
        else {
          urlStart = minDate;
          urlEnd = maxDate;
        }
      }
    } else {
      // No selectedDate → clamp URL range to available range
      const clampedStart = urlStart < minDate ? minDate : urlStart;
      const clampedEnd = urlEnd > maxDate ? maxDate : urlEnd;

      // If clamped range is valid, use it
      if (clampedEnd >= clampedStart) {
        urlStart = clampedStart;
        urlEnd = clampedEnd;
      }
      // If clamped range invalid → fallback to default
      else {
        urlStart = minDate;
        urlEnd = maxDate;
      }
    }

    // Only update state if different to prevent loops
    // Compare using ISO strings (YYYY-MM-DD) to ignore time components
    // (e.g., "today" with time vs "today" from URL at midnight)
    const urlStartStr = urlStart.toISOString().split("T")[0];
    const urlEndStr = urlEnd.toISOString().split("T")[0];
    const stateStartStr = startDate.toISOString().split("T")[0];
    const stateEndStr = endDate.toISOString().split("T")[0];

    if (urlStartStr !== stateStartStr || urlEndStr !== stateEndStr) {
      setStartDate(urlStart);
      setEndDate(urlEnd);
      setTempStartDate(urlStart);
      setTempEndDate(urlEnd);
      setSelectedRange([urlStart.getUTCFullYear(), urlEnd.getUTCFullYear()]);

      // Clear active states on external/URL update
      setActivePreset(null);
      setActivePresident("");
    }
  }, [latestPresStartDate, location.key, location.search]);

  const presidents = useMemo(() => {
    if (!presidentsArray || !presidentRelationDict) return {};

    const obj = {};

    presidentsArray.forEach((president) => {
      const relation = presidentRelationDict[president.id];
      if (!relation) return;

      const displayName = utils.extractNameFromProtobuf(president.name);

      obj[president.id] = {
        name: displayName,
        terms: [
          {
            start: relation.startTime,
            end: relation.endTime || new Date().toISOString().slice(0, 10),
          },
        ],
      };
    });

    return obj;
  }, [presidentsArray, presidentRelationDict]);

  // Preprocess dates into a lookup: year -> month -> count
  const dateCounts = useMemo(() => {
    if (!Array.isArray(dates) || dates.length === 0) return {};
    return dates.reduce((acc, d) => {
      const dt = new Date(d);
      const year = dt.getUTCFullYear();
      const month = dt.getUTCMonth();
      if (!acc[year]) acc[year] = Array(12).fill(0);
      acc[year][month] += 1;
      return acc;
    }, {});
  }, [dates]);

  const yearData = useMemo(() => {
    return years.reduce((acc, year) => {
      acc[year] = dateCounts[year] || Array(12).fill(0);
      return acc;
    }, {});
  }, [years, dateCounts]);

  // Update yearData when years array changes
  useEffect(() => {
    const newYearData = years.reduce((acc, year) => {
      if (dateCounts[year]) {
        acc[year] = dateCounts[year];
      } else {
        acc[year] = Array.from({ length: 12 }, () => 0);
      }
      return acc;
    }, {});

    // Update the ref
    Object.keys(newYearData).forEach((year) => {
      yearData[year] = newYearData[year];
    });
  }, [startYear, endYear, years]);

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

  // Get overlay metrics (left, width) for selected range
  function getPreciseOverlayMetrics() {
    if (!preciseMode) {
      const startPos = getYearPosition(selectedRange[0]);
      const endPos = getYearPosition(selectedRange[1]);
      const yearWidth = 100 / years.length;
      return {
        left: `${startPos}%`,
        width: `${endPos - startPos + yearWidth}%`,
      };
    }

    const startYearVal = tempStartDate.getUTCFullYear();
    const endYearVal = tempEndDate.getUTCFullYear();
    const startMonth = tempStartDate.getUTCMonth();
    const startDay = tempStartDate.getUTCDate();
    const endMonth = tempEndDate.getUTCMonth();
    const endDay = tempEndDate.getUTCDate();

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
    if (!preciseMode) {
      const startPos = getYearPosition(selectedRange[0]);
      const endPos = getYearPosition(selectedRange[1]);
      const yearWidth = 100 / years.length;
      return {
        startLeft: `${startPos}%`,
        endLeft: `${endPos + yearWidth}%`,
      };
    }

    const startYearVal = tempStartDate.getUTCFullYear();
    const endYearVal = tempEndDate.getUTCFullYear();
    const startMonth = tempStartDate.getUTCMonth();
    const startDay = tempStartDate.getUTCDate();
    const endMonth = tempEndDate.getUTCMonth();
    const endDay = tempEndDate.getUTCDate();

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

  // Helper: get position % for a year
  const getYearPosition = (year) => {
    const index = years.indexOf(year);
    if (index === -1) {
      // If year is not in range, clamp it to the nearest valid year
      if (year < startYear) return 0;
      if (year > endYear) return 100;
      return 0;
    }
    return (index / years.length) * 100;
  };

  // overlay and handle positions
  const overlayMetrics = React.useMemo(
    () => getPreciseOverlayMetrics(),
    [startDate, endDate, tempEndDate, tempStartDate, selectedRange]
  );
  const handlePositions = React.useMemo(
    () => getHandlePositions(),
    [startDate, endDate, tempEndDate, tempStartDate, selectedRange]
  );

  // Scroll overlay into view when metrics change
  useEffect(() => {
    if (!scrollWrapperRef.current || !containerRef.current) return;

    const scrollEl = scrollWrapperRef.current;
    const overlayLeftPct = parseFloat(overlayMetrics.left);
    const overlayWidthPct = parseFloat(overlayMetrics.width);

    const containerWidth = containerRef.current.offsetWidth;
    const overlayLeftPx = (overlayLeftPct / 100) * containerWidth;
    const overlayWidthPx = (overlayWidthPct / 100) * containerWidth;
    const overlayCenter = overlayLeftPx + overlayWidthPx / 2;

    const targetScrollLeft = overlayCenter - scrollEl.clientWidth / 2;

    scrollEl.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [overlayMetrics, selectedRange]);

  // Dragging logic
  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(handle);
    setPreciseMode(true);
    setActivePreset(null);
    setActivePresident("");
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

    let newDate = new Date(Date.UTC(targetYear, month, day));

    // Clamp to today if future date
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    if (newDate > todayUTC) {
      newDate = todayUTC;
    }

    if (isDragging === "start") {
      if (newDate <= endDate) {
        setTempStartDate(newDate);
        setSelectedRange([newDate.getUTCFullYear(), endDate.getUTCFullYear()]);
      }
    }

    if (isDragging === "end") {
      if (newDate >= startDate) {
        setTempEndDate(newDate);
        setSelectedRange([
          startDate.getUTCFullYear(),
          newDate.getUTCFullYear(),
        ]);
      }
    }
  };

  const handleWindowMove = (e) => {
    if (!isMovingWindow || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current;
    const percentageDelta = deltaX / rect.width;
    const totalYears = years.length;
    const yearDelta = percentageDelta * totalYears;

    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );

    // Current positions as floats
    const currentStartYearPos =
      years.indexOf(tempStartDate.getUTCFullYear()) +
      (tempStartDate.getUTCMonth() +
        (tempStartDate.getUTCDate() - 1) /
        new Date(
          Date.UTC(
            tempStartDate.getUTCFullYear(),
            tempStartDate.getUTCMonth() + 1,
            0
          )
        ).getUTCDate()) /
      12;

    const currentEndYearPos =
      years.indexOf(tempEndDate.getUTCFullYear()) +
      (tempEndDate.getUTCMonth() +
        tempEndDate.getUTCDate() /
        new Date(
          Date.UTC(
            tempEndDate.getUTCFullYear(),
            tempEndDate.getUTCMonth() + 1,
            0
          )
        ).getUTCDate()) /
      12;

    const windowSize = currentEndYearPos - currentStartYearPos;
    const newStartYearPos = currentStartYearPos + yearDelta;
    const newEndYearPos = currentEndYearPos + yearDelta;

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

    // Tentative dates
    let newTempStart = positionToDate(Math.max(0, newStartYearPos));
    let newTempEnd = positionToDate(Math.min(totalYears, newEndYearPos));

    // Clamp end to today
    if (newTempEnd > todayUTC) {
      newTempEnd = todayUTC;
      const endYearPos =
        years.indexOf(newTempEnd.getUTCFullYear()) +
        (newTempEnd.getUTCMonth() +
          newTempEnd.getUTCDate() /
          new Date(
            Date.UTC(
              newTempEnd.getUTCFullYear(),
              newTempEnd.getUTCMonth() + 1,
              0
            )
          ).getUTCDate()) /
        12;
      newTempStart = positionToDate(Math.max(0, endYearPos - windowSize));
    }

    // Update temp dates only
    if (newTempStart <= newTempEnd) {
      setTempStartDate(newTempStart);
      setTempEndDate(newTempEnd);
      setSelectedRange([
        newTempStart.getUTCFullYear(),
        newTempEnd.getUTCFullYear(),
      ]);
    }

    dragStartRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (isDragging || isMovingWindow) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      onDateChange?.([tempStartDate, tempEndDate]); // single call
    }
    setIsDragging(null);
    setIsMovingWindow(false);
  };
  useEffect(() => {
    if (onDateChange && startDate && endDate) {
      onDateChange([startDate, endDate]);
    }
  }, [startDate, endDate, onDateChange]);

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
  }, [isDragging, isMovingWindow, selectedRange]);

  // MiniChart component
  const MiniChart = ({ data, year, isInRange }) => {
    const validData =
      Array.isArray(data) && data.length > 0 ? data : Array(12).fill(0);
    const maxValue = Math.max(...validData, 1);

    // Adjusted vertical scaling (half)
    const points = validData
      .map((value, index) => {
        const x = (index / (validData.length - 1)) * 100;
        const y = 10 + (100 - (value / maxValue) * 50); // was 20 + 80
        return `${x},${y}`;
      })
      .join(" ");

    let startPercent = 0;
    let endPercent = 100;
    let hasSelection = isInRange;

    if (preciseMode && isInRange) {
      const currentYear = new Date().getFullYear();
      if (year === tempStartDate.getUTCFullYear()) {
        const startMonth = tempStartDate.getUTCMonth();
        const startDay = tempStartDate.getUTCDate();
        const daysInMonth = new Date(
          Date.UTC(year, startMonth + 1, 0)
        ).getUTCDate();
        const dayProgress = (startDay - 1) / daysInMonth;
        startPercent = ((startMonth + dayProgress) / 12) * 100;
      }

      if (year === tempEndDate.getUTCFullYear()) {
        if (year === currentYear && isEndDateToday()) {
          endPercent = 100;
        } else {
          const endMonth = tempEndDate.getUTCMonth();
          const endDay = tempEndDate.getUTCDate();
          const daysInMonth = new Date(
            Date.UTC(year, endMonth + 1, 0)
          ).getUTCDate();
          const dayProgress = endDay / daysInMonth;
          endPercent = ((endMonth + dayProgress) / 12) * 100;
        }
      }
    }

    const selectedWidth = endPercent - startPercent;

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`gradient-unselected-${year}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient
            id={`gradient-selected-${year}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
          </linearGradient>
          <clipPath id={`clip-selected-${year}`}>
            <rect x={startPercent} y="0" width={selectedWidth} height="100" />
          </clipPath>
          <clipPath id={`clip-unselected-${year}`}>
            <rect x="0" y="0" width="100" height="100" />
            <rect
              x={startPercent}
              y="0"
              width={selectedWidth}
              height="100"
              fill="black"
            />
          </clipPath>
        </defs>

        <polyline
          fill={`url(#gradient-unselected-${year})`}
          stroke="#94a3b8"
          strokeWidth="0.75"
          points={`0,100 ${points} 100,100`}
          clipPath={hasSelection ? `url(#clip-unselected-${year})` : undefined}
        />
        <polyline
          fill="none"
          stroke="#64748b"
          strokeWidth="1"
          points={points}
          clipPath={hasSelection ? `url(#clip-unselected-${year})` : undefined}
        />

        {hasSelection && (
          <>
            <polyline
              fill={`url(#gradient-selected-${year})`}
              stroke="#2563eb"
              strokeWidth="0.75"
              points={`0,100 ${points} 100,100`}
              clipPath={`url(#clip-selected-${year})`}
            />
            <polyline
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="1"
              points={points}
              clipPath={`url(#clip-selected-${year})`}
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="bg-background border-b border-border p-2 md:p-4 w-full mx-auto">
      {/* Presets and calendar */}
      <div className="hidden md:block pb-2 md:pb-4 px-1 text-primary text-center md:text-left md:px-0 text-xs md:text-sm font-medium md:font-semibold">
        Select a date range
      </div>
      <div className="flex gap-2 mb-2 md:mb-4 flex-wrap sm:justify-start justify-center">
        {/* Year presets */}
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
                setTempStartDate(new Date(Date.UTC(startYear, 0, 1)));
                setEndDate(new Date());
                setTempEndDate(new Date());
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
                setTempStartDate(start);
                setEndDate(today);
                setTempEndDate(today);
                setSelectedRange([
                  start.getUTCFullYear(),
                  today.getUTCFullYear(),
                ]);
              }
              setPreciseMode(true);
              setActivePreset(preset.label);
              setActivePresident("");
            }}
            className={`p-1 md:p-1.5 text-xs font-medium rounded-sm transition-colors hover:cursor-pointer ${activePreset === preset.label
              ? "bg-accent/20 text-primary"
              : "hover:bg-background/25 bg-foreground/10 text-primary hover:cursor-pointer"
              }`}
          >
            {preset.label}
          </button>
        ))}

        {/* Presidents dropdown */}
        <div className="relative w-full md:w-56 text-xs">
          {/* Main button */}
          <button
            className={`w-full px-3 py-1.5 text-left font-medium cursor-pointer rounded-md focus:outline-none flex justify-between items-center ${activePresident
              ? "bg-accent/20 text-primary"
              : "hover:bg-background/25 bg-foreground/10 text-primary hover:cursor-pointer"
              }`}
            onClick={() => setIsDropdownOpen((o) => !o)}
          >
            <span>
              {activePresident
                ? (() => {
                  const pres = presidents[activePresident];
                  if (!pres) return "By President Term";
                  if (pres.terms.length === 1) return pres.name;
                  const currentTerm = pres.terms.find(
                    (t) =>
                      startDate.getTime() === new Date(t.start).getTime() &&
                      endDate.getTime() === new Date(t.end).getTime()
                  );
                  return currentTerm
                    ? `${pres.name} (${new Date(
                      currentTerm.start
                    ).getUTCFullYear()} - ${new Date(
                      currentTerm.end
                    ).getUTCFullYear()})`
                    : pres.name;
                })()
                : "By President Term"}
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg">
              {Object.entries(presidents).map(([id, data]) => (
                <div key={id} className="group relative">
                  {/* President row */}
                  <button
                    className={`w-full px-3 py-1.5 text-left flex justify-between items-center cursor-pointer hover:bg-border ${activePresident === id
                      ? "bg-accent/20 text-primary"
                      : "text-primary"
                      }`}
                    onClick={() => {
                      if (data.terms.length === 1) {
                        const term = data.terms[0];
                        setActivePresident(id);
                        setStartDate(new Date(term.start));
                        setTempStartDate(new Date(term.start));
                        setEndDate(new Date(term.end));
                        setTempEndDate(new Date(term.end));
                        setSelectedRange([
                          new Date(term.start).getUTCFullYear(),
                          new Date(term.end).getUTCFullYear(),
                        ]);
                        setPreciseMode(true);
                        setActivePreset(null);
                        setIsDropdownOpen(false);
                      }
                    }}
                  >
                    {data.name}
                    {data.terms.length > 1 && (
                      <span className="ml-1 text-primary text-xs">▶</span>
                    )}
                  </button>

                  {/* Nested terms */}
                  {data.terms.length > 1 && (
                    <div className="absolute top-0 left-full mt-0 ml-1 w-40 bg-border border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.terms.map((term, idx) => (
                        <button
                          key={idx}
                          className={`w-full px-3 py-1.5 text-left cursor-pointer hover:bg-border ${activePresident === id &&
                            startDate.getTime() ===
                            new Date(term.start).getTime() &&
                            endDate.getTime() === new Date(term.end).getTime()
                            ? "bg-accent text-white"
                            : "text-primary"
                            }`}
                          onClick={() => {
                            setActivePresident(id);
                            setStartDate(new Date(term.start));
                            setTempStartDate(new Date(term.start));
                            setEndDate(new Date(term.end));
                            setTempEndDate(new Date(term.end));
                            setSelectedRange([
                              new Date(term.start).getUTCFullYear(),
                              new Date(term.end).getUTCFullYear(),
                            ]);
                            setPreciseMode(true);
                            setActivePreset(null);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {`${new Date(
                            term.start
                          ).getUTCFullYear()} - ${new Date(
                            term.end
                          ).getUTCFullYear()}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar button */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => {
              setCalendarStart(startDate);
              setCalendarEnd(endDate);
              setCalendarOpen((o) => !o);
            }}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer
      ${calendarRange &&
                startDate.toISOString() === calendarRange.start &&
                endDate.toISOString() === calendarRange.end
                ? "bg-accent text-white hover:bg-accent"
                : "bg-foreground/10 text-primary font-medium hover:bg-border"
              }`}
          >
            By Date
          </button>

          {calendarOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 z-50 w-full sm:w-auto bg-background p-3 rounded-md shadow-lg flex flex-col">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* From date */}
                <div className="flex-1 flex flex-col">
                  <p className="text-xs md:text-sm text-primary font-medium mb-1">From</p>
                  <DatePicker
                    selected={calendarStart}
                    onChange={setCalendarStart}
                    inline
                    monthsShown={1}
                    minDate={new Date(startYear, 0, 1)}
                    maxDate={calendarEnd || new Date()}
                    renderCustomHeader={({
                      date,
                      changeMonth,
                      changeYear,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => {
                      const toYear = calendarEnd?.getFullYear();
                      const toMonth = calendarEnd?.getMonth();

                      const years = Array.from(
                        { length: new Date().getFullYear() - startYear + 1 },
                        (_, i) => startYear + i
                      ).filter((year) => !toYear || year <= toYear);

                      const months = Array.from(
                        { length: 12 },
                        (_, i) => i
                      ).filter(
                        (month) =>
                          !toYear ||
                          date.getFullYear() !== toYear ||
                          month <= toMonth
                      );

                      return (
                        <div className="flex justify-between items-center px-2 py-1 gap-2">
                          <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            className={`p-1 rounded-full ${prevMonthButtonDisabled
                              ? "text-gray-500 cursor-not-allowed"
                              : "hover:cursor-pointer text-gray-700 hover:text-gray-800"
                              }`}
                          >
                            <ChevronLeft size={18} />
                          </button>

                          <select
                            value={date.getMonth()}
                            onChange={(e) =>
                              changeMonth(Number(e.target.value))
                            }
                            className="bg-white text-gray-900 px-2 py-1 rounded-sm border border-gray-300"
                          >
                            {months.map((m) => (
                              <option key={m} value={m}>
                                {new Date(0, m).toLocaleString("default", {
                                  month: "long",
                                })}
                              </option>
                            ))}
                          </select>

                          <select
                            value={date.getFullYear()}
                            onChange={(e) => changeYear(Number(e.target.value))}
                            className="bg-white text-gray-900 px-2 py-1 rounded-sm border border-gray-300"
                          >
                            {years.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className={`p-1 rounded-full ${nextMonthButtonDisabled
                              ? "text-gray-500 cursor-not-allowed"
                              : "hover:cursor-pointer text-gray-700 hover:text-gray-800"
                              }`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      );
                    }}
                    dayClassName={(date) => {
                      if (!calendarStart || !calendarEnd) {
                        if (!calendarStart) return "";
                        const start = calendarStart;
                        const endOfMonth = new Date(
                          start.getFullYear(),
                          start.getMonth() + 1,
                          0
                        );
                        if (date >= start && date <= endOfMonth) {
                          return "bg-blue-500/20 rounded-none";
                        }
                        return "";
                      }
                      const start = calendarStart;
                      const end = calendarEnd;

                      if (
                        start.getFullYear() === end.getFullYear() &&
                        start.getMonth() === end.getMonth()
                      ) {
                        if (date >= start && date <= end) {
                          return "bg-blue-500/20 rounded-none";
                        }
                        return "";
                      }
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

                {/* To date */}
                <div className="flex-1 flex flex-col">
                  <p className="text-xs md:text-sm text-primary font-medium mb-1">To</p>
                  <DatePicker
                    selected={calendarEnd}
                    onChange={setCalendarEnd}
                    inline
                    monthsShown={1}
                    minDate={calendarStart || new Date(startYear, 0, 1)}
                    maxDate={new Date()}
                    renderCustomHeader={({
                      date,
                      changeMonth,
                      changeYear,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => {
                      const fromYear = calendarStart?.getFullYear();
                      const fromMonth = calendarStart?.getMonth();

                      const years = Array.from(
                        { length: new Date().getFullYear() - startYear + 1 },
                        (_, i) => startYear + i
                      ).filter((year) => !fromYear || year >= fromYear);

                      const months = Array.from(
                        { length: 12 },
                        (_, i) => i
                      ).filter(
                        (month) =>
                          !fromYear ||
                          date.getFullYear() !== fromYear ||
                          month >= fromMonth
                      );

                      return (
                        <div className="flex justify-between items-center px-2 py-1 gap-2">
                          <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            className={`p-1 rounded-full ${prevMonthButtonDisabled
                              ? "text-gray-500 cursor-not-allowed"
                              : "hover:cursor-pointer text-gray-700 hover:text-gray-800"
                              }`}
                          >
                            <ChevronLeft size={18} />
                          </button>

                          <select
                            value={date.getMonth()}
                            onChange={(e) =>
                              changeMonth(Number(e.target.value))
                            }
                            className="bg-white text-gray-900 px-2 py-1 rounded-sm border border-gray-300"
                          >
                            {months.map((m) => (
                              <option key={m} value={m}>
                                {new Date(0, m).toLocaleString("default", {
                                  month: "long",
                                })}
                              </option>
                            ))}
                          </select>

                          <select
                            value={date.getFullYear()}
                            onChange={(e) => changeYear(Number(e.target.value))}
                            className="bg-white text-gray-900 px-2 py-1 rounded-sm border border-gray-300"
                          >
                            {years.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className={`p-1 rounded-full ${nextMonthButtonDisabled
                              ? "text-gray-500 cursor-not-allowed"
                              : "hover:cursor-pointer text-gray-700 hover:text-gray-800"
                              }`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      );
                    }}
                    dayClassName={(date) => {
                      if (!calendarStart || !calendarEnd) return "";

                      const start = calendarStart;
                      const end = calendarEnd;
                      if (
                        start.getFullYear() === end.getFullYear() &&
                        start.getMonth() === end.getMonth()
                      ) {
                        if (date >= start && date <= end) {
                          return "bg-blue-500/20 rounded-none";
                        }
                        return "";
                      }
                      if (
                        date >= start &&
                        date <=
                        new Date(start.getFullYear(), start.getMonth() + 1, 0)
                      ) {
                        return "bg-blue-500/20 rounded-none";
                      }
                      if (
                        date >=
                        new Date(end.getFullYear(), end.getMonth(), 1) &&
                        date <= end
                      ) {
                        return "bg-blue-500/20 rounded-none";
                      }
                      return "";
                    }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-1.5 mt-3">
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="px-3 py-1.5 bg-border text-primary rounded-md hover:bg-border cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      calendarStart &&
                      calendarEnd &&
                      calendarStart <= calendarEnd
                    ) {
                      setStartDate(calendarStart);
                      setEndDate(calendarEnd);
                      setTempStartDate(calendarStart);
                      setTempEndDate(calendarEnd);
                      setSelectedRange([
                        calendarStart.getUTCFullYear(),
                        calendarEnd.getUTCFullYear(),
                      ]);
                      setPreciseMode(true);
                      setCalendarOpen(false);
                      setActivePreset(null);
                      setActivePresident("");
                      setCalendarRange({
                        start: calendarStart.toISOString(),
                        end: calendarEnd.toISOString(),
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-accent text-primary cursor-pointer rounded-md hover:bg-accent text-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected range display */}
        <div className="flex items-center gap-1 w-full justify-center sm:w-auto sm:ml-auto sm:justify-end">
          <div className="px-2 py-1 text-xs rounded-full bg-border border border-border text-primary font-medium">
            {new Date(
              tempStartDate.toISOString().split("T")[0]
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <span className="text-primary font-medium text-xs">→</span>
          <div className="px-2 py-1 text-xs rounded-full bg-border border border-border text-primary font-medium">
            {new Date(
              tempEndDate.toISOString().split("T")[0]
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Scrollable chart */}
      <div
        ref={scrollWrapperRef}
        className="overflow-x-auto no-scrollbar overflow-y-hidden scroll-wrapper"
      >
        <div
          ref={containerRef}
          className="relative bg-foreground/10 mb-3"
          style={{ height: "27.5px", minWidth: `${years.length * 80}px` }}
        >
          <div className="flex h-full items-end">
            {years.map((year) => {
              const isInRange =
                year >= selectedRange[0] && year <= selectedRange[1];
              return (
                <div
                  key={year}
                  className={`relative transition-all duration-200 hover:cursor-pointer ${isInRange ? "opacity-100" : "opacity-40"
                    } border-l-1 border-r-1 border-foreground/50`}
                  style={{ height: "40px", flex: "1 0 0" }}
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
                    setTempStartDate(newStartDate);
                    setEndDate(newEndDate);
                    setTempEndDate(newEndDate);
                    setActivePreset(null);
                    setActivePresident("");
                  }}
                >
                  <MiniChart
                    data={yearData[year] || Array(12).fill(0)}
                    year={year}
                    isInRange={isInRange}
                  />
                  <div
                    className={`absolute -bottom- left-1/2 transform -translate-x-1/2 text-[11px] font-semibold ${isInRange ? "text-accent" : "text-primary"
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
            className="absolute top-0 bg-accent/40 border-t-2 border-accent transition-all duration-200"
            style={{
              left: overlayMetrics.left,
              width: overlayMetrics.width,
              height: "100%",
              pointerEvents: "none",
            }}
          />

          {/* Drag window */}
          <div
            className="absolute top-0 h-full cursor-move"
            style={{ left: overlayMetrics.left, width: overlayMetrics.width }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsMovingWindow(true);
              onDateChange?.([tempStartDate, tempEndDate]);
              setPreciseMode(true);
              setActivePreset(null);
              setActivePresident("");
              dragStartRef.current = e.clientX;
            }}
          />

          {/* Drag handles */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-accent cursor-ew-resize hover:bg-accent transition-colors z-10"
            style={{
              left: handlePositions.startLeft,
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "start")}
          />
          <div
            className="absolute top-0 bottom-0 w-2 bg-accent cursor-ew-resize hover:bg-accent transition-colors z-10"
            style={{
              left: handlePositions.endLeft,
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "end")}
          />
        </div>
      </div>
    </div>
  );
}