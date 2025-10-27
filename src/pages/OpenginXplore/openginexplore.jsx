import React, { useState } from "react";
import Navbar from "../../components/NavBar";
import { Database, SearchIcon } from "lucide-react";

export default function OpenginXplore() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTab, setSelectedTab] = useState("xploreorg");

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between py-5 md:py-6 px-4 md:px-8 lg:px-12 border-b border-gray-700 bg-gray-900">
        <h2 className="text-lg font-bold text-sidebar-foreground flex justify-start items-center">
          {/* <Link href="/" className="flex items-center gap-2"> */}
          <Database className="w-5 lg:w-6 h-5 lg:h-6 flex-shrink-0 text-white mr-2" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-md lg:text-2xl">
            OpenginXplore
          </span>
          {/* </Link> */}
        </h2>
        <div className="w-full flex justify-end">
          <form
            // onSubmit={handleSearch}
            className="flex-1 max-w-2xl"
          >
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="DATA API.."
                className="w-3/5 pl-12 pr-4 py-3 rounded-full border border-gray-700 bg-input-background text-primary  placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`${
            isExpanded ? "w-64" : "w-16"
          } bg-gray-900 h-full transition-all duration-300 ease-in-out flex flex-col items-center py-4 border-r border-gray-700`}
        >
          {/* <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white text-red-400 px-3 py-1 rounded-md hover:bg-red-100"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button> */}

          <nav className="flex flex-col gap-2 text-white w-full px-2">
            <button
              className="hover:bg-blue-950 hover:cursor-pointer p-2 rounded-md text-left"
              onClick={() => setSelectedTab("xploreorg")}
            >
              {isExpanded ? "XploreOrg" : "D"}
            </button>
            <button
              className="hover:bg-blue-950 hover:cursor-pointer p-2 rounded-md text-left"
              onClick={() => setSelectedTab("xploredata")}
            >
              {isExpanded ? "XploreData" : "P"}
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {selectedTab == "xploreorg" ? (
            <Navbar />
          ) : (
            <>
              <p>xploredata</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
