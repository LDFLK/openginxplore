import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedDate } from "../store/presidencySlice";
import utils from "../utils/utils";
import StyledBadge from "../components/materialCustomAvatar";
import { useThemeContext } from "../themeContext";
import YearRangeSelector from "../components/Timeline";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Files } from "lucide-react";

export default function PresidencyTimeline() {
  const dispatch = useDispatch();

  //redux state
  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const selectedDate = useSelector((state) => state.presidency.selectedDate);

  const { gazetteData } = useSelector((state) => state.gazettes);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  //ref
  const scrollRef = useRef(null);
  const avatarRef = useRef(null);
  const dotRef = useRef(null);

  //states
  const [lineStyle, setLineStyle] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [latestPresidentId, setLatestPresidentId] = useState(null);

  const { colors } = useThemeContext();

  const updateScrollButtons = () => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    setCanScrollLeft(scrollEl.scrollLeft > 0);
    setCanScrollRight(
      scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1
    );
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el?.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 100;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const drawLine = () => {
    if (!avatarRef.current || !dotRef.current || !scrollRef.current) {
      setLineStyle(null);
      return;
    }

    const avatarBox = avatarRef.current.getBoundingClientRect();
    const dotBox = dotRef.current.getBoundingClientRect();
    const containerBox =
      scrollRef.current.parentElement.getBoundingClientRect();

    const startX = avatarBox.left + avatarBox.width;
    const endX = dotBox.left + dotBox.width / 2;
    const containerHeight = containerBox.height;
    const top = containerHeight / 2 - 30;

    setLineStyle({
      left: startX - containerBox.left,
      width: endX - startX,
      top,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", drawLine);
    const scrollContainer = scrollRef.current;
    scrollContainer?.addEventListener("scroll", drawLine);

    return () => {
      window.removeEventListener("resize", drawLine);
      scrollContainer?.removeEventListener("scroll", drawLine);
    };
  }, []);

  // Auto-scroll selected dot into view
  useEffect(() => {
    setTimeout(() => {
      drawLine();
    }, 200);
    if (selectedDate && dotRef.current && scrollRef.current) {
      setTimeout(() => {
        const container = scrollRef.current;
        const dot = dotRef.current;

        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();

        const dotCenter = dotRect.left + dotRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const scrollOffset = dotCenter - containerCenter;

        container.scrollBy({
          left: scrollOffset,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [selectedDate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        width: "100%",
      }}
    >
      <Typography
        sx={{
          mt: "20px",
          color: colors.textPrimary,
        }}
      >
        Select gazette published date
      </Typography>
      {selectedPresident && (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            maxWidth: { xs: "100vw", sm: "90vw", md: "80vw", lg: "85vw" },
            overflow: "hidden",
            width: "100%",
            height: "120px",
          }}
        >
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              zIndex: 10,
              mt: -6.8,
              backgroundColor: colors.backgroundPrimary,
              visibility: canScrollLeft ? "visible" : "hidden",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: colors.backgroundPrimary,
              },
              color: colors.timelineColor,
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              top: "calc(50% - 28px)",
              width: "92%",
              left: 50,
              right: 50,
              height: "2px",
              backgroundColor: colors.timelineColor,
              zIndex: 0,
            }}
          />

          {lineStyle && selectedDate && (
            <Box
              sx={{
                position: "absolute",
                height: "5px",
                backgroundColor:
                  selectedPresident?.themeColorLight || colors.timelineColor,
                top: `${lineStyle.top}px`,
                left: `${lineStyle.left}px`,
                width: `${lineStyle.width}px`,
                zIndex: 5,
                transition: "left 0.3s ease, width 0.3s ease",
              }}
            />
          )}

          {selectedPresident && (
            <Box
              sx={{
                position: "absolute",
                zIndex: 9,
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
                transition: "all 0.3s ease",
                pointerEvents: "none",
              }}
            >
              {selectedPresident.id === latestPresidentId ? (
                <Box
                  sx={{
                    textAlign: "center",
                    minWidth: { xs: 60, sm: 80 },
                    background: `linear-gradient(to right, ${colors.backgroundPrimary} 65%, rgba(0,0,0,0) 50%)`,
                  }}
                >
                  <StyledBadge
                    ref={avatarRef}
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                    sx={{
                      border: `4px solid ${
                        selectedPresident?.themeColorLight ||
                        colors.timelineColor
                      }`,
                      backgroundColor: colors.backgroundPrimary,
                      margin: "auto",
                      borderRadius: 50,
                    }}
                  >
                    <Avatar
                      alt={selectedPresident.name}
                      src={selectedPresident.imageUrl}
                      sx={{
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        border: `3px solid ${colors.backgroundPrimary}`,
                        backgroundColor: colors.backgroundPrimary,
                        margin: "auto",
                      }}
                    />
                  </StyledBadge>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: colors.textPrimary,
                      fontFamily: "poppins",
                      fontWeight: 600,
                    }}
                  >
                    {utils.extractNameFromProtobuf(selectedPresident.name)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: colors.textMuted, fontFamily: "poppins" }}
                  >
                    {selectedPresident.created.split("-")[0]} -{" "}
                    {selectedPresident.endTime
                      ? new Date(selectedPresident.endTime).getFullYear()
                      : "Present"}
                  </Typography>
                </Box>
              ) : (
                // <Box
                //   sx={{
                //     textAlign: "center",
                //     minWidth: { xs: 60, sm: 80 },
                //     background: `linear-gradient(to right, ${colors.backgroundPrimary} 65%, rgba(0,0,0,0) 50%)`,
                //   }}
                // >
                  
                    <Box
                      ref={avatarRef}
                      // alt={selectedPresident.name}
                      // src={selectedPresident.imageUrl}
                      sx={{
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        border: `3px solid ${colors.backgroundPrimary}`,
                        backgroundColor: colors.backgroundPrimary,
                        margin: "auto",
                      }}
                    ><Files /></Box>
                  // </Box>

              )}
            </Box>
          )}

          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              padding: { xs: 2, sm: 4 },
              paddingLeft: { xs: 22, sm: 28 },
              paddingRight: { xs: 8, sm: 14 },
              paddingTop: { xs: 7, sm: 4 },
              flexWrap: "nowrap",
              scrollBehavior: "smooth",
              flexGrow: 1,
              position: "relative",
              zIndex: 5,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              alignItems: "center",
              height: "100%",
            }}
          >
            {gazetteData?.length > 0 ? (
              gazetteData.map((item) => {
                const isDateSelected = selectedDate?.date === item.date;
                return (
                  <Box
                    key={item.date}
                    onClick={() => dispatch(setSelectedDate(item))}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      flexShrink: 0,
                      mt: { xs: -8.5, sm: -4 },
                    }}
                  >
                    <Tooltip
                      title="Gazette published date"
                      placement="top"
                      arrow
                    >
                      <Box
                        ref={isDateSelected ? dotRef : null}
                        sx={{
                          width: 15,
                          height: 15,
                          borderRadius: "50%",
                          backgroundColor: isDateSelected
                            ? selectedPresident?.themeColorLight ||
                              colors.timelineColor
                            : colors.dotColorInactive,
                          border: `3px solid ${colors.backgroundPrimary}`,
                          zIndex: 99,
                          pointerEvents: "auto",
                          position: "relative",
                          transition: "all 0.3s ease",
                          animation: isDateSelected
                            ? "dotPulse 1.2s infinite ease-in-out"
                            : "none", // Dot pulse
                          "&::before": isDateSelected
                            ? {
                                content: '""',
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                border: `2px solid ${
                                  selectedPresident?.themeColorLight ||
                                  colors.timelineColor
                                }`,
                                transform: "translate(-50%, -50%) scale(1)",
                                zIndex: 0,
                                animation: "ripple 1.2s infinite ease-out",
                              }
                            : {},
                          "@keyframes ripple": {
                            "0%": {
                              transform: "translate(-50%, -50%) scale(1)",
                              opacity: 1,
                            },
                            "70%": {
                              transform: "translate(-50%, -50%) scale(2.5)",
                              opacity: 0.5,
                            },
                            "100%": {
                              transform: "translate(-50%, -50%) scale(3)",
                              opacity: 0,
                            },
                          },
                          "@keyframes dotPulse": {
                            "0%": { transform: "scale(1)" },
                            "50%": { transform: "scale(1.4)" },
                            "100%": { transform: "scale(1)" },
                          },
                        }}
                      />
                    </Tooltip>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        color: isDateSelected
                          ? selectedPresident?.themeColorLight ||
                            colors.timelineColor
                          : colors.dotColorInactive,
                        fontSize: "0.75rem",
                        fontWeight: isDateSelected ? "bold" : "",
                        fontFamily: "poppins",
                        transform: isDateSelected ? "scale(1.2)" : "scale(1)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: { xs: -7.5, sm: -2 },
                  flexShrink: 0,
                }}
              >
                z
                <Box
                  sx={{
                    color: colors.textMuted,
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontSize: "0.85rem",
                    fontFamily: "poppins",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <InfoOutlinedIcon
                    sx={{ fontSize: 15, color: colors.textMuted, mr: 0.5 }}
                  />
                  <Typography variant="caption">
                    No new gazette publications
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <IconButton
            onClick={() => scroll("right")}
            sx={{
              zIndex: 9,
              mt: -6.8,
              backgroundColor: colors.backgroundPrimary,
              visibility: canScrollRight ? "visible" : "hidden",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: colors.backgroundPrimary,
              },
              color: colors.timelineColor,
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
