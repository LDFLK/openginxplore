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

            // Filter out same-day entries (start === end)
            const validMinisters = relevantMinisters.filter((minister) => {
              if (!minister.endTime) return true; // Keep ongoing appointments
              const start = new Date(minister.startTime).toISOString().split('T')[0];
              const end = new Date(minister.endTime).toISOString().split('T')[0];
              return start !== end; // Keep only if start and end are different days
            });

            // 
            enriched.push(...validMinisters);

            // Store empty ministry periods with no ministers
            if (validMinisters.length === 0) {
              enriched.push({
                ...ministry,
                minister: null,
                startTime: relation.startTime,
                endTime: relation.endTime,
              });
            }
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

        // Find gaps by grouping by ministry
        const gapsToFill = [];
        const byMinistry = {};

        // Group entries by ministry ID
        for (const entry of enriched) {
          if (!byMinistry[entry.id]) {
            byMinistry[entry.id] = [];
          }
          byMinistry[entry.id].push(entry);
        }

        // For each ministry, find gaps between minister appointments
        for (const [ministryId, entries] of Object.entries(byMinistry)) {
          const sorted = entries.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
          );

          // Find the ministry-department actual start/end times
          const ministryRelation = allDepartmentRelations.find(
            (r) => r.relatedEntityId === ministryId
          );
          if (!ministryRelation) continue;

          const ministryStart = new Date(ministryRelation.startTime);
          const ministryEnd = ministryRelation.endTime
            ? new Date(ministryRelation.endTime)
            : null;

          // Check gap at the beginning (before first minister)
          const first = sorted[0];
          if (first.minister) {
            const firstMinisterStart = new Date(first.startTime);
            if (firstMinisterStart > ministryStart) {
              gapsToFill.push({
                ...first,
                minister: null,
                startTime: ministryStart.toISOString(),
                endTime: firstMinisterStart.toISOString(),
              });
            }
          }

          // Check gaps between consecutive ministers
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];

            // Only check gaps between actual ministers (not null entries)
            if (current.minister && current.endTime) {
              const currentEnd = new Date(current.endTime);
              const nextStart = new Date(next.startTime);

              // Only create gap if next starts AFTER current ends (no overlap)
              if (nextStart > currentEnd) {
                gapsToFill.push({
                  ...current,
                  minister: null,
                  startTime: currentEnd.toISOString(),
                  endTime: nextStart.toISOString(),
                });
              }
            }
          }

          // Check gap at the end (after last minister)
          const last = sorted[sorted.length - 1];
          if (last.minister && last.endTime && ministryEnd) {
            const lastMinisterEnd = new Date(last.endTime);
            if (ministryEnd > lastMinisterEnd) {
              gapsToFill.push({
                ...last,
                minister: null,
                startTime: lastMinisterEnd.toISOString(),
                endTime: ministryEnd.toISOString(),
              });
            }
          }
        }

        // Add identified gaps to enriched array
        enriched.push(...gapsToFill);

        // fill gaps with presidents
        for (const entry of enriched) {
          if (!entry.minister) {
            const entryStart = new Date(entry.startTime);
            const entryEnd = entry.endTime ? new Date(entry.endTime) : null;

            const presRelKeys = Object.keys(presidentRelationDict);
            let matchingPresidentRelation = null;

            for (const key of presRelKeys) {
              const presRel = presidentRelationDict[key];
              const presStart = new Date(presRel.startTime);
              const presEnd = presRel.endTime ? new Date(presRel.endTime) : null;

              const overlapStart = entryStart > presStart ? entryStart : presStart;
              const overlapEnd =
                entryEnd && presEnd
                  ? entryEnd < presEnd
                    ? entryEnd
                    : presEnd
                  : entryEnd || presEnd;

              const hasOverlap =
                (!entryEnd && !presEnd) ||
                (overlapEnd && overlapStart < overlapEnd);

              if (hasOverlap) {
                matchingPresidentRelation = presRel;
                break;
              }
            }

            if (matchingPresidentRelation) {
              const pres = presidents.find(
                (p) => p.id === matchingPresidentRelation.id
              );
              if (pres) {
                entry.minister = {
                  id: pres.id,
                  name: pres.name,
                };
              }
            }
          }
        }

        // Collapse consecutive entries ONLY if same ministry ID, same name, AND same minister
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
          const lastName = last ? utils.extractNameFromProtobuf(last.name) : null;

          // collapse if BOTH ministry ID AND name are the same
          const sameMinistryAndMinister =
            last &&
            last.id === entry.id &&
            lastName === entryName &&
            last.minister?.id === entry.minister?.id &&
            (!last.endTime ||
              !entry.startTime ||
              new Date(last.endTime) >= new Date(entry.startTime));

          if (sameMinistryAndMinister) {
            last.endTime =
              entry.endTime &&
                (!last.endTime || new Date(entry.endTime) > new Date(last.endTime))
                ? entry.endTime
                : last.endTime;
          } else {
            collapsed.push(entry);
          }
        }

        setEnrichedMinistries(
          collapsed.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
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
        <Box sx={{ backgroundColor: colors.backgroundWhite, py: 2 }}>
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
                          .slice(0, 10)} - ${entry.endTime
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
