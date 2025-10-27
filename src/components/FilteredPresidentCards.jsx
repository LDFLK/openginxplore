import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo, useEffect, useRef } from "react";
import utils from "../utils/utils";
import { setSelectedPresident, setSelectedDate } from "../store/presidencySlice";
import { setGazetteData } from "../store/gazetteDate";

export default function FilteredPresidentCards({ dateRange = [null, null] }) {
  const dispatch = useDispatch();
  const presidents = useSelector((s) => s.presidency.presidentDict);
  const presidentRelationDict = useSelector((s) => s.presidency.presidentRelationDict);
  const gazetteDateClassic = useSelector((s) => s.gazettes.gazetteDataClassic);
  const selectedPresident = useSelector((s) => s.presidency.selectedPresident);
  const selectedDate = useSelector((s) => s.presidency.selectedDate);

  const [searchTerm, setSearchTerm] = useState("");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);
  const [urlInitComplete, setUrlInitComplete] = useState(false);
  const prevDateRangeRef = useRef([null, null]);


  const filteredPresidents = useMemo(() => {
    if (!presidents) return [];
    const arr = Array.isArray(presidents) ? presidents : Object.values(presidents);
    const [rangeStart, rangeEnd] = dateRange;

    return arr
      .filter((p) => {
        const rel = presidentRelationDict[p.id];
        if (!rel) return false;
        if (!rangeStart || !rangeEnd) return true;
        const presStart = new Date(rel.startTime.split("T")[0]);
        const presEnd = rel.endTime ? new Date(rel.endTime.split("T")[0]) : new Date();
        return presStart < rangeEnd && presEnd > rangeStart;
      })
      .filter((p) => {
        if (!searchTerm) return true;
        const nameText = utils.extractNameFromProtobuf(p.name);
        const rel = presidentRelationDict[p.id];
        const startYear = rel?.startTime ? rel.startTime.split("-")[0] : "";
        const endYear = rel?.endTime ? new Date(rel.endTime).getFullYear() : "Present";
        const term = startYear ? `${startYear} - ${endYear}` : "";
        const q = searchTerm.toLowerCase();
        return nameText.toLowerCase().includes(q) || term.toLowerCase().includes(q);
      });
  }, [presidents, presidentRelationDict, dateRange, searchTerm]);


  const selectPresidentAndDates = (president, urlDateRange = null, urlSelectedDate = null) => {
    if (!president) {
      dispatch(setSelectedPresident(null));
      dispatch(setGazetteData([]));
      dispatch(setSelectedDate(null));
      return;
    }

    dispatch(setSelectedPresident(president));

    const rel = presidentRelationDict[president.id];
    const presStart = new Date(rel.startTime.split("T")[0]);
    const presEnd = rel?.endTime ? new Date(rel.endTime.split("T")[0]) : new Date();


    const [rangeStart, rangeEnd] = urlDateRange || dateRange;

    const finalStart = rangeStart ? new Date(Math.max(presStart, rangeStart)) : presStart;
    const finalEnd = rangeEnd ? new Date(Math.min(presEnd, rangeEnd)) : presEnd;


    const filteredDates = gazetteDateClassic
      .filter((d) => {
        const dd = new Date(d);
        return dd >= finalStart && dd < finalEnd;
      })
      .map((date) => ({ date }));

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
    if (!presidentRelationDict || Object.keys(presidentRelationDict).length === 0)
      return;
    if (!gazetteDateClassic || gazetteDateClassic.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    let urlSelectedDate = params.get("selectedDate");
    let urlStartDate = params.get("startDate");
    let urlEndDate = params.get("endDate");

    console.log("=== URL PARAMS ===");
    console.log("selectedDate:", urlSelectedDate);
    console.log("startDate:", urlStartDate);
    console.log("endDate:", urlEndDate);

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

        console.log(
          ` SelectedDate outside range → overriding to full year: ${urlStartDate} → ${urlEndDate}`
        );
      }
    }


    const validSelectedDate = urlSelectedDate;

    if (validSelectedDate) {
      const urlRange = [new Date(urlStartDate), new Date(urlEndDate)];

      console.log("Target date:", new Date(validSelectedDate));
      console.log("Looking through all presidents...");

      const allPresidents = Array.isArray(presidents)
        ? presidents
        : Object.values(presidents);

      const presidentForDate = allPresidents.find((p) => {
        const rel = presidentRelationDict[p.id];
        if (!rel || !rel.startTime) return false;

        const start = new Date(rel.startTime.split("T")[0]);
        const end = rel.endTime ? new Date(rel.endTime.split("T")[0]) : new Date();

        const matches = new Date(validSelectedDate) >= start && new Date(validSelectedDate) <= end;
        return matches;
      });

      if (presidentForDate) {
        selectPresidentAndDates(
          presidentForDate,
          urlRange,
          validSelectedDate
        );
        setInitializedFromUrl(true);
        setUrlInitComplete(true);
        return;
      }
    }

    console.log("No valid selectedDate in URL, selecting last president");
    if (filteredPresidents.length > 0) {
      const lastPresident = filteredPresidents[filteredPresidents.length - 1];
      selectPresidentAndDates(lastPresident);
      setInitializedFromUrl(true);
    }
  }, [presidents, presidentRelationDict, gazetteDateClassic, initializedFromUrl]);






  useEffect(() => {
    if (!initializedFromUrl) return;

    const [prevStart, prevEnd] = prevDateRangeRef.current;
    const [currStart, currEnd] = dateRange;


    if (prevStart === null && prevEnd === null) {
      console.log("Initial dateRange set, storing reference");
      prevDateRangeRef.current = dateRange;
      return;
    }


    if (prevStart === currStart && prevEnd === currEnd) return;


    if (urlInitComplete) {
      console.log("Skipping first dateRange trigger after URL init");
      setUrlInitComplete(false);
      prevDateRangeRef.current = dateRange;
      return;
    }

    console.log("Date range changed by user, selecting last president");

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


    if (dateRange[0]) {
      url.searchParams.set("startDate", dateRange[0].toISOString().split("T")[0]);
    }
    if (dateRange[1]) {
      url.searchParams.set("endDate", dateRange[1].toISOString().split("T")[0]);
    }

    window.history.replaceState({}, "", url.toString());
  }, [selectedDate, dateRange]);


  return (
    <div className="rounded-lg w-full mt-2 -mb-6">
      {filteredPresidents.length > 4 && (
        <input
          type="text"
          className="border border-gray-600 bg-gray-800 text-gray-200 p-2 mb-3 w-full rounded placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          placeholder="Search presidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      {filteredPresidents.length === 0 ? (
        <div className="text-left text-gray-500 py-2 text-xs italic">
          No president information found for the selected date range.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredPresidents.map((president) => {
            const isSelected = selectedPresident?.id === president.id;
            const nameText = utils.extractNameFromProtobuf(president.name);
            const rel = presidentRelationDict[president.id];
            const startYear = rel?.startTime ? rel.startTime.split("-")[0] : "";
            const endYear = rel?.endTime ? new Date(rel.endTime).getFullYear() : "Present";
            const term = startYear ? `${startYear} - ${endYear}` : "";

            return (
              <button
                key={president.id}
                onClick={() => selectPresidentAndDates(president)}
                className={`flex items-center p-1 rounded-lg border transition-all duration-200 hover:cursor-pointer
    ${isSelected
                    ? "bg-blue-600/20 border-blue-400 shadow-md"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
              >
                <img
                  src={president.imageUrl || president.image || ""}
                  alt={nameText}
                  className="w-10 h-10 object-cover rounded-full mr-3 border border-gray-600 flex-shrink-0"
                />
                <div className="flex flex-col flex-1 text-left min-w-0">
                  <p
                    className={`font-medium text-sm break-words whitespace-normal ${isSelected ? "text-blue-400" : "text-gray-200"
                      }`}
                  >
                    {nameText}
                  </p>
                  <p className="text-xs text-gray-400 break-words whitespace-normal">
                    {term}
                  </p>
                </div>
              </button>

            );
          })}
        </div>
      )}
    </div>
  );

}