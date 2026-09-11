import { useSelector } from "react-redux";
import { Box, Typography, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useThemeContext } from "../../../context/themeContext";
import InfoTooltip from "../../../components/InfoToolTip";
import { Link, useLocation } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { usePersonsByPortfolio } from "../../../hooks/usePersonsByPortfolio";

const PersonsTab = ({ selectedDate, ministryId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);
  const location = useLocation();

  const selectedMinistry = ministryId || new URLSearchParams(location.search).get("ministry");

  const { data, isLoading: loading, isError, error, refetch } = usePersonsByPortfolio(
    selectedMinistry,
    selectedDate
  );

  const totalCount = data?.totalCount ?? 0;
  const newCount = data?.newCount ?? 0;
  const personList = data?.personList ?? [];

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

  if (isError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          height: "20vh",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontSize: { xs: "0.8rem", md: "1rem" },
            color: colors.textMuted,
          }}
        >
          {error?.message || "Failed to load people for this ministry."}
        </Typography>
        <Typography
          onClick={() => refetch()}
          sx={{
            cursor: "pointer",
            color: selectedPresident.themeColorLight,
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "0.75rem", md: "0.9rem" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Retry
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        {/* Key Highlights */}
        {(totalCount > 0 || newCount > 0) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: { xs: "100%", sm: "100%", md: "40%" },
              border: { xs: 0, sm: 0, md: `1px solid ${colors.backgroundWhite}` },
              p: { xs: 0, sm: 0, md: 2 },
              backgroundColor: colors.backgroundWhite,
              borderRadius: { xs: 0, sm: 0, md: "14px" },
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

            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Total People */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                <PersonIcon sx={{ color: colors.textMuted, fontSize: { xs: "0.8rem", md: "1rem" } }} />
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
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
                    {totalCount}
                  </Typography>
                </Box>
              </Box>

              {/* New People */}
              {newCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <PersonAddAlt1Icon sx={{ color: colors.textMuted, fontSize: { xs: "0.8rem", md: "1rem" } }} />
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
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
                      {newCount}
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

        <Stack spacing={1} sx={{ mb: 2 }}>
          {personList.length > 0 ? (
            personList.map((person) => (
              <Box
                key={person.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: { xs: 0, sm: 0, md: "12px 16px" },
                  gap: 2,
                  marginBottom: "12px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  borderBottom: `1px solid ${colors.backgroundWhite}`,
                }}
              >
                <PersonIcon
                  fontSize="small"
                  sx={{
                    color: selectedPresident?.themeColorLight,
                    flexShrink: 0,
                    mt: { xs: 0.5, sm: 0 },
                  }}
                />

                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: { xs: 0.5, sm: 2 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: colors.textMuted,
                        fontWeight: 500,
                        fontSize: { xs: "0.8rem", md: "1rem" },
                      }}
                    >
                      {person.name}
                    </Typography>
                    {person.isPresident && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "4px",
                          color: selectedPresident.themeColorLight,
                          border: `1px solid ${selectedPresident.themeColorLight}`,
                          fontFamily: "poppins",
                          fontWeight: 600,
                          fontSize: { xs: "0.55rem", md: "0.75rem" },
                        }}
                      >
                        President
                      </Typography>
                    )}
                    {person.isNew && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "4px",
                          backgroundColor: selectedPresident.themeColorLight,
                          color: colors.white,
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 600,
                          letterSpacing: "0.3px",
                          fontSize: { xs: "0.55rem", md: "0.7rem" },
                        }}
                      >
                        New
                      </Typography>
                    )}
                  </Box>

                  <Link
                    to={`/person-profile/${person.id}`}
                    state={{ mode: "back", from: location.pathname + location.search }}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      sx={{
                        color: selectedPresident.themeColorLight,
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                        fontSize: { xs: "0.65rem", md: "0.8rem" },
                        transition: "all 0.3s ease",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      View Profile
                    </Typography>
                  </Link>
                </Box>
              </Box>
            ))
          ) : (
            <Typography
              sx={{
                py: 2,
                textAlign: "center",
                color: colors.textMuted,
                fontFamily: "Poppins",
                fontSize: { xs: "0.8rem", md: "0.9rem" },
              }}
            >
              No results found
            </Typography>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default PersonsTab;