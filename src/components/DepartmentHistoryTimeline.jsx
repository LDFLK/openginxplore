import { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Avatar,
  Box,
  Dialog,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import utils from "../utils/utils";
import api from "../services/services";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from "@mui/lab";
import { useThemeContext } from "../themeContext";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import colors from "../assets/colors";

const DepartmentHistoryTimeline = ({ selectedDepartment }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const presidents = useSelector((state) => state.presidency.presidentDict);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const [enrichedMinistries, setEnrichedMinistries] = useState([]);
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);;
  const [loading, setLoading] = useState(false);
  const { colors } = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    const enrichWithMinisters = async () => {
      const startTime = new Date().getTime();
      setLoading(true);
      try {
        const departmentIds = new Set([selectedDepartment.id]);
        const queue = [selectedDepartment.id];

        while (queue.length > 0) {
          const currentId = queue.shift();
          const res = await api.getDepartmentRenamedInfo(currentId);
          const info = await res.json();
          if (info && Array.isArray(info)) {
            info.forEach((r) => {
              if (r.relatedEntityId && !departmentIds.has(r.relatedEntityId)) {
                departmentIds.add(r.relatedEntityId);
                queue.push(r.relatedEntityId);
              }
            });
          }
        }

        let allDepartmentRelations = [];
        for (const depId of departmentIds) {
          const relationsRes = await api.getMinistriesByDepartment(depId);
          const ministryRelations = await relationsRes.json();
          allDepartmentRelations.push(...ministryRelations);
        }
        const enriched = [];

        for (const relation of allDepartmentRelations) {
          const ministryId = relation.relatedEntityId;
          const ministry = allMinistryData[ministryId];
          if (!ministry) continue;

          try {
            const allRelations = await api.fetchAllRelationsForMinistry({
              ministryId,
            });
            const appointedRelations = allRelations.filter(
              (r) => r.name === "AS_APPOINTED"
            );

            const relevantMinisters = appointedRelations
              .map((r) => {
                const person = allPersonDict[r.relatedEntityId];
                if (!person) return null;

                const personMinRelationStart = new Date(r.startTime);
                const personMinRelationEnd = r.endTime
                  ? new Date(r.endTime)
                  : null;
                const minDepRelationStart = new Date(relation.startTime);
                const minDepRelationEnd = relation.endTime
                  ? new Date(relation.endTime)
                  : null;

                if (
                  (personMinRelationEnd &&
                    personMinRelationEnd < minDepRelationStart) ||
                  personMinRelationStart > (minDepRelationEnd || new Date())
                )
                  return null;

                const overlapStart =
                  personMinRelationStart > minDepRelationStart
                    ? personMinRelationStart
                    : minDepRelationStart;
                let overlapEnd = null;

                if (personMinRelationEnd && minDepRelationEnd) {
                  overlapEnd =
                    personMinRelationEnd < minDepRelationEnd
                      ? personMinRelationEnd
                      : minDepRelationEnd;
                } else if (personMinRelationEnd) {
                  overlapEnd = personMinRelationEnd;
                } else if (minDepRelationEnd) {
                  overlapEnd = minDepRelationEnd;
                }

                return {
                  ...ministry,
                  minister: {
                    id: person.id,
                    name: person.name,
                  },
                  startTime: overlapStart.toISOString(),
                  endTime: overlapEnd ? overlapEnd.toISOString() : null,
                };
              })
              .filter(Boolean);

            relevantMinisters.sort(
              (a, b) => new Date(a.startTime) - new Date(b.startTime)
            );

            const ministryStart = new Date(relation.startTime);
            const ministryEnd = relation.endTime
              ? new Date(relation.endTime)
              : null;
            const enrichedForMinistry = [];

            if (relevantMinisters.length > 0) {
              const firstMinisterStart = new Date(
                relevantMinisters[0].startTime
              );
              if (firstMinisterStart > ministryStart) {
                enrichedForMinistry.push({
                  ...ministry,
                  minister: null,
                  startTime: ministryStart.toISOString(),
                  endTime: firstMinisterStart.toISOString(),
                });
              }
            }

            enrichedForMinistry.push(...relevantMinisters);

            for (let i = 0; i < relevantMinisters.length - 1; i++) {
              const currentEnd = new Date(relevantMinisters[i].endTime);
              const nextStart = new Date(relevantMinisters[i + 1].startTime);
              if (nextStart > currentEnd) {
                enrichedForMinistry.push({
                  ...ministry,
                  minister: null,
                  startTime: currentEnd.toISOString(),
                  endTime: nextStart.toISOString(),
                });
              }
            }

            if (
              relevantMinisters.length === 0 ||
              (ministryEnd &&
                new Date(
                  relevantMinisters[relevantMinisters.length - 1]?.endTime
                ) < ministryEnd)
            ) {
              enrichedForMinistry.push({
                ...ministry,
                minister: null,
                startTime:
                  relevantMinisters.length > 0
                    ? new Date(
                        relevantMinisters[relevantMinisters.length - 1].endTime
                      ).toISOString()
                    : ministryStart.toISOString(),
                endTime: ministryEnd ? ministryEnd.toISOString() : null,
              });
            }

            enriched.push(...enrichedForMinistry);
          } catch (e) {
            console.log("Minister fetch error:", e.message);
            enriched.push({
              ...ministry,
              minister: null,
              startTime: relation.startTime,
              endTime: relation.endTime,
            });
          }
        }
        // Fill in missing ministers with president based on relation times
        for (const entry of enriched) {
          if (!entry.minister) {
            const entryStart = new Date(entry.startTime);
            const entryEnd = entry.endTime ? new Date(entry.endTime) : null;

            // Loop through president relations object
            const presRelKeys = Object.keys(presidentRelationDict);
            let matchingPresidentRelation = null;

            for (const key of presRelKeys) {
              const presRel = presidentRelationDict[key];
              const presStart = new Date(presRel.startTime);
              const presEnd = presRel.endTime
                ? new Date(presRel.endTime)
                : null;

              const overlapStart =
                entryStart > presStart ? entryStart : presStart;
              const overlapEnd =
                entryEnd && presEnd
                  ? entryEnd < presEnd
                    ? entryEnd
                    : presEnd
                  : entryEnd || presEnd;

              if (!overlapEnd || overlapStart <= overlapEnd) {
                matchingPresidentRelation = presRel;
                break; // assuming only one president active
              }
            }

            if (matchingPresidentRelation) {
              const pres = presidents.find(
                (p) => p.id === matchingPresidentRelation.id
              );
              entry.minister = {
                id: pres.id,
                name: pres.name,
              };
            }
          }
        }

        const collapsed = [];
        for (const entry of enriched.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        )) {
          const last = collapsed[collapsed.length - 1];

          const entryMinName = entry.minister
            ? utils.extractNameFromProtobuf(entry.minister.name)
            : null;
          const lastMinName = last?.minister
            ? utils.extractNameFromProtobuf(last.minister.name)
            : null;
          const entryName = utils.extractNameFromProtobuf(entry.name);
          const lastName = last
            ? utils.extractNameFromProtobuf(last.name)
            : null;

          const sameMinistryAndMinister =
            last &&
            ((last.id === entry.id &&
              last.minister?.id === entry.minister?.id) ||
              (lastName === entryName &&
                last.minister?.id === entry.minister?.id) ||
              (last.id === entry.id && lastMinName === entryMinName) ||
              (lastName === entryName && lastMinName === entryMinName)) &&
            (!last.endTime ||
              !entry.startTime ||
              new Date(last.endTime) >= new Date(entry.startTime));

          if (sameMinistryAndMinister) {
            last.endTime =
              entry.endTime &&
              (!last.endTime ||
                new Date(entry.endTime) > new Date(last.endTime))
                ? entry.endTime
                : last.endTime;
          } else {
            collapsed.push(entry);
          }
        }

        setEnrichedMinistries(
          collapsed.sort(
            (a, b) => new Date(b.startTime) - new Date(a.startTime)
          )
        );
      } catch (err) {
        console.error("Error enriching ministries:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDepartment?.id) {
      enrichWithMinisters();
    }
  }, [selectedDepartment]);

  const handleOpenProfile = (minister) => {
    navigate(`/person-profile/${minister.id}`, {
      state: { mode: "back" },
    });
    // setSelectedMinister(minister);
    // setProfileOpen(true);
  };

  return (
    <>
      {!loading ? (
        <Box sx={{backgroundColor: colors.backgroundWhite, py: 2}}>
          {enrichedMinistries && enrichedMinistries.length > 0 ? (
            <Timeline position="alternate" sx={{ py: 0 }}>
              {enrichedMinistries
                .sort((b, a) => new Date(a.startTime) - new Date(b.startTime))
                .map((entry, idx, arr) => (
                  <TimelineItem key={idx} sx={{ cursor: "pointer", py: 0.5 }}>
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
                            .slice(0, 10)} - ${
                            entry.endTime
                              ? new Date(entry.endTime)
                                  .toISOString()
                                  .slice(0, 10)
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
                          sx={{
                            bgcolor: colors.textMuted,
                            height: 2,
                          }}
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
                          boxShadow:
                            selectedIndex === idx
                              ? `0 0 10px ${colors.textMuted}`
                              : "0 1px 5px rgba(0,0,0,0.1)",
                          transform:
                            selectedIndex === idx ? "scale(1.01)" : "scale(1)",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onClick={() =>
                          setSelectedIndex(selectedIndex === idx ? null : idx)
                        }
                      >
                        <Box
                          sx={{
                            width: "100%",
                            textAlign: "left",
                            display: "flex",
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                              width: "100%",
                            }}
                          >
                            {/* Avatar */}
                            <Avatar
                              sx={{
                                bgcolor: colors.textPrimary,
                                width: 30,
                                height: 30,
                                fontSize: 14,
                                fontWeight: 500,
                                flexShrink: 0,
                                color: colors.backgroundBlue
                              }}
                            >
                              {entry.minister
                                ? utils
                                    .extractNameFromProtobuf(
                                      entry.minister.name
                                    )
                                    .charAt(0)
                                    .toUpperCase()
                                : "?"}
                            </Avatar>

                            {/* Text stacked vertically */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                                justifyContent: "flex-start",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                color={colors.textPrimary}
                                sx={{
                                  fontWeight: "700",
                                  fontSize: 15,
                                  fontFamily: "poppins",
                                }}
                              >
                                {
                                  utils
                                    .extractNameFromProtobuf(entry.name)
                                    .split(":")[0]
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color={colors.textPrimary}
                                sx={{
                                  fontSize: 14,
                                  fontFamily: "poppins",
                                  cursor: entry.minister
                                    ? "pointer"
                                    : "default",
                                  textDecoration: "none",
                                  "&:hover": {
                                    textDecoration: entry.minister
                                      ? "underline"
                                      : "none",
                                  },
                                }}
                                onClick={() =>
                                  entry.minister &&
                                  handleOpenProfile(entry.minister)
                                }
                              >
                                {entry.minister
                                  ? utils.extractNameFromProtobuf(
                                      entry.minister.name
                                    )
                                  : "No Minister Assigned"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
            </Timeline>
          ) : (
            <Typography
              variant="body2"
              sx={{ mt: 2, fontFamily: "poppins", color: colors.textPrimary }}
            >
              No timeline history available.
            </Typography>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "20vh",
          }}
        >
          <ClipLoader
            color={colors.textPrimary}
            loading={loading}
            size={25}
          />
        </Box>
      )}
    </>
  );
};

export default DepartmentHistoryTimeline;
