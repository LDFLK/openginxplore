import GazetteTimeline from "../components/GazetteTimeline";
import MinistryCardGrid from "../components/MinistryCardGrid";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FilteredPresidentCards from "../components/FilteredPresidentCards";
import CabinetFlow from "../../cabinetFlowPage/screens/CabinetFlow"
import LandscapeRequired from "../../../components/landscapeRequired";
import { setSelectedDate } from "../../../store/presidencySlice";
import { resolveGazetteDate } from "../../../utils/gazetteDateUtils";

const Organization = ({ dateRange }) => {
  const dispatch = useDispatch();
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const gazetteData = useSelector((state) => state.gazettes.gazetteData);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'structure');
  const [multiSelectedDates, setMultiSelectedDates] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const datesParam = params.get('compareDates');
    return datesParam ? datesParam.split(',') : [];
  });

  const handleMultiSelectChange = useCallback((date) => {
    setMultiSelectedDates((prev) => {
      const newDates = prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].slice(-10);

      // Sync to URL
      const params = new URLSearchParams(window.location.search);
      if (newDates.length > 0) {
        params.set("compareDates", newDates.join(","));
      } else {
        params.delete("compareDates");
      }
      setSearchParams(params, { replace: true });

      return newDates;
    });
  }, [setSearchParams]);

  const lastResetState = useRef(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!selectedPresident || !gazetteData || gazetteData.length === 0) return;

    // Track ONLY president.id so it doesn't clobber your toggleView state when switching tabs
    const currentStateKey = `${selectedPresident.id}`;

    if (lastResetState.current !== currentStateKey) {
      lastResetState.current = currentStateKey;

      if (activeView === "structure") {
        if (!isFirstMount.current) {
          const params = new URLSearchParams(window.location.search);
          const urlSelectedDate = params.get("selectedDate");

          // Prefer the URL's selectedDate over the default lastGazette.
          // This prevents an intermediate president-switch from wiping the shared date.
          const gazetteItem = urlSelectedDate
            ? gazetteData.find((g) => g.date === urlSelectedDate)
            : null;

          const dateToSet = gazetteItem ?? gazetteData[gazetteData.length - 1];
          if (dateToSet) {
            dispatch(setSelectedDate(dateToSet));
          }
        }
      } else if (activeView === "changes") {
        const params = new URLSearchParams(window.location.search);
        const datesFromUrl = params.get("compareDates");

        if (isFirstMount.current && datesFromUrl) {
          setMultiSelectedDates(datesFromUrl.split(","));
        } else if (datesFromUrl) {
          // President changed and URL has compareDates.
          // Validate them against the NEW president's gazette data to distinguish:
          //   - URL share: dates are valid for this president → preserve
          //   - Manual president click: old dates don't belong here → reset to defaults
          const urlDates = datesFromUrl.split(",");
          const gazetteDataDates = new Set(gazetteData.map((g) => g.date));
          const allValid = urlDates.every((d) => gazetteDataDates.has(d));

          if (allValid) {
            setMultiSelectedDates(urlDates);
          } else {
            // Manual president switch: reset to first + last gazette of the new president
            const firstGazette = gazetteData[0];
            const lastGazette = gazetteData[gazetteData.length - 1];
            const newDates = [];
            if (firstGazette?.date) newDates.push(firstGazette.date);
            if (lastGazette?.date && lastGazette.date !== firstGazette?.date) newDates.push(lastGazette.date);
            setMultiSelectedDates(newDates);
            params.set("compareDates", newDates.join(","));
            setSearchParams(params, { replace: true });
          }
        } else {
          const firstGazette = gazetteData[0];
          const lastGazette = gazetteData[gazetteData.length - 1];

          // Use selectedDate if available instead of forcing the lastGazette
          const targetDate = selectedDate?.date ? selectedDate.date : lastGazette?.date;

          const newDates = [];
          if (firstGazette?.date) newDates.push(firstGazette.date);
          if (targetDate && targetDate !== firstGazette?.date) {
            newDates.push(targetDate);
          }
          setMultiSelectedDates(newDates);

          if (newDates.length > 0) {
            params.set("compareDates", newDates.join(","));
            setSearchParams(params, { replace: true });
          }
        }
      }
      isFirstMount.current = false;
    }
  }, [selectedPresident, gazetteData, activeView, dispatch, setSearchParams, selectedDate]);

  useEffect(() => {
    const view = searchParams.get("view") || "structure";
    setActiveView(view);
  }, [searchParams]);


  const handleMinistryNodeClick = useCallback((node) => {
    const resolvedDate = resolveGazetteDate(node.time, gazetteData);
    dispatch(setSelectedDate({ date: resolvedDate }));
    const params = new URLSearchParams(window.location.search);
    params.delete("compareDates");
    params.set("view", "structure");
    params.set("selectedDate", resolvedDate);
    params.set("ministry", node.id);
    setSearchParams(params);
    setActiveView("structure");
  }, [dispatch, setSearchParams, gazetteData]);

  const toggleView = (viewName) => {
    setActiveView(viewName);
    const params = new URLSearchParams(window.location.search);
    params.set("view", viewName);
    if (viewName === "changes") {
      params.delete("selectedDate");
      params.delete("ministry");

      const firstGazette = gazetteData && gazetteData.length > 0 ? gazetteData[0] : null;

      const newDates = [];
      if (firstGazette?.date) newDates.push(firstGazette.date);
      if (selectedDate?.date && selectedDate.date !== firstGazette.date) newDates.push(selectedDate.date);
      setMultiSelectedDates(newDates);

      if (newDates.length > 0) {
        params.set("compareDates", newDates.join(","));
      } else {
        params.delete("compareDates");
      }
    } else if (viewName === "structure") {
      params.delete("compareDates");
      if (multiSelectedDates.length > 0) {
        // Sort dates to get the latest
        const sorted = [...multiSelectedDates].sort();
        const latest = sorted[sorted.length - 1];

        const gazetteItem = gazetteData?.find(g => g.date === latest);
        if (gazetteItem) {
          dispatch(setSelectedDate(gazetteItem));
        } else {
          dispatch(setSelectedDate({ date: latest }));
        }
      }
    }
    setSearchParams(params);
  };

  const { president } = location.state || {};
  useEffect(() => {
    if (president) {
      const currentState = location.state || {};
      const newState = { ...currentState };
      if (Object.prototype.hasOwnProperty.call(newState, "president")) {
        delete newState.president;
      }
      navigate(`${location.pathname}${location.search}`, { replace: true, state: newState });
    }
  }, [president, navigate, location.pathname, location.search]);

  return (
    <div>
      {/* FilteredPresidentCards Component */}
      {dateRange[0] && dateRange[1] && (
        <div className="mb-4 px-2 md:px-4">
          <FilteredPresidentCards dateRange={dateRange} />
        </div>
      )}

      {/* Card wrapper for Content */}
      <div className="bg-card rounded-lg border border-border p-2 md:p-4 mx-2 md:mx-4 mb-4">
        {/* View Toggle Tabs */}
        <div className="flex items-end border-b border-border mb-4 gap-2 px-2">
          <button
            onClick={() => toggleView("structure")}
            className={`min-w-[140px] md:min-w-[160px] px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:cursor-pointer rounded-t-xl border-t border-l border-r relative ${activeView === "structure"
              ? "bg-card border-border text-primary"
              : "bg-muted border-transparent text-primary/60 hover:bg-muted/80 hover:text-primary"
              }`}
          >
            Structure
            {activeView === "structure" && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-card" />
            )}
          </button>
          <button
            onClick={() => toggleView("changes")}
            className={`min-w-[140px] md:min-w-[160px] px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:cursor-pointer rounded-t-xl border-t border-l border-r relative ${activeView === "changes"
              ? "bg-card border-border text-primary"
              : "bg-muted border-transparent text-primary/60 hover:bg-muted/80 hover:text-primary"
              }`}
          >
            Changes
            {activeView === "changes" && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-card" />
            )}
          </button>
        </div>


        {/* Gazette Timeline (Moved outside the white box) */}
        <GazetteTimeline
          multiSelect={activeView === "changes"}
          multiSelectedDates={multiSelectedDates}
          onMultiSelectChange={handleMultiSelectChange}
        />


        {/* Conditional rendering based on active view */}
        {activeView === "structure" ? (
          <>
            {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
          </>
        ) : (
          <LandscapeRequired onBack={() => toggleView("structure")}>
            <CabinetFlow
              key={selectedPresident?.id}
              presidentId={selectedPresident?.id}
              dateRange={dateRange}
              selectedDates={multiSelectedDates}
              onMinistryNodeClick={handleMinistryNodeClick}
            />
          </LandscapeRequired>
        )}
      </div>
    </div>
  );
};

export default Organization;