import GazetteTimeline from "../components/GazetteTimeline";
import MinistryCardGrid from "../components/MinistryCardGrid";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../../../context/themeContext";
import FilteredPresidentCards from "../components/FilteredPresidentCards";

const Organization = ({ dateRange }) => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const location = useLocation();
  const navigate = useNavigate();
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
      <GazetteTimeline />
      {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
    </div>
  );
};

export default Organization;