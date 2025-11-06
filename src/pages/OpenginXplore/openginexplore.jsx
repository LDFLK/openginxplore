import React, { useCallback, useEffect, useState } from "react";
import {
  Binoculars,
  BookOpenText,
  ChevronsLeft,
  ChevronsRight,
  MessageSquareHeart,
  SquareLibrary,
} from "lucide-react";
import XploreDataTab from "../../components/xploreData/XploreDataTab";
import YearRangeSelector from "../../components/Timeline";
import { useSelector } from "react-redux";
import Organization from "../../components/Organization";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import TextLogo from "../XploreGovHome/components/textLogo";
import ThemeToggle from "../../components/theme-toggle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShareLinkButton from "../../components/ShareLinkButton";

const feedbackFormUrl = window?.configs?.feedbackFormUrl
  ? window.configs.feedbackFormUrl
  : "/";

export default function OpenginXplore() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams();

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
  const [externalDateRange, setExternalDateRange] = useState([null, null]);

  const handleDateRangeChange = useCallback((dateRange) => {
    const [startDate, endDate] = dateRange;
    setUserSelectedDateRange([startDate, endDate]);
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

  const dates = gazetteDateClassic.map((d) => `${d}T00:00:00Z`);

  useEffect(() => {
    const isVisited = localStorage.getItem("OpenGINXploreVisit");

    if (!isVisited) {
      setTimeout(() => {
        const toastContent = (
          <div className="w-full">
            <p className="text-primary">
              <span className="font-semibold">
                📢 Welcome to OpenGIN Xplore!
              </span>{" "}
              This project is open source and evolving fast. Your feedback helps
              us make it better for everyone.
            </p>
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
    const params = new URLSearchParams(location.search);

    if (tabName === "organization") {
      params.delete("parentId");
      params.delete("datasetId");
      params.delete("datasetName");
      params.delete("breadcrumb");
    }
    if (tabName === "data") {
      params.delete("selectedDate");
      params.delete("filterByType");
      params.delete("viewMode");
      params.delete("ministry");
    }
    navigate({
      pathname: `/${tabName}`,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  return (
    <div className="flex">
      <ToastContainer
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
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 h-screen ${
          isExpanded ? "w-64" : "w-16"
        } bg-background h-full transition-all ease-in-out flex flex-col items-center p-2 border-r border-border`}
      >
        <TextLogo isExpanded={isExpanded} />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className=" px-3 py-1 rounded-md text-primary/80 hover:text-primary mb-2 cursor-pointer"
        >
          {isExpanded ? <ChevronsLeft /> : <ChevronsRight />}
        </button>

        <nav className="flex flex-col text-foreground w-full gap-1 relative top-0 h-screen">
          <button
            className={`${
              selectedTab === "organization"
                ? "bg-accent text-primary-foreground font-semibold"
                : "hover:bg-background-dark/85"
            }  hover:cursor-pointer px-4 py-3 rounded-md transition-all ease-in-out text-left flex`}
            onClick={() => handleTabChange("organization")}
          >
            <Binoculars className="mr-3 flex-shrink-0" size={24} />
            {isExpanded && "Organization"}
          </button>
          <button
            className={`${
              selectedTab === "data"
                ? "bg-accent text-primary-foreground font-semibold"
                : "hover:bg-background-dark/85"
            } hover:cursor-pointer px-4 py-3 rounded-md transition-all ease-in-out text-left flex`}
            onClick={() => handleTabChange("data")}
          >
            <SquareLibrary className="mr-3 flex-shrink-0" size={24} />
            {isExpanded && "Data"}
          </button>
          <Link to={feedbackFormUrl} target="_blank" rel="noopener noreferrer">
            <div className="flex absolute bottom-0 w-full gap-2 justify-center items-center px-3 py-2 rounded-md text-active-green/100 hover:text-active-green bg-active-green/10 hover:bg-active-green/15 border-active-green/15 hover:border-active-green/15 cursor-pointer border duration-1000 transition-all animation">
              <MessageSquareHeart size={22} />
              {isExpanded && <span>Share feedback</span>}
            </div>
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 overflow-auto bg-background-dark duration-500 transition-all animation ${
          isExpanded ? "ml-64" : "ml-16"
        } h-screen`}
      >
        {/* Header */}
        <div className="flex justify-end py-2 px-4 md:px-8 lg:px-12 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <Link
              to="/docs?file=information-pane"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex gap-2 justify-center items-center px-3 py-2 rounded-md text-accent/95 hover:text-accent bg-accent/5 hover:bg-accent/10 border-accent/10 hover:border-accent/15 cursor-pointer border">
                <BookOpenText size={22} />
                <span>Learn</span>
              </div>
            </Link>
            <ShareLinkButton />
            <ThemeToggle />
          </div>
        </div>
        <YearRangeSelector
          startYear={2019}
          dates={dates}
          latestPresStartDate={latestPresStartDate}
          onDateChange={handleDateRangeChange}
          externalRange={externalDateRange}
        />
        {selectedTab === "organization" ? (
          <>
            <Organization dateRange={userSelectedDateRange} />
          </>
        ) : selectedTab === "data" ? (
          <XploreDataTab setExternalDateRange={setExternalDateRange} />
        ) : (
          <div className="text-primary p-8">Tab not found: {selectedTab}</div>
        )}
      </div>
    </div>
  );
}
