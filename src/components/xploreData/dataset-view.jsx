import { DataTable } from "./table-view";
import { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import apiData from "../../services/xploredataServices";
import { ChartVisualization } from "./chart-visualization";
import { Eye, EyeIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../../themeContext";

export function DatasetView({ data, setExternalDateRange }) {
  const datasets = data;

  const [loadingDatasetId, setLoadingDatasetId] = useState(null);
  const [dataCache, setDataCache] = useState({});
  const [years, setYears] = useState([]);

  //  multi-year support
  const [multiYearMode, setMultiYearMode] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const [fetchedDatasets, setFetchedDatasets] = useState([]);

  const location = useLocation();

  const { isDark } = useThemeContext();

  useEffect(() => {
    if (!datasets) return;

    const params = new URLSearchParams(window.location.search);
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    if (!startDate || !endDate) {
      console.warn("Missing startDate or endDate in URL params");
      return;
    }

    const startYear = startDate.split("-")[0];
    const endYear = endDate.split("-")[0];

    const filteredYears = Object.keys(datasets).filter(
      (year) => year >= startYear && year <= endYear
    );

    setYears(filteredYears);
    setMultiYearMode(filteredYears.length > 1);

    // Clear dataset when no years available
    if (filteredYears.length === 0) {
      setFetchedDatasets([]);
      setSelectedYears([]);
    }
  }, [datasets, window.location.search]);

  useEffect(() => {
    if (years.length > 0) {
      const sortedYears = [...years].sort((a, b) => Number(a) - Number(b));
      const latestYear = sortedYears[sortedYears.length - 1];
      setSelectedYears([latestYear]);
    } else {
      setSelectedYears([]);
      setFetchedDatasets([]);
    }
  }, [years]);

  // Unified dataset fetching for both single and multi-year
  useEffect(() => {
    const fetchData = async () => {
      if (selectedYears.length === 0) return;

      const all = [];
      for (const y of selectedYears) {
        if (!datasets[y]) continue;

        if (!dataCache[y]) {
          try {
            setLoadingDatasetId(y);
            const res = await apiData.fetchDataset(datasets[y][0]);
            setDataCache((prev) => ({ ...prev, [y]: res.data }));
            all.push({ year: y, data: res.data });
          } catch (e) {
            console.error(`Failed to fetch dataset for ${y}`, e);
          } finally {
            setLoadingDatasetId(null);
          }
        } else {
          all.push({ year: y, data: dataCache[y] });
        }
      }
      setFetchedDatasets(all);
      console.log("fetchedDatasets", all);
    };

    fetchData();
  }, [selectedYears, datasets]);

  // Stabilize columns reference - only change if actual columns change
  const stableColumns = useMemo(() => {
    if (fetchedDatasets.length === 0) return [];
    return fetchedDatasets[0].data.columns;
  }, [
    fetchedDatasets.length > 0 ? fetchedDatasets[0].data.columns.join(",") : "",
  ]);

  // Stabilize yearlyData reference
  const stableYearlyData = useMemo(() => {
    return fetchedDatasets.map((d) => ({
      year: d.year,
      rows: d.data.rows,
    }));
  }, [fetchedDatasets]);

  // Check if dataset is plottable (has numeric columns and string columns)
  const isPlottable = useMemo(() => {
    if (fetchedDatasets.length === 0) return false;

    const cols = fetchedDatasets[0].data.columns;
    const sampleRows = fetchedDatasets[0].data.rows;

    if (!sampleRows || sampleRows.length === 0 || !cols.length) return false;

    let hasNumeric = false;
    let hasString = false;

    cols.forEach((col, idx) => {
      const isNumeric = sampleRows.some((row) => {
        const val = row[idx];
        return (
          typeof val === "number" ||
          (!isNaN(Number(val)) && val !== null && val !== "")
        );
      });

      if (isNumeric && col !== "id") {
        hasNumeric = true;
      } else if (!isNumeric) {
        hasString = true;
      }
    });

    return hasNumeric && hasString;
  }, [fetchedDatasets]);

  // Checkbox handler
  const handleYearToggle = (year) => {
    // Prevent multi-year selection for unplottable datasets
    if (!isPlottable && !selectedYears.includes(year)) {
      // If trying to add a year to unplottable dataset, switch to that year only
      setSelectedYears([year]);
      return;
    }

    if (selectedYears.includes(year)) {
      // Prevent unchecking if it's the only one
      if (selectedYears.length === 1) return;
      setSelectedYears((prev) => prev.filter((y) => y !== year));
    } else {
      setSelectedYears((prev) => [...prev, year]);
    }
  };

  const handleAvailableDatasetView = () => {
    try {
      let yearKeys = Object.keys(datasets)
        .map(Number)
        .sort((a, b) => a - b);
      const start = new Date(`${yearKeys[0]}-01-01`);
      const end = new Date(`${yearKeys[yearKeys.length - 1]}-12-31`);
      setExternalDateRange([start, end]);
    } catch (e) {
      console.error("Can't update the new dates", e);
    }
  };

  if (!datasets) {
    return (
      <div className="flex items-center justify-center h-full mt-4">
        <p className="text-primary/85 italic">Dataset not found</p>
      </div>
    );
  }

  // Get the first selected year for metadata display
  const firstSelectedYear = selectedYears[0];

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Dataset Info */}
      {years && years.length > 0 && (
        <div className="space-y-1 mt-2">
          <h2 className="text-xl md:text-2xl font-bold text-primary/85">
            {datasets[firstSelectedYear]
              ? datasets[firstSelectedYear][0]?.nameExact
              : "Select a Dataset"}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-primary/75">
            {datasets[firstSelectedYear] &&
            datasets[firstSelectedYear][0].sourceType === "department" ? (
              <div className="flex items-center">
                <Link
                  to={`/department-profile/${datasets[firstSelectedYear][0]?.sourceId}`}
                  state={{
                    mode: "back",
                    from: location.pathname + location.search,
                  }}
                >
                  <span className="font-semibold text-primary/75">
                    Published By :{" "}
                  </span>{" "}
                  {datasets[firstSelectedYear]
                    ? datasets[firstSelectedYear][0]?.source
                    : "—"}
                </Link>
                <Link
                  to={`/department-profile/${datasets[firstSelectedYear][0]?.sourceId}`}
                  state={{
                    mode: "back",
                    from: location.pathname + location.search,
                  }}
                  className="ml-5 inline-flex items-center px-2 py-2 gap-2 text-sm rounded-lg bg-background text-active-green"
                  role="alert"
                >
                  <div>
                    <EyeIcon />
                  </div>
                  <span class="sr-only">Info</span>
                  <div>
                    <span class="font-medium">Explore History</span>
                  </div>
                </Link>
              </div>
            ) : (
              <p>
                <span className="font-semibold">Published By : </span>{" "}
                {datasets[firstSelectedYear]
                  ? datasets[firstSelectedYear][0]?.source
                  : "—"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Year selector - checkboxes for multi-year, chip for single year */}
      {multiYearMode ? (
        <div className="w-full space-y-2">
          {!isPlottable && fetchedDatasets.length > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400/80 text-right">
              This dataset cannot be visualized. Showing table view only for one
              year.
            </p>
          )}
          <div className="flex justify-end flex-wrap gap-2">
            {years.map((year) => (
              <label
                key={year}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition cursor-pointer 
                ${
                  selectedYears.includes(year)
                    ? "bg-background border-blue-500"
                    : "bg-background border-border hover:border-gray-500"
                }
                ${
                  !isPlottable && !selectedYears.includes(year)
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
                <span className="text-primary/75">{year}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        years &&
        years.length === 1 && (
          <div className="w-full flex justify-end">
            <div className="px-4 py-2 bg-background border border-border rounded-md text-primary/75">
              {years[0]}
            </div>
          </div>
        )
      )}

      {/* Dataset Visualization */}
      <div className="border border-border rounded-md p-4 shadow-sm bg-background relative">
        {/* Loading overlay - doesn't unmount the chart */}
        {loadingDatasetId && (
          <div className="flex flex-col justify-center items-center z-50 rounded-md w-full">
            <ClipLoader size={25} color={isDark ? "white" : "black"} />
            <p className="mt-2 text-sm text-primary/75">
              Loading {loadingDatasetId} data...
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          {fetchedDatasets.length > 0 ? (
            <>
              {/* Unified chart for both single and multi-year */}
              <ChartVisualization
                columns={stableColumns}
                yearlyData={stableYearlyData}
              />

              {/* Show table only if one year selected */}
              {selectedYears.length === 1 && (
                <DataTable
                  columns={fetchedDatasets[0].data.columns}
                  rows={fetchedDatasets[0].data.rows}
                  title={fetchedDatasets[0].data.attributeName}
                />
              )}
            </>
          ) : (
            years &&
            years.length === 0 &&
            Object.keys(datasets).length > 0 && (
              <div className="block justify-center items-center">
                <p className="text-primary/75 italic text-center">
                  No available data yet! But you have data for
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  {Object.keys(datasets).map((year) => (
                    <button key={year} className="text-green-400/75">
                      {year}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    className="flex text-accent/90 gap-2 cursor-pointer mt-2"
                    onClick={handleAvailableDatasetView}
                  >
                    <Eye /> <span>Show me</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
