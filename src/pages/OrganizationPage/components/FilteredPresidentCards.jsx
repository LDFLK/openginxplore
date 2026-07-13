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
import useNetworkStatus from "../../../hooks/useNetworkStatus";
import PersonAvatar from "../../../components/PersonAvatar";

export default function FilteredPresidentCards({ dateRange = [null, null] }) {
  const dispatch = useDispatch();
  const presidents = useSelector((s) => s.presidency.presidentDict);
  const presidentRelationDict = useSelector(
    (s) => s.presidency.presidentRelationDict
  );
  const gazetteDateClassic = useSelector((s) => s.gazettes.gazetteDataClassic);
  const selectedPresident = useSelector((s) => s.presidency.selectedPresident);
  const selectedDate = useSelector((s) => s.presidency.selectedDate);
  const isOnline = useNetworkStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);
  const [urlInitComplete, setUrlInitComplete] = useState(false);
  const prevDateRangeRef = useRef([null, null]);
  const lastProcessedUrlRef = useRef("");
  // Tracks if this session was initialized from a valid URL with a specific selectedDate or compareDates.
  // When true, the dateRange (slider) effect skips auto-switching presidents.


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

    let validSelectedDate = urlSelectedDate;

    // If selectedDate is missing but we're in the changes view with compareDates, use the first date from compareDates
    if (!validSelectedDate) {
      const compareDates = params.get("compareDates");
      if (compareDates) {
        validSelectedDate = compareDates.split(",")[0];
      }
    }

    if (validSelectedDate) {
      const targetDate = new Date(validSelectedDate);
      let start = urlStartDate ? new Date(urlStartDate) : null;
      let end = urlEndDate ? new Date(urlEndDate) : null;

      // Only auto-compute range from selectedDate when no explicit dates were given.
      // If startDate/endDate are already in the URL, trust them as-is.
      if (!urlStartDate || !urlEndDate) {
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
    }

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
          new Date(validSelectedDate) < end;
        return matches;
      });

      if (presidentForDate) {
        selectPresidentAndDates(presidentForDate, urlRange, validSelectedDate);
        setInitializedFromUrl(true);
        setUrlInitComplete(true);

        lastProcessedUrlRef.current = window.location.search;
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
    const currentUrlSearch = window.location.search;
    const params = new URLSearchParams(currentUrlSearch);
    const urlStartDate = params.get("startDate");
    const urlEndDate = params.get("endDate");
    const hasFilterByName = params.get("filterByName");

    const formatLocalDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dateRangeMatchesUrl =
      currStart && currEnd &&
      urlStartDate && urlEndDate &&
      formatLocalDate(currStart) === urlStartDate &&
      formatLocalDate(currEnd) === urlEndDate;

    // If date range doesn't match URL AND it's not a minister search navigation, 
    // this is a manual change - clear the processed URL
    if (!dateRangeMatchesUrl && !hasFilterByName) {
      lastProcessedUrlRef.current = "";
    }

    // Don't auto-select if we just processed a URL change AND the date range matches that URL
    const isChangesView = params.get("view") === "changes";
    const hasValidUrlState = currentUrlSearch.includes('selectedDate') || (isChangesView && currentUrlSearch.includes('compareDates'));

    if (lastProcessedUrlRef.current === currentUrlSearch && dateRangeMatchesUrl && hasValidUrlState) {
      prevDateRangeRef.current = dateRange;
      return;
    }


    // Don't reset if the current president is still valid in the filtered list.
    const currentPresidentIsValid =
      selectedPresident && filteredPresidents.some((p) => p.id === selectedPresident.id);
    if (currentPresidentIsValid) {
      // Re-run the selection to update gazette bounds for the new date range.
      // We don't pass selectedDate so it auto-selects the last available gazette date 
      // within the new bounds, matching the user's expectations during slider drag.
      selectPresidentAndDates(selectedPresident);
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
  }, [dateRange, filteredPresidents, initializedFromUrl, urlInitComplete, location.search, selectedDate?.date]);

  useEffect(() => {
    if (!selectedDate?.date) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "department-flow") return;
    if (params.get("view") === "changes") return;

    if (!initializedFromUrl) return;

    const urlSelectedDate = params.get("selectedDate");
    const urlMinistry = params.get("ministry");
    const reduxDate = selectedDate.date;

    // Don't clobber a ministry deep link while Redux is still catching up to the URL
    if (urlMinistry && urlSelectedDate && urlSelectedDate !== reduxDate) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("selectedDate", reduxDate);
    if (urlSelectedDate && urlSelectedDate !== reduxDate) {
      url.searchParams.delete("ministry");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedDate, location.search, initializedFromUrl]);

  // Monitor URL parameter changes when already on /executive-branch route
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
        new Date(urlSelectedDate) < end;
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
      {dateRange && dateRange[0] && dateRange[1] && (
        <div className="text-center text-[10px] md:text-xs text-primary/60 mb-4 px-1">
          Presidents During The Period {new Date(dateRange[0]).toLocaleDateString("en-CA")} to {new Date(dateRange[1]).toLocaleDateString("en-CA")}
        </div>
      )}
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
                    ? "bg-accent/20 border-accent/35 shadow-md opacity-100"
                    : "bg-card border-border shadow-sm opacity-80 hover:opacity-100 hover:bg-accent/10 hover:border-accent/20"
                  }`}
              >
                <PersonAvatar
                  isOnline={isOnline}
                  imageUrl={president.imageUrl}
                  image={president.image}
                  name={nameText}
                  className="md:w-14 w-10 md:h-14 h-10 mr-3"
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
                  <div className="flex flex-nowrap gap-3 mt-1">
                    <Link
                      to={`/person-profile/${president?.id}`}
                      onClick={(e) => e.stopPropagation()}
                      state={{ mode: "back", from: location.pathname + location.search }}
                      className="text-primary/75 text-xs md:text-sm hover:text-accent transition-all animation duration-200 mt-1 flex items-center"
                    >
                      <EyeIcon size={16} className="mr-1" />
                      <p>View Profile</p>
                    </Link>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
