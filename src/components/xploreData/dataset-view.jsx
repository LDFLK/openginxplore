import { DataTable } from "./table-view";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import apiData from "../../services/xploredataServices";
import { ChartVisualization } from "./chart-visualization";
import { Eye } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function DatasetView({ data, handleDateRangeChange }) {
  const datasets = data;

  const [loadingDatasetId, setLoadingDatasetId] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [dataCache, setDataCache] = useState({});
  const [years, setYears] = useState([]);

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
    setSelectedDataset(null);
    setYears(filteredYears);
  }, [datasets, window.location.search]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear || !datasets[selectedYear]) return;
      try {
        if (!Object.keys(dataCache).includes(selectedYear)) {
          setLoadingDatasetId(selectedYear);
          const response = await apiData.fetchDataset(
            datasets[selectedYear][0]
          );
          setSelectedDataset(response.data);
          setDataCache((prev) => ({
            ...prev,
            [selectedYear]: response.data,
          }));
        } else {
          setSelectedDataset(dataCache[selectedYear]);
        }
      } catch (e) {
        console.error("Failed to fetch dataset:", e);
      } finally {
        setLoadingDatasetId(null);
      }
    };

    fetchData();
  }, [selectedYear, datasets]);

  if (!datasets) {
    return (
      <div className="flex items-center justify-center h-full mt-4">
        <p className="text-gray-500 italic">Dataset not found</p>
      </div>
    );
  }

  const navigate = useNavigate();
  const location =  useLocation();
  const handleAvailableDatasetView = (datasets) => {

  try {
    const params = new URLSearchParams(location.search);

    let yearKeys = Object.keys(datasets).map(Number).sort((a, b) => a - b);

    params.set('startDate', `${yearKeys[0]}-01-01`);
    params.set('endDate', `${yearKeys[yearKeys.length - 1]}-12-31`);

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  } catch (e) {
    console.error("Can't update the new dates", e);
  }
};

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Dataset Info */}
      {years && years.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-300">
            {datasets[selectedYear]
              ? datasets[selectedYear][0]?.nameExact
              : "Select a Dataset"}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-gray-400">
            <p>
              <span className="font-semibold">Published By : </span>{" "}
              {datasets[selectedYear] ? datasets[selectedYear][0]?.source : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Year Selector */}
      {years && years.length > 0 && (
        <div className="w-full flex justify-end">
          <select
            className="w-2/9 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg px-3 py-2 
                   focus:outline-none 
                   hover:border-gray-500 transition"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="" hidden>
              Select Year
            </option>
            {years.map((year) => (
              <option
                key={year}
                value={year}
                className="bg-gray-900 text-gray-100"
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dataset Visualization */}
      <div className="border border-gray-700 rounded-md p-4 shadow-sm bg-gray-900">
        <div className="overflow-x-auto">
          {loadingDatasetId ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-400">
              <ClipLoader size={25} color="currentColor" />
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          ) : selectedDataset ? (
            <div className="bg-gray-900">
              <div className="overflow-x-auto text-gray-500 text-sm italic">
                <ChartVisualization
                  columns={selectedDataset.columns}
                  rows={selectedDataset.rows}
                />
              </div>
              <DataTable
                columns={selectedDataset.columns}
                rows={selectedDataset.rows}
                title={selectedDataset.attributeName}
              />
            </div>
          ) : years && years.length == 0 && Object.keys(datasets).length > 0 ? (
            <div className="block justify-center items-center">
              <p className="text-gray-500 italic text-center">
                No available data yet! But you have data for
              </p>
              <div className="flex justify-center gap-2 mt-2">
                {Object.keys(datasets).map((year) => {
                  return <button className="text-green-400/75">{year}</button>;
                })}
              </div>
              <div className="flex justify-center">
                <button
                  className=" flex text-blue-400 gap-2 cursor-pointer mt-2"
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
