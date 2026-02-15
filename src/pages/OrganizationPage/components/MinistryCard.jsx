import { Card, Typography, Box, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { useThemeContext } from "../../../context/themeContext";
import { useBadgeContext } from "../../../context/badgeContext";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MinistryCard = ({ card, onClick }) => {
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { colors } = useThemeContext();
  const { showMinistryBadge, showPersonBadge } = useBadgeContext();
  const [mouseHover, setMouseHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenProfile = (id) => {
    if (!id) return;
    navigate(`/person-profile/${id}`, {
      state: { mode: "back", from: location.pathname + location.search }
    })
  }

  return (
    <Card
      sx={{
        cursor: "pointer",
        boxShadow: "none",
        border: `1px solid ${selectedPresident.themeColorLight}99`,
        transition: "box-shadow 0.2s",
        backgroundColor: colors.backgroundWhite,
        borderRadius: "10px",
        position: "relative",
        width: "100%",
      }}
      onMouseOver={() => setMouseHover(card)}
      onMouseOut={() => setMouseHover(null)}
      onClick={() => onClick(card)}
    >
      <Stack>
        {/* Ministry Title */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          minHeight={50}
          sx={{
            px: 1.5,
            // py: 0.5,
            backgroundColor:
              mouseHover && mouseHover.id == card.id
                ? `${selectedPresident.themeColorLight}`
                : `${selectedPresident.themeColorLight}99`,
            "&:hover": {
              backgroundColor: selectedPresident.themeColorLight,
            },
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start", // aligns content to top
              height: `calc(1.4em * 3)`, // fixed 4-line height
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h7"
              sx={{
                backgroundColor: `${selectedPresident.themeColorLight}85`,
                color: "#fff",
                fontSize: { xs: "0.6rem", md: "0.675rem" },
                fontWeight: 500,
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                px: 1,
                py: "2px",
                mb: "2px",
                fontFamily: "poppins",
                display: "inline-block",
              }}
            >
              {{ cabinetMinister: "Cabinet Minister", stateMinister: "State Minister" }[card.type]}
            </Typography>
            <Typography
              variant="h7"
              sx={{
                color: "#ffffff",
                fontWeight: 400,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.4,
                fontSize: { xs: "12px", md: "14px" }
              }}
            >
              {card.name}
            </Typography>
          </Box>

          {card.isNew && showMinistryBadge && (
            <Box
              sx={{
                backgroundColor: colors.green,
                color: "#fff",
                fontSize: { xs: "0.4rem", md: "0.7rem" },
                fontWeight: "semibold",
                borderRadius: "5px",
                px: 1,
                py: "2px",
                fontFamily: "poppins",
                ml: 1,
              }}
            >
              NEW
            </Box>
          )}
        </Stack>


        {/* Card Container */}
        <Stack
          spacing={0.5}
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between", // push name to bottom
          }}
        >
          <Stack direction="row">
            {/* this is for spacing for longer names*/}
          </Stack>

          {/* Name & Badge Section */}
          <Stack direction="column" spacing={0}>
            {/* President Label */}
            {card.ministers?.[0]?.isPresident ? (
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.white,
                    fontFamily: "poppins",
                    py: "2px",
                    px: "6px",
                    fontSize: { xs: "0.6rem", md: "10px" },
                    backgroundColor: selectedPresident?.themeColorLight,
                    borderRadius: "3px",
                    mb: "2px",
                  }}
                >
                  President
                </Typography>
              </Box>
            ) : null}

            {/* Name + NEW badge */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="subtitle2"
                onClick={() =>
                  handleOpenProfile(card.ministers?.[0]?.id)
                }
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "0.7rem", md: "13px" },
                  color: colors.textPrimary,
                  fontFamily: "poppins",
                  textDecorationThickness: "1px",
                  textUnderlineOffset: "3px",
                  cursor: card.ministers?.[0]?.id ? "pointer" : "default",
                  "&:hover": card.ministers?.[0]?.id ? {
                    textDecoration: "underline",
                    opacity: 0.9,
                  } : {},
                }}
              >
                {card.ministers?.[0]?.name}
              </Typography>

              {card.ministers?.[0]?.isNew && showPersonBadge && (
                <Box
                  sx={{
                    border: `1px solid ${colors.green}`,
                    color: colors.green,
                    fontSize: "0.65rem",
                    fontWeight: "semibold",
                    borderRadius: "4px",
                    px: 1,
                    py: "1px",
                    fontFamily: "poppins",
                  }}
                >
                  NEW
                </Box>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default MinistryCard;
