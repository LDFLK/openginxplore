import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import utils from "../../../utils/utils";
import api from "../../../services/services";
import { useThemeContext } from "../../../context/themeContext";
import { ClipLoader } from "react-spinners";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { Landmark } from "lucide-react";


const DepartmentHistoryTimeline = ({ selectedDepartment }) => {
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const presidents = useSelector((state) => state.presidency.presidentDict);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const [enrichedMinistries, setEnrichedMinistries] = useState([]);
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const [loading, setLoading] = useState(false);
  const { colors, isDark } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const enrichWithMinisters = async () => {
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

        // After fetching allDepartmentRelations, filter out same-day entries
        allDepartmentRelations = allDepartmentRelations.filter(relation => {
          if (!relation.endTime) return true;
          const start = new Date(relation.startTime).toISOString().split('T')[0];
          const end = new Date(relation.endTime).toISOString().split('T')[0];
          return start !== end;
        });
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

        // In the president filling loop:
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
                (overlapEnd && overlapStart <= overlapEnd);

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
                // Calculate overlap times
                const presStart = new Date(matchingPresidentRelation.startTime);
                const presEnd = matchingPresidentRelation.endTime ? new Date(matchingPresidentRelation.endTime) : null;

                const overlapStart = entryStart > presStart ? entryStart : presStart;
                const overlapEnd = entryEnd && presEnd ? (entryEnd < presEnd ? entryEnd : presEnd) : (entryEnd || presEnd);

                entry.minister = {
                  id: pres.id,
                  name: pres.name,
                };

                entry.startTime = overlapStart.toISOString();
                entry.endTime = overlapEnd ? overlapEnd.toISOString() : null;
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

  return (
    <>
      {!loading ? (
        <>
          {enrichedMinistries && enrichedMinistries.length > 0 ? (
            <div className=" rounded-md p-6 bg-background-dark">
              <VerticalTimeline
                animate={true}
                layout="2-columns"
                lineColor={isDark ? "#364153" : "#dbdbdb"}
              >
                {enrichedMinistries
                  .sort((b, a) => new Date(a.startTime) - new Date(b.startTime))
                  .map((entry, idx, arr) => {
                    return (
                      <VerticalTimelineElement
                        icon={<Landmark />}
                        iconStyle={{
                          background: isDark ? "#101828" : "#f8f8f8",
                          color: isDark ? "#f8f8f8" : "#0b0b0b",
                          boxShadow: "none",
                          border: `1px solid  ${isDark ? "#364153" : "#dbdbdb"
                            }`,
                        }}
                        className={idx}
                        contentStyle={{
                          background: isDark ? "#101828" : "#f8f8f8",
                          color: isDark ? "#f8f8f8" : "#0b0b0b",
                          border: `1px solid  ${isDark ? "#364153" : "#dbdbdb"
                            }`,
                          boxShadow: "none",
                          padding: "10px",
                          paddingTop: "0px",
                          marginBottom: "25px",
                          marginTop: "15px",
                        }}
                        contentArrowStyle={{
                          borderRight: `7px solid  ${isDark ? "#364153" : "#dbdbdb"
                            }`,
                        }}
                        date={
                          entry.startTime
                            ? `${new Date(entry.startTime)
                              .toISOString()
                              .slice(0, 10)} - ${entry.endTime
                                ? new Date(entry.endTime)
                                  .toISOString()
                                  .slice(0, 10)
                                : "Present"
                            }`
                            : ""
                        }
                        dateClassName={"text-primary/65"}
                      >
                        <div>
                          <p
                            className="text-primary"
                            style={{ fontSize: "1rem" }}
                          >
                            {
                              utils
                                .extractNameFromProtobuf(entry.name)
                                .split(":")[0]
                            }
                          </p>
                          <div className="flex items-center mt-1 space-x-3">
                            <div className="flex items-center justify-between">
                              {entry.minister ? (
                                <>
                                  {/* Minister Name */}
                                  <Link
                                    to={`/person-profile/${entry.minister.id}`}
                                    state={{
                                      mode: "back",
                                      from: location.pathname + location.search,
                                      callback: true,
                                      callbackLink: location.state?.from,
                                    }}
                                    className="text-accent text-normal font-medium hover:text-accent/80 transition-colors"
                                  >
                                    {utils.extractNameFromProtobuf(
                                      entry.minister.name
                                    )}
                                  </Link>
                                </>
                              ) : (
                                <span className="text-primary/25 italic">
                                  No Minister Assigned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </VerticalTimelineElement>
                    );
                  })}
              </VerticalTimeline>
            </div>
          ) : (
            <p className="text-primary mt-5">No timeline history available.</p>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-20">
          <ClipLoader color={colors.textPrimary} loading={loading} size={25} />
        </div>
      )}
    </>
  );
};

export default DepartmentHistoryTimeline;
