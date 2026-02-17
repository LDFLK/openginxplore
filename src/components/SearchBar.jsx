import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { useDebounce } from "../hooks/useDebounce";
import { ENTITY_CONFIG } from "../constants/entityConfig";
import { handleResultNavigation } from "../utils/navigationUtils";

/**
 * Format category name from snake_case to Title Case
 */
const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Build dataset navigation URL from categories response
 */
const buildDatasetUrl = (datasetName, categories, year) => {
  // Filter to Category types only, reverse to get root → child order
  const categoryChain = categories
    .filter((c) => c.kind?.major === "Category")
    .reverse();

  if (categoryChain.length === 0) return "/data";

  const lastCategoryId = categoryChain[categoryChain.length - 1].id;

  // Build breadcrumb array
  const breadcrumb = categoryChain.map((cat) => ({
    label: formatCategoryName(cat.name),
    categoryIds: [cat.id],
  }));

  // Add dataset as final breadcrumb
  breadcrumb.push({
    label: datasetName,
  });

  // Build final URL
  const params = new URLSearchParams({
    categoryIds: JSON.stringify([lastCategoryId]),
    datasetName: datasetName,
    breadcrumb: JSON.stringify(breadcrumb),
  });

  if (year) {
    params.set("startDate", `${year}-01-01`);
    params.set("endDate", `${year}-12-31`);
  }

  return `/data?${params.toString()}`;
};

/**
 * Search input component for the header
 * Navigates to /search?q={query} on Enter
 */
export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loadingDatasetId, setLoadingDatasetId] = useState(null);

  const debouncedQuery = useDebounce(query, 1000);
  const { data, isLoading } = useSearch(debouncedQuery);

  useEffect(() => {
    const q = searchParams.get("q");
    const resultName = location.state?.searchResultName;

    // Only sync from URL query or nav state result name
    const newQuery = q || resultName || "";
    setQuery(newQuery);
  }, [searchParams, location.state]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Handle search form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 2) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  /**
   * Handle result card click - navigate based on entity type
   */
  const handleResultClick = (result) => {
    handleResultNavigation(result, {
      navigate,
      location,
      setLoadingDatasetId,
      buildDatasetUrl,
      onComplete: () => setIsOpen(false),
    });
  };

  const results = data?.results?.slice(0, 20) || [];

  return (
    <div ref={dropdownRef} className="flex-1 max-w-none md:max-w-xl ml-5 mr-1 md:mx-4 relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setIsOpen(true);

              // If user manually clears the search bar, remove search-related params from URL
              if (val === "") {
                const params = new URLSearchParams(window.location.search);
                params.delete("q");
                params.delete("filterByName");
                params.delete("datasetName");
                params.delete("selectedDate");

                navigate(
                  {
                    pathname: location.pathname,
                    search: params.toString() ? `?${params.toString()}` : "",
                  },
                  {
                    replace: true,
                    state: { ...location.state, searchResultName: undefined },
                  }
                );
              }
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-xs md:text-sm bg-background-dark border border-border rounded-md
                       text-primary placeholder:text-primary/50
                       focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
                       transition-colors"
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-1/2 -translate-x-1/3 md:translate-x-0 md:left-0 md:right-0 mt-2 bg-background border border-border rounded-lg shadow-xl z-[100] overflow-hidden max-h-[70vh] overflow-y-auto
                        w-[calc(100vw-10rem)] sm:w-[calc(100vw-10rem)] md:w-full min-w-[220px] max-w-[280px] md:max-w-none">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => {
                const config = ENTITY_CONFIG[result.type] || ENTITY_CONFIG.person;
                const Icon = config.icon;
                const isLoadingDataset = loadingDatasetId === result.id;

                return (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 hover:bg-accent/5 cursor-pointer transition-colors text-left"
                  >
                    <div className={`p-1 md:p-1.5 rounded ${config.bgColor}`}>
                      {isLoadingDataset ? (
                        <Loader2 className={`w-3 h-3 md:w-3.5 md:h-3.5 ${config.textColor} animate-spin`} />
                      ) : (
                        <Icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${config.textColor}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-primary truncate">
                        {result.name}
                      </p>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <p className="text-[9px] md:text-[10px] text-primary/50 uppercase tracking-wider">
                          {config.label}
                        </p>
                        {result.created && result.type === "dataset" && (
                          <span className="text-[9px] md:text-[10px] px-1 bg-primary/10 text-primary/70 rounded">
                            {new Date(result.created).getFullYear()}
                          </span>
                        )}
                        {(result.type === "cabinetMinister" || result.type === "stateMinister") && result.created && (
                          <span className="text-[9px] md:text-[10px] px-1 bg-primary/10 text-primary/70 rounded">
                            {result.created.split("T")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 text-xs text-center border-t border-border text-accent hover:bg-accent/5 transition-colors"
              >
                View all results for "{query}"
              </button>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-primary/50">No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
