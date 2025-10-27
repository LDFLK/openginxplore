import { Box } from "@mui/material";
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
    <Box
      sx={{
        paddingTop: "2vw",
        // width: "100vw",
        minHeight: "100vh",
        backgroundColor: colors.backgroundPrimary,
        overflowX: "hidden",
      }}
    >
      (
      <Box sx={{ display: "flex", mt: 5, justifyContent: "center" }}>
        <PresidencyTimeline />
      </Box>
      )
      {selectedPresident && (
        <>
          <Box
          >
            {/* Card Grid for Modern View */}
            {selectedDate != null && <MinistryCardGrid />}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ModernView;
