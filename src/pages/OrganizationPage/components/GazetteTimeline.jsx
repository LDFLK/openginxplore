import { useEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, IconButton, Divider } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedDate } from "../../../store/presidencySlice";
import utils from "../../../utils/utils";
import StyledBadge from "../../../components/materialCustomAvatar";
import { useThemeContext } from "../../../context/themeContext";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function GazetteTimeline({ multiSelect = false, multiSelectedDates = [], onMultiSelectChange }) {
  const dispatch = useDispatch();

  //redux state
  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const selectedDate = useSelector((state) => state.presidency.selectedDate);

  const { gazetteData } = useSelector((state) => state.gazettes);

  //ref
  const scrollRef = useRef(null);
  const avatarRef = useRef(null);
  const dotRef = useRef(null);

  //states
  const [lineStyle, setLineStyle] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [latestPresidentId, _setLatestPresidentId] = useState(null);

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
    if (!dotRef.current || !scrollRef.current) {
      setLineStyle(null);
      return;
    }

    const dotBox = dotRef.current.getBoundingClientRect();
    const containerBox =
      scrollRef.current.parentElement.getBoundingClientRect();

    // Start from the very left edge of the container
    const startX = containerBox.left;
    const endX = dotBox.left + dotBox.width / 2;
    const containerHeight = containerBox.height;
    const top = containerHeight / 2 - 30;

    setLineStyle({
      left: 0,
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
  }, [selectedDate, gazetteData, multiSelect]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        mb: { xs: "-20px", md: "auto" }
      }}
    >
      {gazetteData?.length > 0 && (
        <Typography
          sx={{
            fontSize: { xs: "0.7rem", md: "0.95rem" },
            color: `${colors.textPrimary}99`,
            textAlign: "center",
          }}
        >
          {selectedPresident && (`${utils.extractNameFromProtobuf(selectedPresident?.name).split(" ")[0]}'s Gazettes published dates`)}
        </Typography>
      )}

      {selectedPresident && (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            width: "100%",
            height: "120px",
          }}
        >
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              zIndex: 10,
              mt: -6.8,
              backgroundColor: colors.backgroundPrimary,
              visibility: canScrollLeft ? "visible" : "hidden",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: colors.backgroundPrimary,
              },
              color: colors.timelineColor,
              "& svg": { fontSize: { xs: "1rem", sm: "1.2rem" } },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              top: "calc(50% - 28px)",
              width: "96%",
              left: 0,
              right: 0,
              height: "2px",
              backgroundColor: colors.timelineColor,
              zIndex: 0,
            }}
          />

          {!multiSelect && lineStyle && selectedDate && (
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
                const isDateSelected = multiSelect
                  ? multiSelectedDates.includes(item.date)
                  : selectedDate?.date === item.date;
                return (
                  <Box
                    key={item.date}
                    onClick={() => {
                      if (multiSelect) {
                        onMultiSelectChange(item.date);
                      } else {
                        dispatch(setSelectedDate(item));
                      }
                    }}
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
                      title={
                        <Box>
                          <p className="text-md">Gazette Sources</p>
                          <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                            {item.gazetteId &&
                              item.gazetteId.map((id, index) => (
                                <li key={id}>
                                  <a
                                    href={`https://archives.opendata.lk/?search=id%3A${id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent text-md"
                                  >
                                    {`${index + 1})
                                    ${id}`}
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </Box>
                      }
                      children={"hellow hello"}
                      placement="top"
                      arrow
                    >
                      <Box
                        ref={isDateSelected && !multiSelect ? dotRef : null}
                        sx={{
                          width: isDateSelected ? 20 : 15,
                          height: isDateSelected ? 20 : 15,
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
                  flexShrink: 0,
                  position: "absolute",
                  left: 0,
                }}
              >
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
                    sx={{ fontSize: 15, color: colors.textMuted }}
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
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              zIndex: 9,
              mt: -6.8,
              backgroundColor: colors.backgroundPrimary,
              visibility: canScrollRight ? "visible" : "hidden",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: colors.backgroundPrimary,
              },
              color: colors.timelineColor,
              "& svg": { fontSize: { xs: "1rem", sm: "1.2rem" } },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {gazetteData?.length == 0 && selectedDate && (
          <Typography
            variant="caption"
            sx={{
              color: colors.success || "#28a745",
              fontWeight: 500,
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Information corresponds to the last date of selected range:{" "}
            {new Date(selectedDate.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        )}
        {selectedDate?.date &&
          !gazetteData.some((item) => item.date === selectedDate.date) &&
          !gazetteData?.length == 0 && (
            <Typography
              variant="caption"
              sx={{
                color: colors.success || "#28a745",
                fontWeight: 500,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Information corresponds to the date:{" "}
              {new Date(selectedDate.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              (not a gazette published date)
            </Typography>
          )}
      </Box>
    </Box>
  );
}
