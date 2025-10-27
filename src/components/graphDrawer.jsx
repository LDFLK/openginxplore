import { useEffect, useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import { useThemeContext } from "../themeContext";
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import { Building, History, UserRound, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import utils from "../utils/utils";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  onMinistryClick,
  selectedNode,
  parentNode,
  personDic,
  ministryDic,
  departmentDic,
  loading,
}) {
  const { colors, isDark } = useThemeContext();
  const [drawerContentList, setDrawerContentList] = useState({});
  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selectedTab, setSelectedTab] = useState("departments");

  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );

  // ministry from URL when no selected node
  const [urlMinistry, setUrlMinistry] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ministryParam = params.get("ministry");

    if (!ministryParam) {
      setUrlMinistry(null);
      return;
    }

    let found = null;
    if (allMinistryData && allMinistryData[ministryParam]) {
      found = allMinistryData[ministryParam];
    }

    if (found) {
      let name = "";
      try {
        name = utils.extractNameFromProtobuf(found.name);
        if (!name) name = found.name || found.id;
      } catch {
        name = found.name || found.id;
      }
      setUrlMinistry({ id: found.id, name });
    } else {
      setUrlMinistry(null);
    }
  }, [window.location.search, allMinistryData]);


  useEffect(() => {
    setDrawerContentList({});
    setVisibleCount(BATCH_SIZE);
  }, [selectedPresident]);

  useEffect(() => {
    if (!parentNode) {
      setDrawerContentList(ministryDic || {});
    } else if (parentNode.type === "minister") {
      if (selectedTab === "departments") {
        setDrawerContentList(departmentDic || {});
      } else if (selectedTab === "persons") {
        setDrawerContentList(personDic || {});
      }
    } else if (parentNode.type === "department") {
      setDrawerContentList(personDic || {});
    } else {
      setDrawerContentList({});
    }
    setVisibleCount(BATCH_SIZE);
  }, [parentNode, selectedTab, ministryDic, departmentDic, personDic]);

  useEffect(() => {
    console.log("loading ", loading);
  }, [loading]);

  return (
    <div
      className={`${expandDrawer ? "w-1/3" : "w-0"
        } z-[1000] transition-all duration-300 ease-in-out h-full shadow-xl p-4 flex-shrink-0`}
      style={{
        backgroundColor: colors.backgroundPrimary,
        color: colors.textPrimary,
        overflow: expandDrawer ? "visible" : "hidden",
      }}
    >
      {/* Expand button */}
      {!expandDrawer && (
        <button
          className={`${!expandDrawer
            ? "rounded-l-full bg-[#305cde] text-gray-300 text-5xl p-1 absolute right-12 cursor-pointer shadow-xl"
            : ""
            }`}
          onClick={() => setExpandDrawer(true)}
        >
          <CiCircleChevLeft />
        </button>
      )}

      {/* Header */}
      {expandDrawer && (
        <div className="flex item-center font-semibold">
          <button
            className={`mr-2 text-3xl rotate-180 cursor-pointer mb-2`}
            onClick={() => setExpandDrawer(false)}
          >
            <CiCircleChevLeft />
          </button>
          <p className="text-xl">Xplore more...</p>
        </div>
      )}

      {/* Drawer content */}
      {expandDrawer && (
        <div className="flex flex-col h-[97%] p-2">
          {drawerContentList && (
            <>
              {/* Case 1: Show selected node info */}
              {selectedNode && (
                <div className="w-full mb-2 p-4 bg-white/90 border border-gray-500 rounded-sm shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <a>
                    {selectedNode.type == "minister" ? (
                      <div className="flex items-center gap-2 mb-1 text-gray-600">
                        <Building2 className="w-5 h-5" /> <span>Ministry</span>
                      </div>
                    ) : selectedNode.type == "department" ? (
                      <div className="flex items-center gap-2 mb-1 text-gray-600">
                        <Building2 className="w-5 h-5" /> <span>Department</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1 text-gray-600">
                        <User className="w-5 h-5" /> <span>Person</span>
                      </div>
                    )}
                    <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                      {selectedNode ? selectedNode.name : ""}
                    </p>
                  </a>

                  {/* Profile buttons */}
                  {selectedNode && selectedNode.type == "department" ? (
                    <Link
                      to={`/department-profile/${selectedNode.id}`}
                      state={{ mode: "back" }}
                      className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-300 bg-blue-700 rounded-sm hover:bg-blue-800"
                    >
                      <History className="w-5 h-5 mr-2" />
                      View History
                    </Link>
                  ) : (
                    selectedNode &&
                    selectedNode.type == "person" && (
                      <Link
                        to={`/person-profile/${selectedNode.id}`}
                        state={{ mode: "back" }}
                        className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-300 bg-blue-700 rounded-sm hover:bg-blue-800"
                      >
                        <History className="w-5 h-5 mr-2" />
                        View Profile
                      </Link>
                    )
                  )}
                </div>
              )}

              {/* Case 2: Show ministry from URL when no selected node */}
              {!selectedNode && urlMinistry && (
                <div className="w-full mb-2 p-4 bg-white/90 border border-gray-500 rounded-sm shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1 text-gray-600">
                    <Building2 className="w-5 h-5" />
                    <span>Ministry</span>
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                    {urlMinistry.name}
                  </p>
                </div>
              )}

              {/* Tabs for ministers */}
              {parentNode && parentNode.type === "minister" && (
                <div className="flex justify-center mt-4 border border-white/20 p-1 rounded-sm bg-[#0F172A]">
                  <button
                    className={`hover:cursor-pointer w-1/2 py-3 font-normal text-lg transition-colors duration-300 transform rounded-l-xs inline-flex items-center justify-center space-x-2
                      ${selectedTab === "departments"
                        ? "text-cyan-300 bg-[#1E2A38]"
                        : "text-white bg-transparent hover:text-cyan-400"
                      }`}
                    onClick={() => setSelectedTab("departments")}
                  >
                    <Building className="w-5 h-5" />
                    <span className="text-sm">Departments</span>
                  </button>

                  <button
                    className={`hover:cursor-pointer w-1/2 py-3 font-normal text-lg transition-colors duration-300 transform rounded-r-xs inline-flex items-center justify-center space-x-2 border-l border-white/20
                      ${selectedTab === "persons"
                        ? "text-cyan-300 bg-[#1E2A38]"
                        : "text-white bg-transparent hover:text-cyan-400"
                      }`}
                    onClick={() => setSelectedTab("persons")}
                  >
                    <UserRound className="w-5 h-5" />
                    <span className="text-sm">People</span>
                  </button>
                </div>
              )}

              {/* Header */}
              {loading ? (
                <h2 className="text-md font-normal text-gray-300 mt-4 mb-2 shrink-0">
                  Loading...
                </h2>
              ) : (
                <h2 className="text-md font-normal text-gray-300 mt-4 mb-2 shrink-0">
                  {Object.keys(drawerContentList).length} Active
                  {`${parentNode &&
                    parentNode.type === "minister" &&
                    selectedTab === "departments"
                    ? " Departments"
                    : parentNode &&
                      parentNode.type === "minister" &&
                      selectedTab === "persons"
                      ? " People"
                      : " Ministries"
                    }`}
                </h2>
              )}

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="w-full h-full flex items-start justify-center pt-6">
                    <ClipLoader
                      size={28}
                      color={isDark ? "#9CA3AF" : "#1F2937"}
                    />
                  </div>
                ) : (
                  drawerContentList &&
                  Object.entries(drawerContentList)
                    .slice(0, visibleCount)
                    .map(([key, item], index) => {
                      const isSelected =
                        selectedNode && selectedNode.id === item.id;
                      const baseClasses =
                        "my-2 p-2 rounded-sm cursor-pointer font-normal text-sm transition-colors duration-200";
                      const themeClasses = isDark
                        ? "text-gray-300"
                        : "text-gray-700";
                      const selectedClasses = isSelected
                        ? isDark
                          ? "bg-cyan-800/60 border-l-4 border-cyan-400 text-cyan-100"
                          : "bg-cyan-100 border-l-4 border-cyan-500 text-cyan-800"
                        : isDark
                          ? "bg-[#1E2A38]/50 hover:bg-[#1E2A38] text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700";

                      return (
                        <div
                          key={key}
                          role="button"
                          aria-pressed={isSelected}
                          aria-selected={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              onMinistryClick(item);
                            }
                          }}
                          className={`${baseClasses} ${themeClasses} ${selectedClasses}`}
                          onClick={() => onMinistryClick(item)}
                        >
                          <div className="flex">
                            <span className="mr-2" style={{ opacity: 0.9 }}>
                              {index + 1}.
                            </span>
                            <p>{item.name}</p>
                          </div>
                        </div>
                      );
                    })
                )}

                {/* Lazy Load */}
                <div className="w-full flex flex-col items-center">
                  {drawerContentList &&
                    Object.keys(drawerContentList).length > visibleCount && (
                      <button
                        className="mt-2 px-4 text-sm py-2 bg-blue-500 text-gray-300 rounded hover:bg-blue-600 hover:cursor-pointer"
                        onClick={() =>
                          setVisibleCount((prev) => prev + BATCH_SIZE)
                        }
                      >
                        Load More
                      </button>
                    )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
