// import { ChartVisualization } from "./chart-visualization";
import { DataTable } from "./table-view";
import { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import apiData from "../../services/xploredataServices";
import { ChartVisualization } from "./chart-visualization";

export function DatasetView({ data }) {
  const dataset = data;

  const [loadingDatasetId, setLoadingDatasetId] = useState(null);
  const [selectDataset, setSelectedDataset] = useState(null);

  useEffect(() => {
    if (!dataset) return;
    const fetchData = async () => {
      try {
        setLoadingDatasetId(dataset.id);
        const response = await apiData.fetchDataset(dataset);
        setSelectedDataset(response.data);
      } catch (e) {
        console.error("Failed to fetch dataset : ", e);
      } finally {
        setLoadingDatasetId(null);
      }
    };
    fetchData();
  }, [dataset]);

  if (!dataset) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 italic">Dataset not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Dataset Info */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-300">
          {selectDataset?.attributeName}
        </h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-gray-400">
          <p>
            <span className="font-semibold">Published By :</span>{" "}
            {dataset.source}
          </p>
        </div>
      </div>

      <div className="border border-gray-700 rounded-xl p-4 shadow-sm bg-gray-900">
        <div className="overflow-x-auto">
          {loadingDatasetId ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-400">
              <ClipLoader size={25} color="currentColor" />
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          ) : (
            selectDataset && (
              <div className=" bg-gray-900">
                {/* <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Visualizations</h3>
                  </div> */}
                <div className="overflow-x-auto text-gray-500 text-sm italic">
                  <ChartVisualization
                    columns={selectDataset.columns}
                    rows={selectDataset.rows}
                  />
                </div>

                <DataTable
                  columns={selectDataset?.columns}
                  rows={selectDataset?.rows}
                  title={selectDataset?.attributeName}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
