import { DataTable } from "./table-view";
import { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import { ChartVisualization } from "./chart-visualization";
import { Eye } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../../../context/themeContext";
import { useAvailableYearsForDataset } from "../../../hooks/useAvailableYearsForDataset";
import { useGetDatasetsByYears } from "../../../hooks/useGetDatasetsByYears";

export function DatasetView({ data, setExternalDateRange }) {
  console.log("look data", data);
  const location = useLocation();
  const { isDark } = useThemeContext();

  const [selectedYears, setSelectedYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);

  // fecth available years
  const { data: availableYearsData, isLoading: yearsLoading } =
    useAvailableYearsForDataset(data?.datasetIds ?? []);
  console.log("availableYearsData", availableYearsData);

  //map year to dataset id
  const yearToDatasetId = useMemo(() => {
    if (!availableYearsData?.years) return {};
    return Object.fromEntries(
      availableYearsData.years.map((y) => [y.year, y.datasetId])
    );
  }, [availableYearsData]);

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
  const { fetchedDatasets, loadingYear, isAnyLoading } = useGetDatasetsByYears(
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
        return typeof val === "number" || (!isNaN(val) && val !== "");
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
        <ClipLoader size={30} color={isDark ? "white" : "black"} />
      </div>
    );
  }

  const firstSelectedYear = selectedYears[0];

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* dataset info */}
      {filteredYears.length > 0 && (
        <div className="space-y-1 mt-2">
          <h2 className="text-xl md:text-2xl font-bold text-primary/85">
            {data?.name ?? "Dataset"}
          </h2>
        </div>
      )}

      {/* year selector */}
      {multiYearMode ? (
        <div className="w-full space-y-2">
          {!isPlottable && fetchedDatasets.length > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400/80 text-right">
              This dataset cannot be visualized. Showing table view only for one year.
            </p>
          )}
          <div className="flex justify-end flex-wrap gap-2">
            {filteredYears.map((year) => (
              <label
                key={year}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition cursor-pointer ${selectedYears.includes(year)
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
                <span className="text-primary/75">{year}</span>
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
      <div className="border border-border rounded-md p-4 shadow-sm bg-background relative">
        {loadingYear && (
          <div className="flex flex-col justify-center items-center z-50 rounded-md w-full">
            <ClipLoader size={25} color={isDark ? "white" : "black"} />
            {selectedYears.length > 1 ? (
              <p className="mt-2 mb-2 text-sm text-primary/75">
                Loading {loadingYear} data...
              </p>
            ) : (
              <p className="mt-2 text-sm text-primary/75">
                Loading {loadingYear} data...
              </p>
            )}
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
                <DataTable
                  columns={fetchedDatasets[0].data.columns}
                  rows={fetchedDatasets[0].data.rows}
                  title={`${data?.name} ${firstSelectedYear}`}
                />
              )}
            </>
          ) : (
            filteredYears.length === 0 &&
            allAvailableYears.length > 0 && (
              <div className="block justify-center items-center">
                <p className="text-primary/75 italic text-center">
                  No available data yet! But you have data for
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  {allAvailableYears.map((year) => (
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
                    <Eye />
                    <span>Show me</span>
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
