import { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Avatar,
  Box,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from "@mui/lab";
import { useThemeContext } from "../../../themeContext";
import { ClipLoader } from "react-spinners";
import utils from "../../../utils/utils";
import api from "../../../services/services";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const PersonHistoryTimeline = ({
  selectedPerson,
  onTimelineUpdate,
  presidentRelationDict,
}) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const { colors } = useThemeContext();

  useEffect(() => {
    const fetchPersonHistory = async () => {
      if (!selectedPerson?.id) return;
      setLoading(true);
      try {
        const res = await api.getMinistriesByPerson(selectedPerson.id);
        const data = await res.json();

        const enriched = data
          .filter(d => d.startTime !== d.endTime)
          .map((d) => {
            const ministry = allMinistryData[d.relatedEntityId];
            return {
              ...d,
              ministryName: ministry
                ? utils.extractNameFromProtobuf(ministry.name)
                : "Unknown Ministry",
              startTime: d.startTime,
              endTime: d.endTime,
            };
          })
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        setTimelineData(enriched);
        onTimelineUpdate?.(enriched);
      } catch (err) {
        console.error("Error fetching person history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonHistory();
  }, [selectedPerson, allMinistryData, onTimelineUpdate]);

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
        <ClipLoader color={colors.primary} loading={loading} size={25} />
      </Box>
    );
  }

  if (!timelineData.length) {
    return (
      <Typography
        variant="body2"
        sx={{ mt: 2, fontFamily: "poppins", color: colors.textPrimary }}
      >
        No timeline history available.
      </Typography>
    );
  }
  const isPresidentDuring = (ministryStart, ministryEnd) => {
    return Object.values(presidentRelationDict).some((rel) => {
      if (rel.id !== selectedPerson?.id) return false;
      const presStart = new Date(rel.startTime);
      const presEnd = rel.endTime ? new Date(rel.endTime) : null;

      const mStart = new Date(ministryStart);
      const mEnd = ministryEnd ? new Date(ministryEnd) : null;

      // overlap condition
      return (!presEnd || mStart <= presEnd) && (!mEnd || mEnd >= presStart);
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        alignItems: "center",
        p: { xs: 2, sm: 4 },
        borderRadius: 2,
        backgroundColor: colors.backgroundWhite,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        gap: 2,
      }}
    >
      <Timeline position="alternate" sx={{ py: 0 }}>
        {timelineData.map((entry, idx, arr) => {
          const wasPresident = isPresidentDuring(
            entry.startTime,
            entry.endTime
          );

          return (
            <TimelineItem key={idx} sx={{ py: 0 }}>
              <TimelineOppositeContent
                sx={{
                  m: "auto 0",
                  color: colors.textMuted,
                  fontWeight: "600",
                  fontSize: 12,
                  minWidth: 70,
                  pr: 1,
                  fontFamily: "poppins",
                }}
                align="right"
                variant="body2"
              >
                {entry.startTime
                  ? `${new Date(entry.startTime)
                    .toISOString()
                    .slice(0, 10)} - ${entry.endTime
                      ? new Date(entry.endTime).toISOString().slice(0, 10)
                      : "Present"
                  }`
                  : "Unknown"}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot
                  color="primary"
                  sx={{
                    width: 2,
                    height: 2,
                    boxShadow: `0 0 6px ${colors.textPrimary}`,
                    animation: "pulse 2.5s infinite",
                    backgroundColor: colors.textPrimary,
                  }}
                />
                {idx < arr.length && (
                  <TimelineConnector
                    sx={{ bgcolor: colors.textMuted, height: 2 }}
                  />
                )}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0.5, px: 1 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: colors.backgroundBlue,
                    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        bgcolor: colors.textPrimary,
                        width: 25,
                        height: 25,
                        fontSize: 14,
                      }}
                    >
                      <AccountBalanceIcon style={{ color: colors.backgroundBlue, width: 15, height: 15 }} />
                    </Avatar>

                    {/* Text + President badge */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        flexGrow: 1,
                        alignSelf: "flex-start",
                      }}
                    >
                      {/* Ministry Name */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: "600",
                          fontSize: { xs: 12, sm: 15 }, // responsive font
                          fontFamily: "poppins",
                          wordBreak: "break-word",
                          width: "100%",
                          textAlign: "left",
                          color: colors.textPrimary
                        }}
                      >
                        {entry.ministryName.split(":")[0]}
                      </Typography>

                      {/* President Badge */}
                      {wasPresident && (
                        <Box
                          sx={{
                            mt: 0.5,
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            bgcolor: colors.textMuted,
                            color: colors.backgroundBlue,
                            fontSize: { xs: 8, sm: 10 }, // responsive font
                            fontWeight: 500,
                            fontFamily: "poppins",
                            alignSelf: "flex-start",
                          }}
                        >
                          President
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
};

export default PersonHistoryTimeline;