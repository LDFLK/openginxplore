import React, { useEffect, useState } from "react";
import DepartmentHistoryTimeline from "../../../components/DepartmentHistoryTimeline";
import { Box, Typography, ButtonBase } from "@mui/material";
import { useThemeContext } from "../../../themeContext";
import utils from "../../../utils/utils";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import InfoTooltip from "../../../components/InfoToolTip";
import { FaAngleLeft } from "react-icons/fa6";
import ShareLinkButton from "../../../components/ShareLinkButton";

export default function DepartmentProfile() {
  const { departmentId } = useParams();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const { allDepartmentData } = useSelector((state) => state.allDepartmentData);

  useEffect(() => {
    if (allDepartmentData && departmentId) {
      setSelectedDepartment(allDepartmentData[departmentId]);
    }
  }, [departmentId, allDepartmentData]);

  const { colors } = useThemeContext();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.backgroundPrimary,
        width: "100%",
        minHeight: { xs: "auto", sm: "100vh" },
        px: { xs: 6, sm: 14, md: 36 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            //position: 'sticky',
            top: 0,
            zIndex: 10,
            mb: 2,
            backgroundColor: colors.backgroundPrimary,
          }}
        >
          {state.mode === "back" ? (
            <ButtonBase
              onClick={() => navigate(-1)}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                mb: 2,
                width: 100,
                color: colors.textPrimary,
              }}
            >
              <FaAngleLeft />
              <Typography
                variant="h8"
                sx={{
                  fontFamily: "Poppins",
                  color: colors.textPrimary,
                  textTransform: "none",
                  ml: 1,
                }}
              >
                Back
              </Typography>
            </ButtonBase>
          ) : (
            <ButtonBase
              onClick={() => navigate('/')}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                mb: 2,
                width: 200,
                color: colors.textPrimary,
              }}
            >
              <FaAngleLeft />
              <Typography
                variant="h8"
                sx={{
                  fontFamily: "Poppins",
                  color: colors.textPrimary,
                  textTransform: "none",
                }}
              >
                Go to XploreGov
              </Typography>
            </ButtonBase>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: colors.textPrimary,
                fontFamily: "Poppins",
              }}
            >
              {selectedDepartment &&
                utils.extractNameFromProtobuf(selectedDepartment.name)}
            </Typography>

            <ShareLinkButton />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              gutterBottom
              sx={{
                mt: -2,
                color: colors.textPrimary,
                fontFamily: "poppins",
              }}
            >
              Department History Timeline{" "}
              <InfoTooltip
                message="Ministers the department was under throughout the history"
                iconColor={colors.textPrimary}
                iconSize={14}
              />
            </Typography>
          </Box>
        </Box>

        {/* Timeline */}
        <DepartmentHistoryTimeline selectedDepartment={selectedDepartment} />
      </Box>
    </Box>
  );
}
