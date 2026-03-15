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
  const [activeView, setActiveView] = useState(searchParams.get('view'));

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
        <div className="mb-1 md:mb-6 px-2 md:px-4 mt-2 md:mt-3">
          <FilteredPresidentCards dateRange={dateRange} />
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-center my-3 md:my-4">
        <div className="flex items-center bg-gray-100 rounded-full p-1 gap-2">
          <button
            onClick={() => toggleView("structure")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:cursor-pointer w-32 ${activeView === "structure"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
          >
            Structure
          </button>
          <button
            onClick={() => toggleView("cabinet-flow")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:cursor-pointer w-32 ${activeView === "cabinet-flow"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
          >
            Cabinet Flow
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active view */}
      {activeView === "structure" ? (
        <>
          <GazetteTimeline />
          {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
        </>
      ) : (
        <LandscapeRequired onBack={() => toggleView("structure")}>
          <CabinetFlow key={selectedPresident?.id} presidentId={selectedPresident?.id}/>
        </LandscapeRequired>
      )}
    </div>
  );
};

export default Organization;