import React, { useEffect, useState } from "react";
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
import utils from "../utils/utils";
import api from "../services/services";
import { useThemeContext } from "../themeContext";
import InfoTooltip from "./InfoToolTip";

const DepartmentTab = ({ selectedDate, ministryId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);
  // const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const allDepartmentList = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );

  const [departmentListForMinistry, setDepartmentListForMinistry] = useState(
    []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [hoveredDeptId, setHoveredDeptId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedMinistry = params.get("ministry");

    if (selectedMinistry) {
      fetchDepartmentList(ministryId || selectedMinistry);
    }
  }, [ministryId, selectedDate, location.search]);

  const fetchDepartmentList = async (ministryId) => {
    if (!ministryId) return;
    try {
      setLoading(true);

      const responseDepartments = await api.fetchActiveRelationsForMinistry(
        selectedDate,
        ministryId,
        "AS_DEPARTMENT"
      );

      const resDepartments = await responseDepartments.json();

      // --- Departments ---
      const depMap = new Map();
      resDepartments.forEach(
        (r) => r.relatedEntityId && depMap.set(r.relatedEntityId, r.startTime)
      );
      const depList = Array.from(depMap.keys())
        .map((id) => {
          const dep = allDepartmentList[id];
          if (!dep) return null;
          return {
            ...dep,
            startTime: depMap.get(id),
            isNew: depMap.get(id)?.startsWith(selectedDate) || false,
          };
        })
        .filter(Boolean);
      setDepartmentListForMinistry(depList);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching ministry data:", err);
      setLoading(false);
    }
  };

  const filteredDepartments =
    departmentListForMinistry?.filter((dep) =>
      utils
        .extractNameFromProtobuf(dep.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) || [];
  return (
    <Box sx={{ mt: -2 }}>
      {loading ? (
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
            loading={loading}
            size={25}
          />
        </Box>
      ) : (
        <>
          {/* Key Highlights */}
          {(departmentListForMinistry.length > 0 ||
            departmentListForMinistry.filter((dep) => dep.isNew).length > 0) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "40%",
                  border: `1px solid ${colors.backgroundWhite}`,
                  p: 2,
                  backgroundColor: colors.backgroundWhite,
                  borderRadius: "14px",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "1.2rem",
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
                  {departmentListForMinistry.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ApartmentIcon sx={{ color: colors.textMuted }} />
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            color: colors.textMuted,
                          }}
                        >
                          Total Departments{" "}
                          <InfoTooltip
                            message="Total of departments under the minister on this date"
                            iconColor={colors.textPrimary}
                            iconSize={14}
                            placement="right"
                          />
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontSize: 20,
                          fontWeight: 500,
                          color: colors.textPrimary,
                        }}
                      >
                        {departmentListForMinistry.length}
                      </Typography>
                    </Box>
                  )}

                  {/* New Departments */}
                  {departmentListForMinistry.filter((dep) => dep.isNew).length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <DomainAddIcon sx={{ color: colors.textMuted }} />
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            color: colors.textMuted,
                          }}
                        >
                          New Departments{" "}
                          <InfoTooltip
                            message="Total of newly added departments to this minister on this date"
                            iconColor={colors.textPrimary}
                            iconSize={14}
                            placement="right"
                          />
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontSize: 20,
                          fontWeight: 500,
                          color: colors.textPrimary,
                        }}
                      >
                        {departmentListForMinistry.filter((dep) => dep.isNew).length}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}


          {/* Departments Header + Search */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
              }}
            >
              Departments
            </Typography>
            <Box sx={{ width: 250 }}>
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

          {/* Department List */}

          {filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {filteredDepartments.map((dep) => {
                const depName = utils.extractNameFromProtobuf(dep.name);

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
                          className=" text-white  font-normal  text-[14px] leading-[1.4] font-poppins overflow-hidden text-ellipsis line-clamp-3">
                          {depName}
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
                        className="text-sm font-small hover:underline"
                        style={{ color: selectedPresident.themeColorLight }}
                      >
                        History
                      </Link>

                      <Link
                        to={`/data?parentId=${dep.id}`}
                        className="text-sm font-small hover:underline"
                        style={{ color: selectedPresident.themeColorLight }}
                      >
                        Data
                      </Link>
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
