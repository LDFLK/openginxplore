import { useState } from "react";
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
  const [hoveredBodyId, setHoveredBodyId] = useState(null);

  const { data, isLoading } = useBodiesByDepartment(departmentId);

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
                width: { xs: "100%", sm: "100%", md: "40%" },
                border: { xs: 0, sm: 0, md: `1px solid ${colors.backgroundWhite}` },
                p: { xs: 0, sm: 0, md: 2 },
                backgroundColor: colors.backgroundWhite,
                borderRadius: { xs: 0, sm: 0, md: "14px" }
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
                  <ApartmentIcon sx={{
                    color: colors.textMuted,
                    fontSize: { xs: "1rem", md: "1.2rem" },
                  }} />
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between"
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
                        gap: 0.5
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

          {bodyList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
              {bodyList.map((body) => (
                <div
                  key={body.id}
                  onMouseEnter={() => setHoveredBodyId(body.id)}
                  onMouseLeave={() => setHoveredBodyId(null)}
                  className={`flex flex-col rounded-lg overflow-hidden cursor-pointer transition-shadow border
                    ${hoveredBodyId === body.id ? "shadow-md" : "shadow-sm"}`}
                  style={{ borderColor: selectedPresident.themeColorLight + "99" }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{
                      backgroundColor:
                        hoveredBodyId === body.id
                          ? selectedPresident.themeColorLight
                          : selectedPresident.themeColorLight + "99",
                      minHeight: "70px",
                      maxHeight: "70px",
                    }}
                  >
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                      <span
                        className=" text-white  font-normal  text-xs md:text-sm leading-[1.4] font-poppins overflow-hidden text-ellipsis line-clamp-3">
                        {body.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Box sx={{ width: "100%", mt: 4, display: "flex", justifyContent: "center" }}>
              <Alert severity="info" sx={{ backgroundColor: "transparent", width: "100%", maxWidth: 600 }}>
                <AlertTitle sx={{ fontFamily: "poppins", color: colors.textPrimary }}>
                  Info: No bodies found.
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
