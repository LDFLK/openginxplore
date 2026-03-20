import { useThemeContext } from "../../../context/themeContext";
import { ClipLoader } from "react-spinners";
import { Link, useLocation } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { Landmark } from "lucide-react";
import { useDepartmentHistory } from "../../../hooks/useDepartmentHistory";

const DepartmentHistoryTimeline = ({ selectedDepartment }) => {
  const { colors, isDark } = useThemeContext();
  const location = useLocation();

  const {
    data: departmentHistory,
    isLoading,
    error
  } = useDepartmentHistory(selectedDepartment?.id);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-20">
          <ClipLoader color={colors.textPrimary} loading={isLoading} size={25} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center bg-transparent px-6 py-20">
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-500 dark:text-gray-400 border-none mb-6">
              Something went wrong. Couldn't load department history.
            </p>
          </div>
        </div>
      ) : departmentHistory && departmentHistory.length > 0 ? (
        <div className="rounded-md p-4 md:p-6 bg-background-dark">
          <VerticalTimeline
            animate={true}
            layout="2-columns"
            lineColor={isDark ? "#364153" : "#dbdbdb"}
          >
            {departmentHistory.map((entry, idx) => {
              return (
                <VerticalTimelineElement
                  key={idx}
                  icon={<Landmark />}
                  iconStyle={{
                    background: isDark ? "#101828" : "#f8f8f8",
                    color: isDark ? "#f8f8f8" : "#0b0b0b",
                    boxShadow: "none",
                    border: `1px solid ${isDark ? "#364153" : "#dbdbdb"}`,
                  }}
                  contentStyle={{
                    background: isDark ? "#101828" : "#f8f8f8",
                    color: isDark ? "#f8f8f8" : "#0b0b0b",
                    border: `1px solid ${isDark ? "#364153" : "#dbdbdb"}`,
                    boxShadow: "none",
                    padding: "10px",
                    paddingTop: "0px",
                    marginBottom: "25px",
                    marginTop: "15px",
                  }}
                  contentArrowStyle={{
                    borderRight: `7px solid ${isDark ? "#364153" : "#dbdbdb"}`,
                  }}
                  date={entry.period}
                  dateClassName={"text-primary/65"}
                >
                  <div>
                    <p className="text-primary" style={{ fontSize: "1rem" }}>
                      {entry.ministry_name}
                    </p>
                    <div className="flex items-center mt-1 space-x-3">
                      <div className="flex items-center justify-between">
                        {entry.minister_name ? (
                          <Link
                            to={`/person-profile/${entry.minister_id}`}
                            state={{
                              mode: "back",
                              from: location.pathname + location.search,
                              callback: true,
                              callbackLink: location.state?.from,
                            }}
                            className="text-accent text-normal font-medium hover:text-accent/80 transition-colors"
                          >
                            {entry.minister_name}
                          </Link>
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
  );
};

export default DepartmentHistoryTimeline;
