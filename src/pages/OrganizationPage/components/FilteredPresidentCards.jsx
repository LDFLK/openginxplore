import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo, useEffect, useRef } from "react";
import utils from "../../../utils/utils";
import {
  setSelectedPresident,
  setSelectedDate,
} from "../../../store/presidencySlice";
import { setGazetteData } from "../../../store/gazetteDate";
import { Link, useLocation } from "react-router-dom";
import { EyeIcon } from "lucide-react";

export default function FilteredPresidentCards({ dateRange = [null, null] }) {
  const dispatch = useDispatch();
  const presidents = useSelector((s) => s.presidency.presidentDict);
  const presidentRelationDict = useSelector(
    (s) => s.presidency.presidentRelationDict
  );
  const gazetteDateClassic = useSelector((s) => s.gazettes.gazetteDataClassic);
  const selectedPresident = useSelector((s) => s.presidency.selectedPresident);
  const selectedDate = useSelector((s) => s.presidency.selectedDate);

  const [searchTerm, setSearchTerm] = useState("");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);
  const [urlInitComplete, setUrlInitComplete] = useState(false);
  const prevDateRangeRef = useRef([null, null]);
  const lastProcessedUrlRef = useRef("");

  const location = useLocation()

  const filteredPresidents = useMemo(() => {
    if (!presidents) return [];
    const arr = Array.isArray(presidents)
      ? presidents
      : Object.values(presidents);
    const [rangeStart, rangeEnd] = dateRange;

    return arr
      .filter((p) => {
        const rel = presidentRelationDict[p.id];
        if (!rel) return false;
        if (!rangeStart || !rangeEnd) return true;
        const presStart = new Date(rel.startTime.split("T")[0]);
        const presEnd = rel.endTime
          ? new Date(rel.endTime.split("T")[0])
          : new Date();
        return presStart < rangeEnd && presEnd > rangeStart;
      })
      .filter((p) => {
        if (!searchTerm) return true;
        const nameText = utils.extractNameFromProtobuf(p.name);
        const rel = presidentRelationDict[p.id];
        const startYear = rel?.startTime ? rel.startTime.split("-")[0] : "";
        const endYear = rel?.endTime
          ? new Date(rel.endTime).getFullYear()
          : "Present";
        const term = startYear ? `${startYear} - ${endYear}` : "";
        const q = searchTerm.toLowerCase();
        return (
          nameText.toLowerCase().includes(q) || term.toLowerCase().includes(q)
        );
      });
  }, [presidents, presidentRelationDict, dateRange, searchTerm]);


  const selectPresidentAndDates = (
    president,
    urlDateRange = null,
    urlSelectedDate = null
  ) => {
    if (!president) {
      dispatch(setSelectedPresident(null));
      dispatch(setGazetteData([]));
      dispatch(setSelectedDate(null));
      return;
    }

    dispatch(setSelectedPresident(president));

    const rel = presidentRelationDict[president.id];
    const presStart = new Date(rel.startTime.split("T")[0]);
    const presEnd = rel?.endTime
      ? new Date(rel.endTime.split("T")[0])
      : new Date();

    const [rangeStart, rangeEnd] = urlDateRange || dateRange;

    const finalStart = rangeStart
      ? new Date(Math.max(presStart, rangeStart))
      : presStart;
    const finalEnd = rangeEnd ? new Date(Math.min(presEnd, rangeEnd)) : presEnd;

    const filteredDates = gazetteDateClassic
      .filter((d) => {
        const dd = new Date(d.date);
        return dd >= finalStart && dd < finalEnd;
      })
      .map((date) => (date));

    dispatch(setGazetteData(filteredDates));

    let selectedDateValue;
    if (urlSelectedDate) {
      selectedDateValue = { date: urlSelectedDate };
    } else if (filteredDates.length > 0) {
      selectedDateValue = filteredDates[filteredDates.length - 1];
    } else {
      selectedDateValue = { date: finalEnd.toISOString().split("T")[0] };
    }

    dispatch(setSelectedDate(selectedDateValue));
  };


  useEffect(() => {
    if (initializedFromUrl) return;

    if (
      !presidents ||
      (Array.isArray(presidents)
        ? presidents.length === 0
        : Object.keys(presidents).length === 0)
    )
      return;
    if (
      !presidentRelationDict ||
      Object.keys(presidentRelationDict).length === 0
    )
      return;
    if (!gazetteDateClassic || gazetteDateClassic.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    let urlSelectedDate = params.get("selectedDate");
    let urlStartDate = params.get("startDate");
    let urlEndDate = params.get("endDate");

    if (urlSelectedDate) {
      const targetDate = new Date(urlSelectedDate);
      let start = urlStartDate ? new Date(urlStartDate) : null;
      let end = urlEndDate ? new Date(urlEndDate) : null;

      if (!start || !end || targetDate < start || targetDate > end) {
        const year = targetDate.getFullYear();
        urlStartDate = `${year}-01-01`;
        urlEndDate = `${year}-12-31`;

        const url = new URL(window.location.href);
        url.searchParams.set("startDate", urlStartDate);
        url.searchParams.set("endDate", urlEndDate);
        window.history.replaceState({}, "", url.toString());

      }
    }

    const validSelectedDate = urlSelectedDate;

    if (validSelectedDate) {
      const urlRange = [new Date(urlStartDate), new Date(urlEndDate)];

      const allPresidents = Array.isArray(presidents)
        ? presidents
        : Object.values(presidents);

      const presidentForDate = allPresidents.find((p) => {
        const rel = presidentRelationDict[p.id];
        if (!rel || !rel.startTime) return false;

        const start = new Date(rel.startTime.split("T")[0]);
        const end = rel.endTime
          ? new Date(rel.endTime.split("T")[0])
          : new Date();

        const matches =
          new Date(validSelectedDate) >= start &&
          new Date(validSelectedDate) <= end;
        return matches;
      });

      if (presidentForDate) {
        selectPresidentAndDates(presidentForDate, urlRange, validSelectedDate);
        setInitializedFromUrl(true);
        setUrlInitComplete(true);
        return;
      }
    }

    if (filteredPresidents.length > 0) {
      const lastPresident = filteredPresidents[filteredPresidents.length - 1];
      selectPresidentAndDates(lastPresident);
      setInitializedFromUrl(true);
    }
  }, [
    presidents,
    presidentRelationDict,
    gazetteDateClassic,
    initializedFromUrl,
  ]);

  useEffect(() => {
    if (!initializedFromUrl) return;

    const [prevStart, prevEnd] = prevDateRangeRef.current;
    const [currStart, currEnd] = dateRange;

    // If current range is null, we can't filter yet.
    // We don't skip the first non-null range update anymore.
    if (currStart === null && currEnd === null) {
      prevDateRangeRef.current = dateRange;
      return;
    }

    if (prevStart === currStart && prevEnd === currEnd) return;

    if (urlInitComplete) {
      setUrlInitComplete(false);
      prevDateRangeRef.current = dateRange;
      return;
    }

    // Check if this date range change matches the URL we just processed
    const currentUrlSearch = location.search;
    const params = new URLSearchParams(currentUrlSearch);
    const urlStartDate = params.get("startDate");
    const urlEndDate = params.get("endDate");
    const hasFilterByName = params.get("filterByName");

    const dateRangeMatchesUrl =
      currStart && currEnd &&
      urlStartDate && urlEndDate &&
      currStart.toISOString().split("T")[0] === urlStartDate &&
      currEnd.toISOString().split("T")[0] === urlEndDate;

    // If date range doesn't match URL AND it's not a minister search navigation, 
    // this is a manual change - clear the processed URL
    if (!dateRangeMatchesUrl && !hasFilterByName) {
      lastProcessedUrlRef.current = "";
    }

    // Don't auto-select if we just processed a URL change AND the date range matches that URL
    if (lastProcessedUrlRef.current === currentUrlSearch && dateRangeMatchesUrl && currentUrlSearch.includes('selectedDate')) {
      prevDateRangeRef.current = dateRange;
      return;
    }

    if (filteredPresidents.length > 0) {
      const lastPresident = filteredPresidents[filteredPresidents.length - 1];
      selectPresidentAndDates(lastPresident);
    } else {
      selectPresidentAndDates(null);
    }

    prevDateRangeRef.current = dateRange;
  }, [dateRange, filteredPresidents, initializedFromUrl, urlInitComplete]);

  useEffect(() => {
    if (!selectedDate?.date) return;
    const url = new URL(window.location.href);
    url.searchParams.set("selectedDate", selectedDate.date);
    window.history.replaceState({}, "", url.toString());
  }, [selectedDate]);

  // Monitor URL parameter changes when already on /organization route
  useEffect(() => {
    // Only run after initial URL initialization is complete
    if (!initializedFromUrl) return;

    // Don't run if we don't have the required data yet
    if (
      !presidents ||
      (Array.isArray(presidents)
        ? presidents.length === 0
        : Object.keys(presidents).length === 0)
    )
      return;
    if (
      !presidentRelationDict ||
      Object.keys(presidentRelationDict).length === 0
    )
      return;
    if (!gazetteDateClassic || gazetteDateClassic.length === 0) return;

    const currentUrlSearch = location.search;
    const params = new URLSearchParams(currentUrlSearch);
    const urlSelectedDate = params.get("selectedDate");
    const urlStartDate = params.get("startDate");
    const urlEndDate = params.get("endDate");

    // If no URL params, don't do anything
    if (!urlSelectedDate || !urlStartDate || !urlEndDate) return;

    // Check if we've already processed this exact URL
    // BUT always process if it's a minister search (has filterByName parameter)
    const hasFilterByName = params.get("filterByName");
    if (lastProcessedUrlRef.current === currentUrlSearch && !hasFilterByName) return;

    // Find the president for the selected date
    const allPresidents = Array.isArray(presidents)
      ? presidents
      : Object.values(presidents);

    const presidentForDate = allPresidents.find((p) => {
      const rel = presidentRelationDict[p.id];
      if (!rel || !rel.startTime) return false;

      const start = new Date(rel.startTime.split("T")[0]);
      const end = rel.endTime
        ? new Date(rel.endTime.split("T")[0])
        : new Date();

      const matches =
        new Date(urlSelectedDate) >= start &&
        new Date(urlSelectedDate) <= end;
      return matches;
    });

    if (presidentForDate) {
      const urlRange = [new Date(urlStartDate), new Date(urlEndDate)];
      selectPresidentAndDates(presidentForDate, urlRange, urlSelectedDate);
      // Mark this URL as processed after successful update
      lastProcessedUrlRef.current = currentUrlSearch;
    }
  }, [location.search, location.key, initializedFromUrl, presidents, presidentRelationDict, gazetteDateClassic]);


  return (
    <div className="rounded-lg w-full">
      {filteredPresidents.length > 4 && (
        <input
          type="text"
          className="border border-border bg-gray-800 text-gray-200 p-2 mb-3 w-full rounded placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          placeholder="Search presidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      {filteredPresidents.length === 0 ? (
        <div className="text-left text-gray-500 py-2 text-xs md:text-sm italic">
          No president information found for the selected date range.
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 pb-2 md:pb-0 no-scrollbar">
          {filteredPresidents.map((president) => {
            const isSelected = selectedPresident?.id === president.id;
            const nameText = utils.extractNameFromProtobuf(president.name);
            const rel = presidentRelationDict[president.id];
            const startYear = rel?.startTime ? rel.startTime.split("-")[0] : "";
            const endYear = rel?.endTime
              ? new Date(rel.endTime).getFullYear()
              : "Present";
            const term = startYear ? `${startYear} - ${endYear}` : "";

            return (
              <button
                key={president.id}
                onClick={() => selectPresidentAndDates(president)}
                className={`min-w-[60vw] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-center flex items-center p-1.5 md:p-2 rounded-lg border transition-all duration-200 hover:cursor-pointer
    ${isSelected
                    ? "bg-accent/20 border-accent/35 shadow-md"
                    : "bg-foreground/5 border-primary/15 hover:bg-foreground/15"
                  }`}
              >
                <img
                  src={president.imageUrl || president.image || ""}
                  alt={nameText}
                  className="md:w-14 w-10 md:h-14 h-10 object-cover rounded-full mr-3 border border-border flex-shrink-0"
                />
                <div className="flex flex-col flex-1 text-left min-w-0">
                  <p
                    className={`font-medium text-xs md:text-sm break-words whitespace-normal ${isSelected ? "text-accent" : "text-primary"
                      }`}
                  >
                    {nameText}
                  </p>
                  <p className="text-xs md:text-sm text-primary/50 break-words whitespace-normal">
                    {term}
                  </p>
                  <Link
                    to={`/person-profile/${president?.id}`}
                    state={{ mode: "back", from: location.pathname + location.search }}
                    className="text-primary/75 text-xs md:text-sm hover:text-accent transition-all animation duration-200 mt-1 flex"
                  >
                    <EyeIcon size={16} className="mr-1" />
                    <p>View Profile</p>
                  </Link>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
