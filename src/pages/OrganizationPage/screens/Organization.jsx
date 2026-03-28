import GazetteTimeline from "../components/GazetteTimeline";
import MinistryCardGrid from "../components/MinistryCardGrid";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FilteredPresidentCards from "../components/FilteredPresidentCards";
import CabinetFlow from "../../cabinetFlowPage/screens/CabinetFlow"
import LandscapeRequired from "../../../components/landscapeRequired";

const Organization = ({ dateRange }) => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'cabinet-structure');

  const toggleView = (viewName) => {
    setActiveView(viewName);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("view", viewName);
    setSearchParams(currentParams);
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

      {/* View Toggle */}
      <div className="flex items-center justify-center my-3 md:my-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 border border-border dark:bg-gray-900">
          <button
            onClick={() => toggleView("cabinet-structure")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:cursor-pointer w-32 md:w-40 ${activeView === "cabinet-structure"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-200 hover:dark:bg-gray-800 hover:dark:text-gray-200"
              }`}
          >
            Cabinet Structure
          </button>
          <button
            onClick={() => toggleView("department-flow")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:cursor-pointer w-32 md:w-40 ${activeView === "department-flow"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-200 hover:dark:bg-gray-800 hover:dark:text-gray-200"
              }`}
          >
            Department Flow
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active view */}
      {activeView === "cabinet-structure" ? (
        <>
          <GazetteTimeline />
          {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
        </>
      ) : (
        <LandscapeRequired onBack={() => toggleView("cabinet-structure")}>
          <CabinetFlow key={selectedPresident?.id} presidentId={selectedPresident?.id}/>
        </LandscapeRequired>
      )}
    </div>
  );
};

export default Organization;