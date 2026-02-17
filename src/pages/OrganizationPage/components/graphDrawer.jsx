import { useEffect, useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import { useThemeContext } from "../../../context/themeContext";
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import { Building, History, UserRound, Building2, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import utils from "../../../utils/utils";

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

  const location = useLocation();

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
    } else if (parentNode.type === "cabinetMinister" || parentNode.type === "stateMinister") {
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

  return (
    <div
      className={`${expandDrawer ? "w-full md:w-1/2 lg:w-1/3 p-2 md:p-3 lg:p-4" : "w-0"
        } transition-all duration-300 ease-in-out border-border md:border-l h-full flex-shrink-0 bg-background-dark absolute md:relative right-0 top-0 z-50 md:z-auto shadow-2xl md:shadow-none`}
    >
      {/* Expand button */}
      {!expandDrawer && (
        <button
          className="rounded-l-full bg-accent text-background text-3xl md:text-4xl lg:text-5xl p-0.5 md:p-1 fixed md:absolute top-2 md:top-2 right-0 cursor-pointer shadow-xl z-50"
          onClick={() => setExpandDrawer(true)}
        >
          <CiCircleChevLeft />
        </button>
      )}

      {/* Header */}
      {expandDrawer && (
        <div className="flex item-center font-semibold">
          <button
            className={`mr-1 md:mr-2 text-2xl md:text-2xl lg:text-3xl rotate-180 cursor-pointer mb-2 text-foreground dark:text-white`}
            onClick={() => setExpandDrawer(false)}
          >
            <CiCircleChevLeft />
          </button>
        </div>
      )}

      {/* Drawer content */}
      {expandDrawer && (
        <div className="flex flex-col h-[97%] p-1 md:p-2">
          {drawerContentList && (
            <>
              {/* Case 1: Show selected node info */}
              {selectedNode && selectedNode.type !== "government" && (
                <div className="w-full mb-2 p-3 md:p-4 bg-background border border-border rounded-sm shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <a>
                    {selectedNode.type == "cabinetMinister" ? (
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 text-primary/50">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-xs md:text-sm">Cabinet Minister</span>
                      </div>
                    ) : selectedNode.type == "stateMinister" ? (
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 text-primary/50">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-xs md:text-sm">State Minister</span>
                      </div>
                    ) : selectedNode.type == "department" ? (
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 text-primary/50">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-xs md:text-sm">Department</span>
                      </div>
                    ) : selectedNode.type == "persons" ? (
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 text-primary/50">
                        <User className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-xs md:text-sm">Person</span>
                      </div>
                    ) : null}
                    <p className="text-base md:text-md font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                      {selectedNode ? selectedNode.name : ""}
                    </p>
                  </a>

                  {/* Profile buttons */}
                  {selectedNode && selectedNode.type == "department" ? (
                    <Link
                      to={`/department-profile/${selectedNode.id}`}
                      state={{ mode: "back", from: location.pathname + location.search }}
                      className="mt-2 inline-flex items-center px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-center text-background bg-accent rounded-sm hover:bg-accent/90"
                    >
                      <History className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                      View History
                    </Link>
                  ) : (
                    selectedNode &&
                    selectedNode.type == "person" && (
                      <Link
                        to={`/person-profile/${selectedNode.id}`}
                        state={{ mode: "back", from: location.pathname + location.search }}
                        className="mt-2 inline-flex items-center px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-center text-background bg-accent rounded-sm hover:bg-accent/90"
                      >
                        <History className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                        View Profile
                      </Link>
                    )
                  )}
                </div>
              )}

              {/* Case 2: Show ministry from URL when no selected node */}
              {!selectedNode && urlMinistry && (
                <div className="w-full mb-2 p-3 md:p-4 bg-background/90 border border-border rounded-md">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 text-primary/50">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">Ministry</span>
                  </div>
                  <p className="text-base md:text-lg font-normal tracking-tight text-primary">
                    {urlMinistry.name}
                  </p>
                </div>
              )}
              {!(selectedNode && (selectedNode.type === "department" || selectedNode.type === "person")) && (
                <>
                  {/* Tabs for ministers */}
                  {parentNode && (parentNode.type === "cabinetMinister" || parentNode.type === "stateMinister") && (
                    <div className="flex justify-center mt-2 md:mt-4 border border-border p-0.5 md:p-1 rounded-sm bg-background">
                      <button
                        className={`hover:cursor-pointer w-1/2 py-2 md:py-3 font-normal text-base md:text-lg transition-colors duration-300 transform rounded-l-xs inline-flex items-center justify-center space-x-1 md:space-x-2
                      ${selectedTab === "departments"
                            ? "text-primary bg-accent/25"
                            : "text-primary bg-transparent"
                          }`}
                        onClick={() => setSelectedTab("departments")}
                      >
                        <Building className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm">Departments</span>
                      </button>

                      <button
                        className={`hover:cursor-pointer w-1/2 py-2 md:py-3 font-normal text-base md:text-lg transition-colors duration-300 transform rounded-r-xs inline-flex items-center justify-center space-x-1 md:space-x-2 border-l border-white/20
                      ${selectedTab === "persons"
                            ? "text-primary bg-accent/25"
                            : "text-primary bg-transparent"
                          }`}
                        onClick={() => setSelectedTab("persons")}
                      >
                        <UserRound className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm">People</span>
                      </button>
                    </div>
                  )}

                  {/* Header */}
                  {loading ? (
                    <h2 className="text-sm md:text-md font-normal text-primary mt-2 md:mt-4 mb-2 shrink-0">
                      Loading...
                    </h2>
                  ) : (
                    parentNode &&
                      (parentNode.type === "cabinetMinister" || parentNode.type === "stateMinister") &&
                      selectedTab === "departments"
                      ? <h2 className="text-sm md:text-md font-normal text-primary mt-2 md:mt-4 mb-2 shrink-0"> {Object.keys(drawerContentList).length} Departments</h2>
                      : parentNode &&
                        (parentNode.type === "cabinetMinister" || parentNode.type === "stateMinister") &&
                        selectedTab === "persons"
                        ? <h2 className="text-sm md:text-md font-normal text-primary mt-2 md:mt-4 mb-2 shrink-0">{Object.keys(drawerContentList).length} People</h2>
                        : ""
                  )}

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
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
                            "my-1.5 md:my-2 p-1.5 md:p-2 rounded-sm cursor-pointer font-normal text-xs md:text-sm transition-colors duration-200";

                          const themeClasses = isDark
                            ? "text-primary/75"
                            : "text-primary/75";

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
                              className={`${baseClasses} ${themeClasses} bg-background/85`}
                              onClick={() => onMinistryClick(item)}
                            >
                              <div className="flex">
                                <span className="mr-1.5 md:mr-2" style={{ opacity: 0.9 }}>
                                  {index + 1}.
                                </span>
                                <p className="break-words">{item.name}</p>
                              </div>
                            </div>
                          );
                        })
                    )}

                    {/* Lazy Load */}
                    <div className="w-full flex flex-col items-center mb-6">
                      {drawerContentList &&
                        Object.keys(drawerContentList).length > visibleCount && (
                          <button
                            className="mt-2 px-3 md:px-4 text-xs md:text-sm py-1.5 md:py-2 bg-accent text-background/90 rounded hover:accent/10 hover:cursor-pointer"
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
