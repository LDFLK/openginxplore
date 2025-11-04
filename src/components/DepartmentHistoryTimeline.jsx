import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import utils from "../utils/utils";
import api from "../services/services";
import { useThemeContext } from "../themeContext";
import { ClipLoader } from "react-spinners";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { Landmark } from "lucide-react";

import "./../assets/verticalTimeLineCSS.css";

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
                          border: `1px solid  ${
                            isDark ? "#364153" : "#dbdbdb"
                          }`,
                        }}
                        className={idx}
                        contentStyle={{
                          background: isDark ? "#101828" : "#f8f8f8",
                          color: isDark ? "#f8f8f8" : "#0b0b0b",
                          border: `1px solid  ${
                            isDark ? "#364153" : "#dbdbdb"
                          }`,
                          boxShadow: "none",
                          padding: "10px",
                          paddingTop: "0px",
                          marginBottom: "25px",
                          marginTop: "15px",
                        }}
                        contentArrowStyle={{
                          borderRight: `7px solid  ${
                            isDark ? "#364153" : "#dbdbdb"
                          }`,
                        }}
                        date={
                          entry.startTime
                            ? `${new Date(entry.startTime)
                                .toISOString()
                                .slice(0, 10)} - ${
                                entry.endTime
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
