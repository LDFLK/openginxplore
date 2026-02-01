import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Divider, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import utils from "../../../utils/utils";
import api from "../../../services/services";
import { useThemeContext } from "../../../context/themeContext";
import InfoTooltip from "../../../components/InfoToolTip";
import { Link, useLocation } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const PersonsTab = ({ selectedDate }) => {
  const { colors } = useThemeContext();
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const { selectedPresident } = useSelector((state) => state.presidency);
  const [ministerListForMinistry, setministerListForMinistry] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedMinistry = params.get("ministry");

    if (!selectedMinistry) return;

    const fetchPersons = async () => {
      try {
        setLoading(true);

        const resPersonsResponse = await api.fetchActiveRelationsForMinistry(
          selectedDate,
          selectedMinistry,
          "AS_APPOINTED"
        );
        const resPersons = await resPersonsResponse.json();

        const personMap = new Map();
        resPersons.forEach(
          (r) =>
            r.relatedEntityId && personMap.set(r.relatedEntityId, r.startTime)
        );

        // Map over person IDs, convert names from protobuf, fallback to president if null
        let personList = Array.from(personMap.keys())
          .map((id) => {
            const personFromDict = allPersonDict[id];
            let name;

            if (personFromDict && personFromDict.name) {
              name = personFromDict.name;
            }
            const isPresident =
              utils.extractNameFromProtobuf(name) ===
              utils.extractNameFromProtobuf(selectedPresident.name);
            return {
              id,
              name,
              startTime: personMap.get(id),
              isNew: personMap.get(id)?.startsWith(selectedDate) || false,
              isPresident,
            };
          })
          .filter(Boolean);

        if (personList.length === 0) {
          personList.push({
            id: selectedPresident.id,
            name: selectedPresident.name,
            startTime: selectedDate,
            isNew: true,
            isPresident: true,
          });
        }

        setministerListForMinistry(personList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching persons:", err);
        setLoading(false);
      }
    };

    fetchPersons();
  }, [selectedDate, allPersonDict, selectedPresident]);

  if (loading) {
    return (
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
    );
  }

  return (
    <>
      <Box>
        {/* Key Highlights */}
        {(ministerListForMinistry.length > 0 ||
          ministerListForMinistry.filter((p) => p.isNew).length > 0) && (
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
                {/* Total People */}
                {ministerListForMinistry.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <PersonIcon sx={{
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
                        Total People{" "}
                        <InfoTooltip
                          message="Total people under the minister on this date"
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
                        {ministerListForMinistry.length}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* New People */}
                {ministerListForMinistry.filter((p) => p.isNew).length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <PersonAddAlt1Icon sx={{
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
                        New People{" "}
                        <InfoTooltip
                          message="New people assigned to this ministry on this date"
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
                        {ministerListForMinistry.filter((p) => p.isNew).length}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

        <Typography
          variant="subtitle1"
          sx={{
            mt: 2,
            mb: { xs: 2, sm: 2, md: 0 },
            fontSize: { xs: "0.8rem", md: "1rem" },
            color: colors.textPrimary,
            fontWeight: 500,
            fontFamily: "poppins",
          }}
        >
          Minister
        </Typography>
        {/* <Divider sx={{ py: 1 }} /> */}

        <Stack spacing={1} sx={{ mb: 2 }}>
          {ministerListForMinistry.map((person, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                flexDirection: "column",
                p: { xs: 0, sm: 0, md: "12px 16px" },
                gap: { xs: 1.5, sm: 1.5, md: 0 },
                marginBottom: "12px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                borderBottom: `1px solid ${colors.backgroundWhite}`,
              }}
            >
              {/* Sma;ll screens (xs/sm): icon column + content column */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "flex", md: "none" },
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                {/* Icon column */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: { xs: "36px", sm: "36px" },
                    mt: { xs: 2, sm: 2 },
                    flexShrink: 0,
                  }}
                >
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: selectedPresident?.themeColorLight }}
                  />
                </Box>

                {/* Content column */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: { xs: 0.5, sm: 0.5 },
                    width: "100%",
                  }}
                >
                  {/* Name + badges */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: colors.textMuted,
                        fontWeight: 500,
                        fontSize: { xs: "0.8rem", md: "1rem" },
                      }}
                    >
                      {utils.extractNameFromProtobuf(person.name)}
                    </Typography>
                    {person.isPresident && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: "5px",
                          color: selectedPresident.themeColorLight,
                          border: `1px solid ${selectedPresident.themeColorLight}`,
                          fontFamily: "poppins",
                          fontWeight: 600,
                        }}
                      >
                        President
                      </Typography>
                    )}
                    {person.isNew && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.2,
                          borderRadius: "6px",
                          backgroundColor: selectedPresident.themeColorLight,
                          color: colors.white,
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 600,
                          letterSpacing: "0.3px",
                        }}
                      >
                        New
                      </Typography>
                    )}
                  </Box>

                  {/* View profile link */}
                  <Link
                    to={`/person-profile/${person.id}`}
                    state={{ mode: "back", from: location.pathname + location.search }}
                    style={{
                      textDecoration: "none",
                      color: selectedPresident.themeColorLight,
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 500,
                      fontSize: { xs: "0.5rem", md: "0.8rem" },
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = "none";
                    }}
                  >
                    View Profile
                  </Link>
                </Box>
              </Box>

              {/* Large screens (md+): original layout */}
              <Box
                sx={{
                  display: { xs: "none", sm: "none", md: "flex" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  width: "100%",
                  mt: 0,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
                >
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: selectedPresident?.themeColorLight }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      color: colors.textMuted,
                      fontWeight: 500,
                      fontSize: { xs: "0.8rem", md: "1rem" },
                    }}
                  >
                    {utils.extractNameFromProtobuf(person.name)}
                  </Typography>
                  {person.isPresident && (
                    <Typography
                      variant="subtitle2"
                      sx={{
                        px: 1,
                        py: 0.3,
                        borderRadius: "5px",
                        color: selectedPresident.themeColorLight,
                        border: `1px solid ${selectedPresident.themeColorLight}`,
                        fontFamily: "poppins",
                        fontWeight: 600,
                      }}
                    >
                      President
                    </Typography>
                  )}
                  {person.isNew && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: "6px",
                        backgroundColor: selectedPresident.themeColorLight,
                        color: colors.white,
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.3px",
                      }}
                    >
                      New
                    </Typography>
                  )}
                </Box>

                <Link
                  to={`/person-profile/${person.id}`}
                  state={{ mode: "back", from: location.pathname + location.search }}
                  style={{
                    textDecoration: "none",
                    color: selectedPresident.themeColorLight,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "0.5rem", md: "0.8rem" },
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = "none";
                  }}
                >
                  View Profile
                </Link>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default PersonsTab;
