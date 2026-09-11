import {
  Box,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";

import ApartmentIcon from "@mui/icons-material/Apartment";
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import { useThemeContext } from "../../../context/themeContext";
import InfoTooltip from "../../../components/InfoToolTip";
import { useBodiesByDepartment } from "../../../hooks/useBodiesByDepartment";

const BodyTab = ({ departmentId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);

  const { data, isLoading, isError } = useBodiesByDepartment(departmentId);

  const bodyList = data?.bodyList || [];

  return (
    <Box sx={{ mt: -2 }}>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "20vh",
          }}
        >
          <ClipLoader
            color={selectedPresident.themeColorLight}
            loading={isLoading}
            size={25}
          />
        </Box>
      ) : (
        <>
          {/* Key Highlights */}
          {bodyList.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: { xs: "100%", sm: "100%", md: "50%", lg: "40%" },
                border: { xs: 0, sm: 0, md: `1px solid ${colors.backgroundWhite}` },
                p: { xs: 0, sm: 0, md: 2 },
                backgroundColor: colors.backgroundWhite,
                borderRadius: { xs: 0, sm: 0, md: "14px" },
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: { xs: "0.8rem", md: "1rem" },
                  fontWeight: 500,
                  color: colors.textPrimary,
                  mb: 2,
                }}
              >
                Key Highlights
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Total Bodies */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <ApartmentIcon
                    sx={{
                      color: colors.textMuted,
                      fontSize: { xs: "1rem", md: "1.2rem" },
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: { xs: "row", sm: "row" },
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: colors.textMuted,
                        fontSize: { xs: "0.8rem", md: "1rem" },
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      Total Bodies{" "}
                      <InfoTooltip
                        message="Total of bodies under this department"
                        iconColor={colors.textPrimary}
                        iconSize={13}
                        placement="right"
                      />
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontSize: { xs: "0.8rem", md: "1rem" },
                        fontWeight: 500,
                        color: colors.textPrimary,
                      }}
                    >
                      {bodyList.length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Body cards grid */}
          {bodyList.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: { xs: 1.5, sm: 2 },
                mt: 2,
              }}
            >
              {bodyList.map((body, index) => (
                <Box
                  key={body.id || index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    borderLeft: `4px solid ${selectedPresident.themeColorLight}`,
                    px: 2,
                    py: 1.5,
                    minHeight: "64px",
                    backgroundColor: colors.backgroundWhite,
                    boxShadow: "none",
                    transition: "box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 400,
                      fontSize: { xs: "0.75rem", md: "0.85rem" },
                      lineHeight: 1.4,
                      color: colors.textPrimary,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {body.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ width: "100%", mt: 4, display: "flex", justifyContent: "center" }}>
              <Alert
                severity={isError ? "error" : "info"}
                sx={{ backgroundColor: "transparent", width: "100%", maxWidth: 600 }}
              >
                <AlertTitle sx={{ fontFamily: "poppins", color: colors.textPrimary }}>
                  {isError ? "Error: Unable to load bodies." : "Info: No bodies found."}
                </AlertTitle>
              </Alert>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default BodyTab;