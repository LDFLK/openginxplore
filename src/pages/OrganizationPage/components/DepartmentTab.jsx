import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import ApartmentIcon from "@mui/icons-material/Apartment";
import SearchIcon from "@mui/icons-material/Search";
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import { useThemeContext } from "../../../context/themeContext";
import InfoTooltip from "../../../components/InfoToolTip";
import { useDepartmentsByPortfolio } from "../../../hooks/useDepartmentsByPortfolio";


const DepartmentTab = ({ selectedDate, ministryId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [hoveredDeptId, setHoveredDeptId] = useState(null);


  const { data, isLoading } = useDepartmentsByPortfolio(
    ministryId,
    selectedDate
  );

  const departmentListForMinistry = data?.departmentList || [];
  const totalDepartments = data?.totalDepartments || 0;
  const newDepartments = data?.newDepartments || 0;

  const filteredDepartments =
    departmentListForMinistry.filter((dep) =>
      dep.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          {totalDepartments > 0 && (

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
                {/* Total Departments */}
                {totalDepartments > 0 && (
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
                        Total Departments{" "}
                        <InfoTooltip
                          message="Total of departments under the minister on this date"
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
                        {totalDepartments}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* New Departments */}
                {newDepartments > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <DomainAddIcon sx={{
                      color: colors.textMuted,
                      fontSize: { xs: "0.8rem", md: "1rem" },
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
                        New Departments{" "}
                        <InfoTooltip
                          message="Total of newly added departments to this minister on this date"
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
                        {newDepartments}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          {/* Departments Header + Search */}
          {totalDepartments > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "flex-start", md: "center" },
                flexDirection: { xs: "column", sm: "column", md: "row" },
                mt: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: "1rem",
                  color: colors.textPrimary,
                  fontFamily: "poppins",
                  fontWeight: 500,
                  mb: { xs: "6px", sm: "6px", md: 0 }
                }}
              >
                Departments
              </Typography>

              <Box>
                <TextField
                  size="small"
                  label="Search departments"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon
                          fontSize="small"
                          sx={{ color: colors.textMuted }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    backgroundColor: colors.backgroundColor,
                    "& .MuiInputLabel-root": { color: colors.textMuted },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: colors.textMuted },
                      "&:hover fieldset": { borderColor: colors.textMuted },
                      "&.Mui-focused fieldset": { borderColor: colors.textMuted },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: `0 0 0 1000px ${colors.backgroundColor} inset`,
                        WebkitTextFillColor: colors.textMuted,
                        transition: "background-color 5000s ease-in-out 0s",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.textMuted },
                    "& .MuiInputBase-input": { color: colors.textMuted },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Department List */}

          {filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
              {filteredDepartments.map((dep) => {
                return (
                  <div
                    key={dep.id}
                    onMouseEnter={() => setHoveredDeptId(dep.id)}
                    onMouseLeave={() => setHoveredDeptId(null)}
                    className={`flex flex-col rounded-lg  cursor-pointer transition-shadow border 
                      ${hoveredDeptId === dep.id ? "shadow-md" : "shadow-sm"}`}
                    style={{ borderColor: selectedPresident.themeColorLight + "99" }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-t-[7px]"
                      style={{
                        backgroundColor:
                          hoveredDeptId === dep.id
                            ? selectedPresident.themeColorLight
                            : selectedPresident.themeColorLight + "99",
                        minHeight: "70px",
                        maxHeight: "70px",
                      }}
                    >
                      <div className="flex flex-col justify-center flex-1 overflow-hidden">
                        <span
                          className=" text-white  font-normal  text-xs md:text-sm leading-[1.4] font-poppins overflow-hidden text-ellipsis line-clamp-3">
                          {dep.name}
                        </span>
                      </div>

                      {dep.isNew && (
                        <div
                          className="ml-2 px-2 py-[2px] text-xs font-semibold rounded"
                          style={{
                            backgroundColor: colors.green,
                            color: "#fff",
                          }}
                        >
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Footer Links */}
                    <div className="flex items-center justify-between px-4 py-2 mt-auto">
                      <Link
                        to={`/department-profile/${dep.id}`}
                        state={{ mode: "back", from: location.pathname + location.search }}
                        className="text-xs md:text-sm font-small hover:underline"
                        style={{ color: selectedPresident.themeColorLight }}
                      >
                        History
                      </Link>

                      {dep.hasData && (() => {
                        const pathParams = new URLSearchParams();
                        pathParams.set("categoryIds", JSON.stringify([dep.id]));

                        const outerParams = new URLSearchParams();
                        outerParams.set("categoryIds", JSON.stringify([dep.id]));
                        outerParams.set("breadcrumb", JSON.stringify([
                          {
                            label: dep.name,
                            path: `/data?${pathParams.toString()}`,
                          },
                        ]));

                        return (
                          <Link
                            to={`/data?${outerParams.toString()}`}
                            className="text-xs md:text-sm font-normal hover:underline"
                            style={{ color: selectedPresident.themeColorLight }}
                          >
                            Data
                          </Link>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )
            : (
              <Box sx={{ width: "100%", mt: 4, display: "flex", justifyContent: "center" }}>
                <Alert severity="info" sx={{ backgroundColor: "transparent", width: "100%", maxWidth: 600 }}>
                  <AlertTitle sx={{ fontFamily: "poppins", color: colors.textPrimary }}>
                    Info: No departments found.
                  </AlertTitle>
                </Alert>
              </Box>
            )}

        </>
      )}
    </Box>
  );
};

export default DepartmentTab;
