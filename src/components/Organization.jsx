import PresidencyTimeline from "./PresidencyTimeline";
import MinistryCardGrid from "./MinistryCardGrid";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../themeContext";
import FilteredPresidentCards from "./FilteredPresidentCards";

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
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [president, navigate, location.pathname]);

  return (
    <div>
      {/* FilteredPresidentCards Component */}
      {dateRange[0] && dateRange[1] && (
        <div className="mb-6 px-4 md:px-8 lg:px-12 mt-6">
          <FilteredPresidentCards dateRange={dateRange} />
        </div>
      )}
      <PresidencyTimeline />
      {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
    </div>
  );
};

export default Organization;