import { useThemeContext } from "../../../context/themeContext";
import { ClipLoader } from "react-spinners";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Landmark } from "lucide-react";
import { usePersonHistory } from "../../../hooks/usePersonHistory";

const PersonHistoryTimeline = ({
  personId,
}) => {
  const { colors, isDark } = useThemeContext();

  const { data: personHistory, isLoading, error } = usePersonHistory(personId);
  const ministryHistory = personHistory?.ministry_history || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <ClipLoader color={colors.primary} loading={isLoading} size={25} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-background px-6 py-20">
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Something went wrong. Couldn't load portfolio history.
          </p>
        </div>
      </div>
    );
  }
  if (!ministryHistory.length) {
    return (
      <div className="flex flex-col items-center justify-center bg-background px-6 py-20">
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            No portfolio history available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" rounded-md p-6  dark:bg-gray-800 bg-white overflow-x-hidden">
      <VerticalTimeline
        animate={true}
        layout="2-columns"
        lineColor={isDark ? "#364153" : "#dbdbdb"}
      >
        {ministryHistory.map((entry, idx, arr) => {
          return (
            <VerticalTimelineElement
              key={idx}
              icon={<Landmark />}
              iconStyle={{
                background: isDark ? "#101828" : "#f8f8f8",
                color: isDark ? "#f8f8f8" : "#0099ee",
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
                entry.term
              }
              dateClassName={"text-primary/65"}
            >
              {entry.is_president && (
                <div className="-mt-4">
                  <p className="px-2 bg-blue-500/15 text-accent text-center rounded-md py-1 inline-block mt-0">
                    President
                  </p>
                </div>
              )}
              <h3 className="mt-1">{entry.name}</h3>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};

export default PersonHistoryTimeline;
