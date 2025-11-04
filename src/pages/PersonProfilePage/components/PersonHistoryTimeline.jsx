import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./../../../assets/verticalTimeLineCSS.css";
import { useThemeContext } from "../../../themeContext";
import { ClipLoader } from "react-spinners";
import utils from "../../../utils/utils";
import api from "../../../services/services";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Landmark } from "lucide-react";

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
  const { colors, isDark } = useThemeContext();

  useEffect(() => {
    const fetchPersonHistory = async () => {
      if (!selectedPerson?.id) return;
      setLoading(true);
      try {
        const res = await api.getMinistriesByPerson(selectedPerson.id);
        const data = await res.json();

        const enriched = data
          .filter((d) => d.startTime !== d.endTime)
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
      <div className="flex justify-center items-center h-20">
        <ClipLoader color={colors.primary} loading={loading} size={25} />
      </div>
    );
  }

  if (!timelineData.length) {
    return (
      <h4 className="mt-2 text-primary">No timeline history available.</h4>
    );
  }
  const isPresidentDuring = (ministryStart, ministryEnd) => {
    return Object.values(presidentRelationDict).some((rel) => {
      if (rel.id !== selectedPerson?.id) return false;
      const presStart = new Date(rel.startTime);
      const presEnd = rel.endTime ? new Date(rel.endTime) : null;

      const mStart = new Date(ministryStart);
      const mEnd = ministryEnd ? new Date(ministryEnd) : null;

      return (!presEnd || mStart <= presEnd) && (!mEnd || mEnd >= presStart);
    });
  };

  return (
    <div className=" rounded-md p-6 bg-background-dark">
      <VerticalTimeline
        animate={true}
        layout="2-columns"
        lineColor={isDark ? "#364153" : "#dbdbdb"}
      >
        {timelineData.map((entry, idx, arr) => {
          const wasPresident = isPresidentDuring(
            entry.startTime,
            entry.endTime
          );

          return (
            <VerticalTimelineElement
              icon={<Landmark />}
              iconStyle={{
                background: isDark ? "#101828" : "#f8f8f8",
                color: isDark ? "#f8f8f8" : "#0b0b0b",
                boxShadow: "none",
                border: `1px solid  ${isDark ? "#364153" : "#dbdbdb"}`,
              }}
              className={idx}
              contentStyle={{
                background: isDark ? "#101828" : "#f8f8f8",
                color: isDark ? "#f8f8f8" : "#0b0b0b",
                border: `1px solid  ${isDark ? "#364153" : "#dbdbdb"}`,
                boxShadow: "none",
                padding: "10px",
                marginBottom: "25px",
                marginTop: "25px",
              }}
              contentArrowStyle={{
                borderRight: `7px solid  ${isDark ? "#364153" : "#dbdbdb"}`,
              }}
              date={
                entry.startTime
                  ? `${new Date(entry.startTime)
                      .toISOString()
                      .slice(0, 10)} - ${
                      entry.endTime
                        ? new Date(entry.endTime).toISOString().slice(0, 10)
                        : "Present"
                    }`
                  : ""
              }
              dateClassName={"text-primary/65"}
            >
              {wasPresident && (
                <div className="-mt-4">
                  <p className="bg-active-green/15 text-center rounded-md px-2 py-1 inline-block mt-0">
                    President
                  </p>
                </div>
              )}
              <h3 className="mt-1">{entry.ministryName.split(":")[0]}</h3>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};

export default PersonHistoryTimeline;
