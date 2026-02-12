import React, { useCallback, useEffect, useState } from "react";
import {
  Binoculars,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  MessageSquareHeart,
  SquareLibrary,
} from "lucide-react";
import DataPage from "../../DataPage/screens/DataPage";
import TimeRangeSelector from "../components/TimeRangeSelector";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TextLogo from "../../LandingPage/components/textLogo";
import Organization from "../../OrganizationPage/screens/Organization";
import ThemeToggle from "../../../components/theme-toggle";
import ShareLinkButton from "../../../components/ShareLinkButton";
import SearchBar from "../../../components/SearchBar";
import SearchPage from "../../SearchPage/screens/SearchPage";
import { toast, ToastContainer } from "react-toastify";
import SlFlag from "/sl_flag.png";

const feedbackFormUrl = window?.configs?.feedbackFormUrl
  ? window.configs.feedbackFormUrl
  : "/";

export default function HomePage() {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();
  const { tab } = useParams();

  const selectedTab = tab || "organization";

  const gazetteDateClassic = useSelector(
    (state) => state.gazettes.gazetteDataClassic
  );
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const presidents = useSelector((state) => state.presidency.presidentDict);

  const [latestPresStartDate, setLatestPresStartDate] = useState(null);
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

  useEffect(() => {
    if (!presidents || presidents.length === 0 || !presidentRelationDict)
      return;

    const relationEntries = Object.entries(presidentRelationDict);
    if (relationEntries.length === 0) return;

    const [lastPresId, lastRelation] =
      relationEntries[relationEntries.length - 1];

    if (lastPresId && lastRelation?.startTime) {
      setLatestPresStartDate(new Date(lastRelation.startTime.split("T")[0]));
    }
  }, [presidents, presidentRelationDict]);

  const dates =
    gazetteDateClassic && gazetteDateClassic.map((d) => `${d.date}T00:00:00Z`);

  useEffect(() => {
    const isVisited = localStorage.getItem("OpenGINXploreVisit");

    if (!isVisited) {
      setTimeout(() => {
        const toastContent = (
          <div className="w-full">
            <div className="text-primary max-w-prose">
              <p className="font-semibold">📢 Welcome to OpenGIN Xplore!</p>
              <p>
                This project is{" "}
                <Link to="https://github.com/LDFLK" target="_blank" rel="noopener noreferrer" className="text-accent">
                  Open Source
                </Link>{" "}
                and evolving fast. Your feedback helps us make it better for everyone.
              </p>
            </div>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <Link
                to={feedbackFormUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="cursor-pointer bg-accent text-primary-foreground border-none p-2 rounded-md">
                  <p>Share feedback</p>
                </div>
              </Link>
              <button
                onClick={() => toast.dismiss()}
                className="cursor-pointer bg-primary/25 border-none p-2 rounded-md text-primary"
              >
                Dismiss
              </button>
            </div>
          </div>
        );

        toast(toastContent, {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        });

        localStorage.setItem("OpenGINXploreVisit", true);
      }, 5000);
    }
  }, []);

  const handleTabChange = (tabName) => {
    const params = new URLSearchParams(window.location.search);

    // Common resets for all tab changes to ensure a fresh start
    // params.delete("startDate");
    // params.delete("endDate");
    params.delete("selectedDate");
    params.delete("filterByName");
    params.delete("filterByType");
    params.delete("ministry");
    params.delete("viewMode");

    if (tabName === "organization") {
      params.delete("categoryIds");
      params.delete("datasetId");
      params.delete("datasetName");
      params.delete("breadcrumb");
    }
    if (tabName === "data") {
      // Data-specific deletes (if any were not covered in common resets)
    }
    navigate({
      pathname: `/${tabName}`,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  return (
    <div className="flex">
      {/* <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName={() =>
          "bg-background text-foreground border border-border shadow-lg rounded-md p-4 w-full"
        }
        bodyClassName={() => "text-sm"}
        progressClassName="bg-primary"
      /> */}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 h-[100dvh] ${isExpanded ? "w-48 md:w-64" : "w-12 md:w-16"
          } bg-background transition-all ease-in-out flex flex-col items-center p-2 border-r border-border`}
      >
        <div className={`flex flex-col ${isExpanded ? "items-start w-full px-2 md:px-1" : "items-center"}`}>
          <TextLogo
            isExpanded={isExpanded}
            className={`text-md md:text-2xl font-semibold`}
          />
          {isExpanded && (
            <p className="text-primary/75 text-[12px] leading-tight transition-opacity duration-300">
              Powered by{" "}
              <a
                href="https://ldflk.github.io/OpenGIN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                OpenGIN
              </a>
            </p>
          )}
        </div>

        <nav className="flex flex-col text-foreground w-full gap-1 relative top-0 flex-1 mt-8">
          <button
            className={`text-xs md:text-sm ${selectedTab === "organization"
              ? "bg-accent text-primary-foreground font-semibold"
              : "hover:bg-background-dark/85"
              }  hover:cursor-pointer ${isExpanded ? "px-2 md:px-4" : "px-0"} py-2 md:py-3 rounded-md transition-all ease-in-out text-left flex items-center`}
            onClick={() => handleTabChange("organization")}
          >
            <Binoculars className={`${isExpanded ? "mr-2 md:mr-3" : "mx-auto"}`} />
            {isExpanded && "Organization"}
          </button>
          <button
            className={`text-xs md:text-sm ${selectedTab === "data"
              ? "bg-accent text-primary-foreground font-semibold"
              : "hover:bg-background-dark/85"
              } hover:cursor-pointer ${isExpanded ? "px-2 md:px-4" : "px-0"} py-2 md:py-3 rounded-md transition-all ease-in-out text-left flex items-center`}
            onClick={() => handleTabChange("data")}
          >
            <SquareLibrary className={`${isExpanded ? "mr-2 md:mr-3" : "mx-auto"}`} />
            {isExpanded && "Data"}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1 absolute ${isExpanded ? "bottom-17" : "bottom-12"} left-1/2 -translate-x-1/2 
             flex items-center rounded-md text-primary/80 hover:text-primary 
             cursor-pointer transition-all duration-300`}
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </button>
          <div className="absolute bottom-0 w-full flex flex-col items-center">
            <Link to={feedbackFormUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <div className="flex text-xs md:text-sm w-full gap-2 justify-center items-center md:px-3 px-1 py-1 md:py-2 rounded-md text-accent/95 hover:text-accent bg-accent/5 hover:bg-accent/10 border-accent/10 hover:border-accent/15 cursor-pointer border duration-1000 transition-all animation">
                <MessageSquareHeart size={22} />
                {isExpanded && <span>Share feedback</span>}
              </div>
            </Link>
            {isExpanded && (
              <p className="text-primary/75 text-[12px] mt-2 mb-0.5 text-center leading-tight">
                Licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  CC BY-NC-SA 4.0
                </a>
              </p>
            )}
          </div>
        </nav>
      </div>

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
          {latestPresStartDate && selectedTab !== "search" && (
            <TimeRangeSelector
              startYear={2019}
              dates={selectedTab === "organization" ? dates : []}
              latestPresStartDate={latestPresStartDate}
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
