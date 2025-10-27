import { Card, Typography, Box, Stack } from "@mui/material";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useThemeContext } from "../themeContext";
import { useBadgeContext } from "./badgeContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MinistryCard = ({ card, onClick }) => {
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { colors } = useThemeContext();
  const { showMinistryBadge, showPersonBadge } = useBadgeContext();
  const [mouseHover, setMouseHover] = useState(false);
  const navigate = useNavigate();

  const handleOpenProfile = (id) => {
    navigate(`/person-profile/${id}`, {
      state: { mode: "back" },
    })
  }

  return (
    <Card
      sx={{
        cursor: "pointer",
        boxShadow: "none",
        // border: `2px solid ${colors.backgroundSecondary}50`,
        border: `2px solid ${selectedPresident.themeColorLight}99`,
        transition: "box-shadow 0.2s",
        "&:hover": {
          // border: `2px solid ${colors.ministryCardBorderHover}`,
          border: `2px solid ${selectedPresident.themeColorLight}`,
        },

        backgroundColor: colors.backgroundBlue,
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
            py: 0.5,
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
              justifyContent: "center", // vertically centers content
              height: `calc(1.4em * 4)`, // fixed 4-line height
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h7"
              sx={{
                color: "#ffffff",
                fontWeight: 400,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.4,
                fontSize: "14px"
              }}
            >
              {card.name.split(":")[0]}
            </Typography>
          </Box>

          {card.newMin && showMinistryBadge && (
            <Box
              sx={{
                backgroundColor: selectedPresident.themeColorLight,
                color: "#fff",
                fontSize: "0.7rem",
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
            minHeight: 80,
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
            {!card.headMinisterName ||
              (selectedPresident &&
                utils.extractNameFromProtobuf(card.headMinisterName) ===
                utils.extractNameFromProtobuf(selectedPresident.name).split(":")[0]) ? (
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.white,
                    fontFamily: "poppins",
                    py: "2px",
                    px: "6px",
                    fontSize: "10px",
                    backgroundColor: `${selectedPresident.themeColorLight}`,
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
                  handleOpenProfile(card.headMinisterId || selectedPresident?.id)
                }
                sx={{
                  fontWeight: 400,
                  fontSize: "13px",
                  color: colors.textPrimary,
                  fontFamily: "poppins",
                  textDecorationThickness: "1px",
                  textUnderlineOffset: "3px",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                    opacity: 0.9,
                  },
                }}
              >
                {card.headMinisterName
                  ? utils.extractNameFromProtobuf(card.headMinisterName)
                  : selectedPresident &&
                  utils.extractNameFromProtobuf(selectedPresident.name).split(":")[0]}
              </Typography>

              {card.newPerson && showPersonBadge && (
                <Box
                  sx={{
                    border: `1px solid ${selectedPresident.themeColorLight}`,
                    color: `${selectedPresident.themeColorLight}`,
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
