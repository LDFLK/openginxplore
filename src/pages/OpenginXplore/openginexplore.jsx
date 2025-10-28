import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import {
  Binoculars,
  ChevronLeft,
  ChevronRight,
  Database,
  SearchIcon,
  SquareLibrary,
} from "lucide-react";
import XploreDataTab from "../../components/xploreData/XploreDataTab";
import YearRangeSelector from "../../components/Timeline";
import { useSelector } from "react-redux";

export default function OpenginXplore() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTab, setSelectedTab] = useState("xploreorg");

  const gazetteDateClassic = useSelector(
    (state) => state.gazettes.gazetteDataClassic
  );
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const presidents = useSelector((state) => state.presidency.presidentDict);

  const [latestPresStartDate, setLatestPresStartDate] = useState(new Date());
  const [userSelectedDateRange, setUserSelectedDateRange] = useState([
    null,
    null,
  ]);

  const handleDateRangeChange = useCallback((dateRange) => {
    const [startDate, endDate] = dateRange;
    setUserSelectedDateRange([startDate, endDate]);
  }, []);

    useEffect(() => {
      if (!presidents || presidents.length === 0 || !presidentRelationDict)
        return;
  
      const relationEntries = Object.entries(presidentRelationDict);
      if (relationEntries.length === 0) return;
  
      // Last relation
      const [lastPresId, lastRelation] =
        relationEntries[relationEntries.length - 1];
  
      if (lastPresId && lastRelation?.startTime) {
        // setLatestPresidentId(lastPresId);
        setLatestPresStartDate(new Date(lastRelation.startTime.split("T")[0]));
      }
    }, [presidents, presidentRelationDict]);

  const dates = gazetteDateClassic.map((d) => `${d}T00:00:00Z`);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between py-6 px-4 md:px-8 lg:px-12 border-b border-gray-700 bg-gray-900">
        <h2 className="text-lg font-bold text-sidebar-foreground flex justify-start items-center">
          {/* <Link href="/" className="flex items-center gap-2"> */}
          <Database className="w-5 lg:w-6 h-5 lg:h-6 flex-shrink-0 text-white mr-2" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-md">
            OpenGINXplore
          </span>
          {/* </Link> */}
        </h2>

      </div>
        

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`${
            isExpanded ? "w-64" : "w-16"
          } bg-gray-900 h-full transition-all duration-900 ease-in-out flex flex-col items-center p-2 border-r border-gray-700`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className=" px-3 py-1 rounded-md text-gray-200 mb-2"
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </button>

          <nav className="flex flex-col text-white w-full gap-1">
            <button
              className={`${
                selectedTab == "xploreorg" ? "bg-blue-950" : ""
              } hover:bg-blue-950 hover:cursor-pointer px-4 py-3 rounded-md transition-all ease-in-out duration-700 text-left flex`}
              onClick={() => setSelectedTab("xploreorg")}
            >
              <Binoculars className="mr-3 flex-shrink-0" size={24} />
              {isExpanded && "Organization"}
            </button>
            <button
              className={`${
                selectedTab == "xploredata" ? "bg-blue-950" : ""
              } hover:bg-blue-950 hover:cursor-pointer px-4 py-3 rounded-md transition-all ease-in-out duration-700 text-left flex`}
              onClick={() => setSelectedTab("xploredata")}
            >
              <SquareLibrary className="mr-3 flex-shrink-0" size={24} />
              {isExpanded && "Data"}
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-[#000B18]">
          <YearRangeSelector
          startYear={2019}
          dates={dates}
          latestPresStartDate={latestPresStartDate}
          onDateChange={handleDateRangeChange}
        />
          {selectedTab == "xploreorg" ? (
            <Navbar />
          ) : (
            selectedTab == "xploredata" && <XploreDataTab />
          )}
        </div>
      </div>
    </div>
  );
}
