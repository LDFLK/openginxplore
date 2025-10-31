import React, { useCallback, useEffect, useState } from "react";
import {
  Binoculars,
  ChevronLeft,
  ChevronRight,
  SquareLibrary,
} from "lucide-react";
import XploreDataTab from "../../components/xploreData/XploreDataTab";
import YearRangeSelector from "../../components/Timeline";
import { useSelector } from "react-redux";
import Organization from "../../components/Organization";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import TextLogo from "../XploreGovHome/components/textLogo";
import ThemeToggle from "../../components/theme-toggle";

export default function OpenginXplore() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams(); // Get the tab from URL

  const selectedTab = tab || "organization";

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
      setLatestPresStartDate(new Date(lastRelation.startTime.split("T")[0]));
    }
  }, [presidents, presidentRelationDict]);

  const dates = gazetteDateClassic.map((d) => `${d}T00:00:00Z`);

  const handleTabChange = (tabName) => {
    const currentParams = window.location.search;
    navigate(`/${tabName}${currentParams}`);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between py-6 px-4 md:px-8 lg:px-12 border-b border-border bg-background">
        <TextLogo />
        <ThemeToggle />
      </div>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`${
            isExpanded ? "w-64" : "w-16"
          } bg-background h-full transition-all ease-in-out flex flex-col items-center p-2 border-r border-border`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className=" px-3 py-1 rounded-md text-primary mb-2"
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </button>

          <nav className="flex flex-col text-foreground w-full gap-1">
            <button
              className={`${
                selectedTab === "organization"
                  ? "bg-accent text-background"
                  : ""
              } hover:bg-accent hover:cursor-pointer px-4 py-3 rounded-md transition-all ease-in-out text-left flex`}
              onClick={() => handleTabChange("organization")}
            >
              <Binoculars className="mr-3 flex-shrink-0" size={24} />
              {isExpanded && "Organization"}
            </button>
            <button
              className={`${
                selectedTab === "data" ? "bg-accent text-background" : ""
              } hover:bg-accent hover:cursor-pointer px-4 py-3 rounded-md transition-all ease-in-out text-left flex`}
              onClick={() => handleTabChange("data")}
            >
              <SquareLibrary className="mr-3 flex-shrink-0" size={24} />
              {isExpanded && "Data"}
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-background-dark">
          <YearRangeSelector
            startYear={2019}
            dates={dates}
            latestPresStartDate={latestPresStartDate}
            onDateChange={handleDateRangeChange}
          />
          {selectedTab === "organization" ? (
            <>
              <Organization dateRange={userSelectedDateRange} />
            </>
          ) : selectedTab === "data" ? (
            <XploreDataTab />
          ) : (
            <div className="text-primary p-8">Tab not found: {selectedTab}</div>
          )}
        </div>
      </div>
    </div>
  );
}
