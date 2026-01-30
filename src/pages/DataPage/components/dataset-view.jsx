import { DataTable } from "./table-view";
import { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import { ChartVisualization } from "./chart-visualization";
import { AlertCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../../../context/themeContext";
import { useAvailableYearsForDataset } from "../../../hooks/useAvailableYearsForDataset";
import { useGetDatasetsByYears } from "../../../hooks/useGetDatasetsByYears";
import { useRootOrganizations } from "../../../hooks/useRootOrganizations";

export function DatasetView({ data, setExternalDateRange }) {
  const location = useLocation();
  const { isDark } = useThemeContext();

  const [selectedYears, setSelectedYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);

  // fecth available years
  const { data: availableYearsData, isLoading: yearsLoading, isError: isYearsError, error: yearsError } =
    useAvailableYearsForDataset(data?.datasetIds ?? []);

  //map year to dataset id
  const yearToDatasetId = useMemo(() => {
    if (!availableYearsData?.years) return {};
    return Object.fromEntries(
      availableYearsData.years.map((y) => [y.year, y.datasetId])
    );
  }, [availableYearsData]);

  // fetch root organization for all selected years
  const selectedDatasetIds = useMemo(() => {
    return selectedYears.map(year => yearToDatasetId[year]).filter(Boolean);
  }, [selectedYears, yearToDatasetId]);

  // Fetch organization data for all selected datasets in parallel
  const { data: organizationsData, isError: isOrgErrorReal } = useRootOrganizations(selectedDatasetIds);
  const isOrgError = true; // Forced for testing

  // Map organizations to years and check if all names are the same
  const organizationsByYear = useMemo(() => {
    const orgs = {};
    selectedYears.forEach((year, index) => {
      const orgData = organizationsData[index];
      if (orgData) {
        orgs[year] = orgData;
      }
    });
    return orgs;
  }, [selectedYears, organizationsData]);

  const displayOrganizations = useMemo(() => {
    const orgList = Object.entries(organizationsByYear);
    if (orgList.length === 0) return null;

    // Check if all organization names are the same
    const allNames = orgList.map(([_, org]) => org.name);
    const uniqueNames = [...new Set(allNames)];

    if (uniqueNames.length === 1) {
      // All names are the same, show one
      return { type: 'single', data: orgList[0][1] };
    } else {
      // Different names, show with year labels
      return { type: 'multiple', data: orgList.map(([year, org]) => ({ year, ...org })) };
    }
  }, [organizationsByYear]);

  const allAvailableYears = useMemo(() => {
    return Object.keys(yearToDatasetId).sort((a, b) => Number(a) - Number(b));
  }, [yearToDatasetId]);

  // filter years by date range
  useEffect(() => {
    if (allAvailableYears.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    if (!startDate || !endDate) {
      console.warn("Missing startDate or endDate in URL params");
      setFilteredYears(allAvailableYears);
      return;
    }

    const startYear = startDate.split("-")[0];
    const endYear = endDate.split("-")[0];

    const yearsInRange = allAvailableYears.filter(
      (year) => year >= startYear && year <= endYear
    );

    setFilteredYears(yearsInRange);

    // Clear selection when no years in range
    if (yearsInRange.length === 0) {
      setSelectedYears([]);
    }
  }, [allAvailableYears, window.location.search]);

  const multiYearMode = filteredYears.length > 1;

  // default year
  useEffect(() => {
    if (filteredYears.length > 0) {
      setSelectedYears([filteredYears[filteredYears.length - 1]]);
    } else {
      setSelectedYears([]);
    }
  }, [filteredYears]);

  // fetch datasets per year
  const { fetchedDatasets, loadingYear, isAnyLoading, isError: isContentError, error: contentError } = useGetDatasetsByYears(
    selectedYears,
    yearToDatasetId
  );

  // stabilize columns
  const stableColumns = useMemo(() => {
    if (fetchedDatasets.length === 0) return [];
    return fetchedDatasets[0].data.columns;
  }, [fetchedDatasets.length > 0 ? fetchedDatasets[0].data.columns.join(",") : ""]);

  const stableYearlyData = useMemo(() => {
    return fetchedDatasets.map((d) => ({
      year: d.year,
      rows: d.data.rows,
      columns: d.data.columns,
    }));
  }, [fetchedDatasets]);

  //check plottability
  const isPlottable = useMemo(() => {
    if (fetchedDatasets.length === 0) return false;
    const { columns, rows } = fetchedDatasets[0].data;
    if (!rows?.length || !columns?.length) return false;

    return columns.some((col, idx) => {
      if (col === "id") return false;
      return rows.some((row) => {
        const val = row[idx];
        return typeof val === "number" || (val != null && val !== '' && !isNaN(Number(val)));
      });
    });
  }, [fetchedDatasets]);

  // year toggle
  const handleYearToggle = (year) => {
    if (!isPlottable && !selectedYears.includes(year)) {
      setSelectedYears([year]);
      return;
    }

    if (selectedYears.includes(year)) {
      if (selectedYears.length === 1) return;
      setSelectedYears((prev) => prev.filter((y) => y !== year));
    } else {
      setSelectedYears((prev) => [...prev, year]);
    }
  };

  // show all available years
  const handleAvailableDatasetView = () => {
    try {
      const sortedYears = allAvailableYears.map(Number).sort((a, b) => a - b);
      const start = new Date(`${sortedYears[0]}-01-01`);
      const end = new Date(`${sortedYears[sortedYears.length - 1]}-12-31`);
      setExternalDateRange([start, end]);
    } catch (e) {
      console.error("Can't update date range", e);
    }
  };

  if (yearsLoading) {
    return (
      <div className="flex justify-center mt-10">
        <ClipLoader size={20} color={isDark ? "white" : "black"} />
      </div>
    );
  }

  if (isYearsError) {
    return (
      <div className="p-6">
        <div className="p-4 flex items-center justify-center text-primary/50 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">
            {yearsError?.message || "Failed to load available years for this dataset."}
          </p>
        </div>
      </div>
    );
  }

  const firstSelectedYear = selectedYears[0];

  return (
    <div className="space-y-3 w-full">
      {/* dataset info */}
      {filteredYears.length > 0 && (
        <div className="space-y-1 mt-2 md:mt-5">
          <h2 className="text-md md:text-xl font-semibold text-primary/85">
            {data?.name ?? "Dataset"}
          </h2>
        </div>
      )}

      {/* year selector */}
      {multiYearMode ? (
        <div className="w-full">
          {!isPlottable && fetchedDatasets.length > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400/80 text-center lg:text-right mb-2">
              This dataset cannot be visualized. Showing table view only for one year.
            </p>
          )}
          <div className="flex justify-end flex-wrap gap-1 lg:gap-2">
            {filteredYears.map((year) => (
              <label
                key={year}
                className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 rounded-md border transition cursor-pointer ${selectedYears.includes(year)
                  ? "bg-background border-blue-500"
                  : "bg-background border-border hover:border-gray-500"
                  } ${!isPlottable && !selectedYears.includes(year)
                    ? "opacity-50"
                    : ""
                  }`}
                title={
                  !isPlottable && !selectedYears.includes(year)
                    ? "Only one year can be viewed at a time for this dataset"
                    : ""
                }
              >
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => handleYearToggle(year)}
                />
                <span className="text-primary/75 text-xs md:text-sm">{year}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        filteredYears.length === 1 && (
          <div className="w-full flex justify-end">
            <div className="px-4 py-2 bg-background border border-border rounded-md text-primary/75">
              {filteredYears[0]}
            </div>
          </div>
        )
      )}

      {/* visualization */}
      <div className="border border-border rounded-lg p-1 md:p-2 shadow-sm bg-background relative mt-2">
        {loadingYear && (
          <div className="flex flex-col justify-center items-center z-50 rounded-md w-full">
            <ClipLoader size={25} color={isDark ? "white" : "black"} />
            {selectedYears.length > 1 ? (
              <p className="mt-2 mb-2 text-xs md:text-sm text-primary/75">
                Loading {loadingYear} data...
              </p>
            ) : (
              <p className="mt-2 text-xs md:text-sm text-primary/75">
                Loading {loadingYear} data...
              </p>
            )}
          </div>
        )}

        {isContentError && (
          <div className="flex items-center justify-center text-primary/50 rounded-xl my-4">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">
              {contentError?.message || "Failed to load dataset content."}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          {fetchedDatasets.length > 0 ? (
            <>
              <ChartVisualization
                columns={stableColumns}
                yearlyData={stableYearlyData}
              />
              {selectedYears.length === 1 && (
                <>
                  <DataTable
                    columns={fetchedDatasets[0].data.columns}
                    rows={fetchedDatasets[0].data.rows}
                    title={`${data?.name} ${firstSelectedYear}`}
                  />

                </>
              )}
            </>
          ) : (
            filteredYears.length === 0 &&
            allAvailableYears.length > 0 && !loadingYear && (
              <div className="block justify-center items-center p-2">
                <p className="text-primary/75 italic text-center text-xs md:text-sm">
                  No available data yet! You can find data for the following years:
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  {allAvailableYears.map((year) => (
                    <button key={year} className="text-green-400/75 text-xs md:text-sm">
                      {year}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    className="flex text-accent/90 gap-2 cursor-pointer mt-2 text-xs md:text-sm"
                    onClick={handleAvailableDatasetView}
                  >
                    <span>Show me</span>
                  </button>
                </div>
              </div>
            )
          )}

          {(displayOrganizations || isOrgError) && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border">
              <div className="text-sm text-primary/75">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-xs md:text-sm">Published by: </span>
                  {isOrgError && !displayOrganizations && (
                    <span className="text-primary/50 font-medium flex items-center gap-1">
                      No publisher found
                    </span>
                  )}
                  {displayOrganizations && displayOrganizations.type === 'single' && (
                    displayOrganizations.data.type === "department" ? (
                      <Link
                        to={`/department-profile/${displayOrganizations.data.id}`}
                        state={{
                          mode: "back",
                          from: location.pathname + location.search,
                        }}
                        className="text-accent hover:underline text-xs md:text-sm"
                      >
                        {displayOrganizations.data.name}
                      </Link>
                    ) : (
                      <span className="text-xs md:text-sm">{displayOrganizations.data.name}</span>
                    )
                  )}
                </div>

                {displayOrganizations && displayOrganizations.type === 'multiple' && (
                  <div className="mt-2 space-y-1">
                    {displayOrganizations.data.map((org) => (
                      <div key={org.year} className="flex gap-2">
                        <span className="font-medium min-w-[40px]">{org.year}:</span>
                        {org.type === "department" ? (
                          <Link
                            to={`/department-profile/${org.id}`}
                            state={{
                              mode: "back",
                              from: location.pathname + location.search,
                            }}
                            className="text-accent hover:underline text-xs md:text-sm"
                          >
                            {org.name}
                          </Link>
                        ) : (
                          <span className="text-xs md:text-sm">{org.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to={window?.configs?.dataSources ? window.configs.dataSources : "/"}
                target="_blank"
                className="text-xs md:text-sm text-accent hover:underline mt-3"
              >
                See sources
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
