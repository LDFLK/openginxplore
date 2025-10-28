import PresidencyTimeline from "./PresidencyTimeline";
import MinistryCardGrid from "./MinistryCardGrid";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../themeContext";

const ModernView = () => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const { colors } = useThemeContext();
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
      <PresidencyTimeline />
      {selectedPresident && <>{selectedDate != null && <MinistryCardGrid />}</>}
    </div>
  );
};

export default ModernView;
