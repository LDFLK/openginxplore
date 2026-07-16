import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
} from "@mui/material";

import ApartmentIcon from "@mui/icons-material/Apartment";
import SearchIcon from "@mui/icons-material/Search";
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import { useThemeContext } from "../../../context/themeContext";
import { useBodiesByDepartment } from "../../../hooks/useBodiesByDepartment";

const BodyTab = ({ departmentId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBodyId, setHoveredBodyId] = useState(null);

  const { data, isLoading } = useBodiesByDepartment(departmentId);

  const bodyList = data?.bodyList || [];

  const filteredBodies = bodyList.filter((body) =>
    body.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          {bodyList.length > 0 && (
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
                  mb: { xs: "6px", sm: "6px", md: 0 },
                }}
              >
                Bodies
              </Typography>

              <Box>
                <TextField
                  size="small"
                  label="Search"
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
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.textMuted },
                    "& .MuiInputBase-input": { color: colors.textMuted },
                  }}
                />
              </Box>
            </Box>
          )}

          {filteredBodies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
              {filteredBodies.map((body) => (
                <div
                  key={body.id}
                  onMouseEnter={() => setHoveredBodyId(body.id)}
                  onMouseLeave={() => setHoveredBodyId(null)}
                  className={`flex flex-col rounded-lg border transition-shadow
                    ${hoveredBodyId === body.id ? "shadow-md" : "shadow-sm"}`}
                  style={{ borderColor: selectedPresident.themeColorLight + "99" }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-[7px]"
                    style={{
                      backgroundColor:
                        hoveredBodyId === body.id
                          ? selectedPresident.themeColorLight
                          : selectedPresident.themeColorLight + "99",
                      minHeight: "70px",
                      maxHeight: "70px",
                    }}
                  >
                    <ApartmentIcon sx={{ color: "#fff", fontSize: 18, flexShrink: 0 }} />
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                      <span className="text-white font-normal text-xs md:text-sm leading-[1.4] font-poppins overflow-hidden text-ellipsis line-clamp-3">
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
