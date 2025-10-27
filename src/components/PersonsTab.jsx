import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Divider, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import utils from "../utils/utils";
import api from "../services/services";
import { useThemeContext } from "../themeContext";
import InfoTooltip from "../components/InfoToolTip";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const PersonsTab = ({ selectedDate }) => {
  const { colors } = useThemeContext();
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const { selectedPresident } = useSelector((state) => state.presidency);
  const [ministerListForMinistry, setministerListForMinistry] = useState([]);
  const [loading, setLoading] = useState(false);

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
                width: "40%",
                border: `2px solid ${colors.backgroundWhite}`,
                p: 2,
                backgroundColor: colors.backgroundWhite,
                borderRadius: "14px",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon sx={{ color: colors.textMuted }} />
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          color: colors.textMuted,
                        }}
                      >
                        Total People{" "}
                        <InfoTooltip
                          message="Total people under the minister on this date"
                          iconColor={colors.textPrimary}
                          iconSize={14}
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
                      {ministerListForMinistry.length}
                    </Typography>
                  </Box>
                )}

                {/* New People */}
                {ministerListForMinistry.filter((p) => p.isNew).length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonAddAlt1Icon sx={{ color: colors.textMuted }} />
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          color: colors.textMuted,
                        }}
                      >
                        New People{" "}
                        <InfoTooltip
                          message="New people assigned to this ministry on this date"
                          iconColor={colors.textPrimary}
                          iconSize={14}
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
                      {ministerListForMinistry.filter((p) => p.isNew).length}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

        <Typography
          variant="subtitle1"
          sx={{
            mt: 2,
            fontSize: "1.25rem",
            color: colors.textPrimary,
            fontWeight: 600,
            fontFamily: "poppins",
          }}
        >
          Ministers
        </Typography>
        <Divider sx={{ py: 1 }} />

        <Stack spacing={1} sx={{ mb: 2 }}>
          {ministerListForMinistry.map((person, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                padding: "12px 16px",
                marginBottom: "12px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                borderBottom: `3px solid ${colors.backgroundWhite}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PersonIcon
                  fontSize="small"
                  sx={{ color: selectedPresident?.themeColorLight }}
                />
                <Typography
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: colors.textMuted,
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                >
                  {utils.extractNameFromProtobuf(person.name)}
                </Typography>
                {/* President Badge */}
                {person.isPresident && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      px: 1,
                      py: 0.3,
                      borderRadius: "5px",
                      // backgroundColor: selectedPresident.themeColorLight,
                      // color: colors.white,
                      backgroundColor: colors.backgroundBlue,
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
                      ml: 1,
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
                state={{ mode: "back" }}
                style={{
                  textDecoration: "none",
                  color: selectedPresident.themeColorLight,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
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
          ))}
        </Stack>
        <Divider sx={{ py: 1 }} />
      </Box>
    </>
  );
};

export default PersonsTab;
