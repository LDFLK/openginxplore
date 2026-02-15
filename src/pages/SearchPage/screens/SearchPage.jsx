import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useSearch } from "../../../hooks/useSearch";
import { getDatasetCategories } from "../../../services/searchServices";
import { ENTITY_CONFIG } from "../../../constants/entityConfig";
import { handleResultNavigation } from "../../../utils/navigationUtils";


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

  // Add dataset as final breadcrumb (leaf node, no redundant data)
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
 * Search results page component
 */
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = searchParams.get("q") || "";
  const [loadingDatasetId, setLoadingDatasetId] = useState(null);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const { data, isLoading, isError, error } = useSearch(query);

  const results = data?.results || [];

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = localQuery.trim();
    if (trimmedQuery.length >= 2) {
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
    });
  };

  // Empty query state - show search prompt
  if (!query || query.length < 2) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center py-8 md:py-12">
          <Search className="w-8 h-8 md:w-12 md:h-12 text-primary/30 mx-auto mb-4" />
          <h2 className="text-base md:text-xl font-semibold text-primary mb-2">
            Search OpenGINXplore
          </h2>
          <p className="text-xs md:text-sm text-primary/60 mb-6">
            Find persons, departments, ministries, and datasets
          </p>
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-primary/50" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Enter at least 2 characters..."
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-background border border-border rounded-lg
                           text-primary placeholder:text-primary/50
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                           transition-colors"
                autoFocus
              />
            </div>
            <p className="text-[10px] md:text-xs text-primary/40 mt-2">Press Enter to search</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 lg:p-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-3 md:mb-6">
        <h1 className="text-base md:text-xl font-semibold text-primary">
          Search results for "{query}"
        </h1>
        {data && (
          <p className="text-[10px] md:text-sm text-primary/60 mt-0.5 md:mt-1">
            Found {data.total || 0} result{data.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-sm text-primary/60">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-600">Search failed</p>
            <p className="text-xs text-red-500/80">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>
      )}

      {/* Empty Results */}
      {!isLoading && !isError && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-primary/20 mx-auto mb-3" />
          <p className="text-sm text-primary/60">No results found for "{query}"</p>
          <p className="text-xs text-primary/40 mt-1">Try different keywords</p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && !isError && results.length > 0 && (
        <div className="grid gap-2 md:gap-3">
          {results.map((result, index) => {
            const config = ENTITY_CONFIG[result.type] || ENTITY_CONFIG.person;
            const Icon = config.icon;
            const isLoadingDataset = loadingDatasetId === result.id;

            return (
              <div
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => !isLoadingDataset && handleResultClick(result)}
                className={`
                  flex items-start gap-2 md:gap-4 py-1.5 md:py-2.5 px-2 md:px-4
                  bg-background border border-border rounded-lg
                  hover:border-accent/50 hover:shadow-sm
                  transition-all cursor-pointer
                  ${isLoadingDataset ? "opacity-70 pointer-events-none" : ""}
                `}
              >
                {/* Icon */}
                <div className={`p-1 md:p-2 rounded-lg ${config.bgColor} flex-shrink-0 mt-0.5 md:mt-0`}>
                  {isLoadingDataset ? (
                    <Loader2 className={`w-3.5 h-3.5 md:w-5 md:h-5 ${config.textColor} animate-spin`} />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 md:w-5 md:h-5 ${config.textColor}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-0.5">
                    <span className={`text-[10px] md:text-xs font-medium ${config.textColor}`}>
                      {config.label}
                    </span>
                    {result.created && result.type === "dataset" && (
                      <span className="text-[10px] md:text-xs px-1 md:px-1.5 py-0.2 bg-primary/10 text-primary/70 rounded">
                        {new Date(result.created).getFullYear()}
                      </span>
                    )}
                    {(result.type === "stateMinister" || result.type === "cabinetMinister") && result.created && (
                      <span className="text-[10px] md:text-xs px-1 md:px-1.5 py-0.2 bg-primary/10 text-primary/70 rounded">
                        Start: {result.created.split("T")[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-medium text-primary leading-tight break-words">
                    {result.name}
                  </h3>
                  {result.parent_portfolio && (
                    <p className="text-[10px] md:text-xs text-primary/50 mt-0.5 break-words">
                      {result.parent_portfolio}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
