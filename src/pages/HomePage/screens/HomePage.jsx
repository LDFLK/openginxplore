import React, { useCallback, useEffect, useState } from "react";
import {
  BookOpenText
} from "lucide-react";
import DataPage from "../../DataPage/screens/DataPage";
import TimeRangeSelector from "../components/TimeRangeSelector";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Organization from "../../OrganizationPage/screens/Organization";
import ThemeToggle from "../../../components/theme-toggle";
import ShareLinkButton from "../../../components/ShareLinkButton";
import SearchBar from "../../../components/SearchBar";
import SearchPage from "../../SearchPage/screens/SearchPage";
import SlFlag from "/sl_flag.png";
import SideBarComponent from "../../../components/sidebar";
import MeetingsTracker from "../../MeetingsTracker/screens/MeetingsTracker";

export default function HomePage() {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);

  const { tab } = useParams();

  const selectedTab = tab || "organization";

  const gazetteDateClassic = useSelector(
    (state) => state.gazettes.gazetteDataClassic
  );


  const [userSelectedDateRange, setUserSelectedDateRange] = useState([
    null,
    null,
  ]);
  const [externalDateRange, setExternalDateRange] = useState([null, null]);
  const [activePreset, setActivePreset] = useState(null);
  const [activePresident, setActivePresident] = useState("");

  const handleDateRangeChange = useCallback((dateRange) => {
    const [startDate, endDate] = dateRange;
    setUserSelectedDateRange([startDate, endDate]);
    setExternalDateRange([null, null]);
  }, []);

  const dates =
    gazetteDateClassic && gazetteDateClassic.map((d) => `${d.date}T00:00:00Z`);

  return (
    <div className="flex">

      {/* Sidebar */}
      <SideBarComponent isExpanded={isExpanded} setIsExpanded={setIsExpanded} selectedTab={selectedTab} />

      {/* Main content */}
      <div
        className={`flex-1 overflow-auto bg-background-dark transition-all ease-in-out animation ${isExpanded ? "ml-48 md:ml-64" : "ml-12 md:ml-16"
          } h-screen`}
      >
        {/* Header */}
        <div className="flex justify-between items-center py-1 md:py-2 px-2 md:px-4 border-b border-border bg-background">
          <div className="flex gap-2 justify-center items-center">
            <div className="w-[40px]">
              <img src={SlFlag} />
            </div>
            <h1 className="text-md xl:text-md font-semibold text-primary hidden md:block">
              Sri Lanka
            </h1>
          </div>
          <SearchBar />
          <div className="flex items-center gap-1 md:gap-2">
            <Link
              to="/docs?file=information-pane"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex gap-2 text-xs md:text-sm justify-center items-center px-2 md:px-3 py-1 md:py-2 rounded-md text-accent/95 hover:text-accent bg-accent/5 hover:bg-accent/10 border-accent/10 hover:border-accent/15 cursor-pointer border">
                <BookOpenText size={22} />
                <span className="hidden md:block">Learn</span>
              </div>
            </Link>
            <ShareLinkButton />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex md:hidden justify-center items-center text-yellow-500 bg-yellow-100/90 dark:bg-yellow-500/20 border-yellow-100/90 dark:border-yellow-500/20 border">
          <p className="text-xs md:text-sm text-center p-2">Use desktop for better experience!</p>
        </div>
        <div className="flex flex-col gap-4">
          {selectedTab !== "search" && selectedTab !== "meetingsTracker" && (
            <TimeRangeSelector
              startYear={2019}
              dates={selectedTab === "organization" ? dates : []}
              onDateChange={handleDateRangeChange}
              externalRange={externalDateRange}
              activePreset={activePreset}
              setActivePreset={setActivePreset}
              activePresident={activePresident}
              setActivePresident={setActivePresident}
            />
          )}

          {selectedTab === "organization" ? (
            <Organization dateRange={userSelectedDateRange} />
          ) : selectedTab === "data" ? (
            <DataPage setExternalDateRange={setExternalDateRange} />
          ) : selectedTab === "search" ? (
            <SearchPage />
          ) : selectedTab === "meetingsTracker" ? (
            <MeetingsTracker />
          ) : null}
        </div>
      </div>
    </div>
  );
}
