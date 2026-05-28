import { Link, useNavigate } from "react-router-dom";
import {
    Binoculars,
    ChevronLeft,
    ChevronRight,
    MessageSquareHeart,
    SquareLibrary,
    Speech
} from "lucide-react";
import TextLogo from "./textLogo"

const feedbackFormUrl = window?.configs?.feedbackFormUrl
    ? window.configs.feedbackFormUrl
    : "/";

export default function SideBarComponent({ isExpanded, setIsExpanded, selectedTab }) {

    const navigate = useNavigate()

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
                    className={`text-xs md:text-sm ${selectedTab === "meetingsTracker"
                        ? "bg-accent text-primary-foreground font-semibold"
                        : "hover:bg-background-dark/85"
                        } hover:cursor-pointer ${isExpanded ? "px-2 md:px-4" : "px-0"} py-2 md:py-3 rounded-md transition-all ease-in-out text-left flex items-center`}
                    onClick={() => handleTabChange("meetingsTracker")}
                >
                    <Speech className={`${isExpanded ? "mr-2 md:mr-3" : "mx-auto"}`} />
                    {isExpanded && "Meetings Tracker"}
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
    )
}