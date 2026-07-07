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
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'cabinet-structure');
  const [multiSelectedDates, setMultiSelectedDates] = useState([]);

  const presidentRelationDict = useSelector((s) => s.presidency.presidentRelationDict);

  const handleMultiSelectChange = useCallback((date) => {
    setMultiSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].slice(-3) // Max 3 dates allowed
    );
  }, []);

  const lastResetPresidentId = useRef(null);

  useEffect(() => {
    if (!selectedPresident || !gazetteData || gazetteData.length === 0) return;

    if (lastResetPresidentId.current !== selectedPresident.id) {
      lastResetPresidentId.current = selectedPresident.id;

      if (activeView === "cabinet-structure") {
        const lastGazette = gazetteData[gazetteData.length - 1];
        if (lastGazette) {
          dispatch(setSelectedDate(lastGazette));
        }
      } else if (activeView === "department-flow") {
        const firstGazette = gazetteData[0];
        const lastGazette = gazetteData[gazetteData.length - 1];

        const newDates = [];
        if (firstGazette?.date) newDates.push(firstGazette.date);
        if (lastGazette?.date && lastGazette.date !== firstGazette?.date) {
          newDates.push(lastGazette.date);
        }
        setMultiSelectedDates(newDates);
      }
    }
  }, [selectedPresident, gazetteData, activeView, dispatch]);

  // Aggressive fallback to ensure the timeline always has defaults on refresh or when cleared in Changes tab
  useEffect(() => {
    if (activeView === "department-flow" && multiSelectedDates.length === 0 && gazetteData?.length > 0) {
      const firstGazette = gazetteData[0];
      const lastGazette = gazetteData[gazetteData.length - 1];

      const newDates = [];
      if (firstGazette?.date) newDates.push(firstGazette.date);
      if (lastGazette?.date && lastGazette.date !== firstGazette?.date) {
        newDates.push(lastGazette.date);
      }
      setMultiSelectedDates(newDates);
    }
  }, [activeView, gazetteData, multiSelectedDates.length]);

  useEffect(() => {
    const view = searchParams.get("view") || "cabinet-structure";
    setActiveView(view);

    if (view === "department-flow" && (searchParams.has("selectedDate") || searchParams.has("ministry"))) {
      const params = new URLSearchParams(window.location.search);
      params.delete("selectedDate");
      params.delete("ministry");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleMinistryNodeClick = useCallback((node) => {
    const resolvedDate = resolveGazetteDate(node.time, gazetteData);
    dispatch(setSelectedDate({ date: resolvedDate }));
    const params = new URLSearchParams(window.location.search);
    params.set("view", "cabinet-structure");
    params.set("selectedDate", resolvedDate);
    params.set("ministry", node.id);
    setSearchParams(params);
    setActiveView("cabinet-structure");
  }, [dispatch, setSearchParams, gazetteData]);

  const toggleView = (viewName) => {
    setActiveView(viewName);
    const params = new URLSearchParams(window.location.search);
    params.set("view", viewName);
    if (viewName === "department-flow") {
      params.delete("selectedDate");
      params.delete("ministry");

      const firstGazette = gazetteData && gazetteData.length > 0 ? gazetteData[0] : null;

      const newDates = [];
      if (firstGazette?.date) newDates.push(firstGazette.date);
      if (selectedDate?.date && selectedDate.date !== firstGazette?.date) newDates.push(selectedDate.date);
      setMultiSelectedDates(newDates);
    } else if (viewName === "cabinet-structure") {
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
        <div className="mb-1 md:mb-6 px-2 md:px-4">
          <FilteredPresidentCards dateRange={dateRange} />
        </div>
      )}

      {/* Gazette Timeline visible for both views */}
      <GazetteTimeline
        multiSelect={activeView === "department-flow"}
        multiSelectedDates={multiSelectedDates}
        onMultiSelectChange={handleMultiSelectChange}
      />

      {/* View Toggle Tabs (Moved below GazetteTimeline) */}
      <div className="flex border-b border-border mt-2 mb-4 px-2 md:px-4 gap-1">
        <button
          onClick={() => toggleView("cabinet-structure")}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 hover:cursor-pointer rounded-t-lg border-t border-l border-r ${activeView === "cabinet-structure"
            ? "bg-background border-border text-foreground -mb-[1px] shadow-sm z-10"
            : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
        >
          Structure
        </button>
        <button
          onClick={() => toggleView("department-flow")}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 hover:cursor-pointer rounded-t-lg border-t border-l border-r ${activeView === "department-flow"
            ? "bg-background border-border text-foreground -mb-[1px] shadow-sm z-10"
            : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
        >
          Changes
        </button>
      </div>

      {/* Conditional rendering based on active view */}
      {activeView === "cabinet-structure" ? (
        <>
          {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
        </>
      ) : (
        <LandscapeRequired onBack={() => toggleView("cabinet-structure")}>
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
  );
};

export default Organization;