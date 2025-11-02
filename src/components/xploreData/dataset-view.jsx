import { DataTable } from "./table-view";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import apiData from "../../services/xploredataServices";
import { ChartVisualization } from "./chart-visualization";
import { Eye } from "lucide-react";

export function DatasetView({ data, setExternalDateRange }) {
  const datasets = data;

  const [loadingDatasetId, setLoadingDatasetId] = useState(null);
  const [dataCache, setDataCache] = useState({});
  const [years, setYears] = useState([]);

  //  multi-year support
  const [multiYearMode, setMultiYearMode] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const [fetchedDatasets, setFetchedDatasets] = useState([]);

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

  // Checkbox handler
  const handleYearToggle = (year) => {
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
      console.log("datasets", datasets);
      let yearKeys = Object.keys(datasets).map(Number).sort((a, b) => a - b);
      console.log("yearKeys", yearKeys);
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
        <p className="text-gray-500 italic">Dataset not found</p>
      </div>
    );
  }

  // Get the first selected year for metadata display
  const firstSelectedYear = selectedYears[0];

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Dataset Info */}
      {years && years.length > 0 && firstSelectedYear && (
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-300">
            {datasets[firstSelectedYear]
              ? datasets[firstSelectedYear][0]?.nameExact
              : "Select a Dataset"}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-gray-400">
            <p>
              <span className="font-semibold">Published By : </span>{" "}
              {datasets[firstSelectedYear] ? datasets[firstSelectedYear][0]?.source : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Year selector - checkboxes for multi-year, chip for single year */}
      {multiYearMode ? (
        <div className="w-full flex justify-end flex-wrap gap-2">
          {years.map((year) => (
            <label
              key={year}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border transition cursor-pointer 
              ${selectedYears.includes(year)
                  ? "bg-blue-900 border-blue-500"
                  : "bg-gray-900 border-gray-700 hover:border-gray-500"
                }`}
            >
              <input
                type="checkbox"
                checked={selectedYears.includes(year)}
                onChange={() => handleYearToggle(year)}
              />
              <span className="text-gray-100">{year}</span>
            </label>
          ))}
        </div>
      ) : (
        years &&
        years.length === 1 && (
          <div className="w-full flex justify-end">
            <div className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100">
              {years[0]}
            </div>
          </div>
        )
      )}

      {/* Dataset Visualization */}
      <div className="border border-gray-700 rounded-md p-4 shadow-sm bg-gray-900">
        <div className="overflow-x-auto">
          {loadingDatasetId ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-400">
              <ClipLoader size={25} color="currentColor" />
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          ) : fetchedDatasets.length > 0 ? (
            <>
              {/* Unified chart for both single and multi-year */}
              <ChartVisualization
                columns={fetchedDatasets[0].data.columns}
                yearlyData={fetchedDatasets.map((d) => ({
                  year: d.year,
                  rows: d.data.rows,
                }))}
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
          ) : years && years.length === 0 && Object.keys(datasets).length > 0 ? (
            <div className="block justify-center items-center">
              <p className="text-gray-500 italic text-center">
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
                  className="flex text-blue-400 gap-2 cursor-pointer mt-2"
                  onClick={handleAvailableDatasetView}
                >
                  <Eye /> <span>Show me</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center">
              Select a year to view the dataset
            </p>
          )}
        </div>
      </div>
    </div>
  );
}