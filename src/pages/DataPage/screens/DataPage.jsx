import { Folder, Loader2, TableProperties } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../components/breadcrumb";
import formatText from "../../../utils/common_functions";
import { DatasetView } from "../components/dataset-view";
import { useDataCatalog } from "../../../hooks/useDataCatalog";

export default function DataPage({ setExternalDateRange }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [breadcrumbTrail, setBreadcrumbTrail] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loadingCardId, setLoadingCardId] = useState(null);

  // Decode categoryIds from URL as an array
  const categoryIdsParam = searchParams.get("categoryIds") || "";
  let categoryIds = [];
  if (categoryIdsParam) {
    try {
      categoryIds = JSON.parse(decodeURIComponent(categoryIdsParam));
      if (!Array.isArray(categoryIds)) categoryIds = [categoryIds];
    } catch {
      categoryIds = [categoryIdsParam];
    }
  }

  const { data, isLoading } = useDataCatalog(categoryIds);

  // Keep reference to previous data while loading
  const [displayData, setDisplayData] = useState(null);

  // Initialize breadcrumb from URL or from first category
  useEffect(() => {
    const breadcrumbParam = searchParams.get("breadcrumb");
    if (breadcrumbParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(breadcrumbParam));
        if (Array.isArray(decoded)) setBreadcrumbTrail(decoded);
      } catch {
        console.warn("Invalid breadcrumb in URL");
      }
    } else if (data?.categories?.length && categoryIds.length) {
      const newBreadcrumb = [
        {
          label: formatText({ name: data.categories[0].name }) || "Category",
          path: `/datasets?categoryIds=${encodeURIComponent(
            JSON.stringify(categoryIds)
          )}`,
        },
      ];
      const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));
      setBreadcrumbTrail(newBreadcrumb);

      const params = new URLSearchParams(location.search);
      params.set("categoryIds", encodeURIComponent(JSON.stringify(categoryIds)));
      params.set("breadcrumb", encodedTrail);
      navigate(`${location.pathname}?${params.toString()}`);
    }
  }, [data, categoryIdsParam]);

  // Update display data only when new data is fully loaded
  useEffect(() => {
    if (!isLoading && data) {
      setDisplayData(data);
      setLoadingCardId(null);
    }
  }, [isLoading, data]);

  const handleCategoryClick = (category) => {
    // Prevent clicking while loading
    if (isLoading) return;

    const categoryIdsArray = category.categoryIds; // full array
    const categoryName = category.name;
    const cardId = category.categoryIds.join("-");

    if (!breadcrumbTrail.find((b) => b.label === categoryName)) {
      setLoadingCardId(cardId);
      const newBreadcrumb = [
        ...breadcrumbTrail,
        {
          label: formatText({ name: categoryName }) || "Category",
          path: `/datasets?categoryIds=${encodeURIComponent(
            JSON.stringify(categoryIdsArray)
          )}`,
        },
      ];

      const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));
      setBreadcrumbTrail(newBreadcrumb);

      const params = new URLSearchParams(location.search);
      params.set("categoryIds", encodeURIComponent(JSON.stringify(categoryIdsArray)));
      params.set("breadcrumb", encodedTrail);
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  const handleDatasetClick = (dataset) => {
    // Prevent clicking while loading
    if (isLoading) return;

    const datasetName = dataset.name || formatText({ name: dataset.name });

    if (!breadcrumbTrail.find((b) => b.label === datasetName)) {
      setLoadingCardId(datasetName);
      const newBreadcrumb = [
        ...breadcrumbTrail,
        {
          label: datasetName,
          path: `/datasets?datasetName=${datasetName}&categoryIds=${encodeURIComponent(
            JSON.stringify(categoryIds)
          )}`,
        },
      ];

      const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));
      setBreadcrumbTrail(newBreadcrumb);

      const params = new URLSearchParams(location.search);
      params.set("datasetName", datasetName);
      params.set("categoryIds", encodeURIComponent(JSON.stringify(categoryIds)));
      params.set("breadcrumb", encodedTrail);
      navigate(`${location.pathname}?${params.toString()}`);
    }

    setSelectedDataset(dataset);
  };

  const handleBreadcrumbClick = (index, item) => {
    const url = new URL(item.path, window.location.origin);
    const newTrail = breadcrumbTrail.slice(0, index + 1);
    const encodedTrail = encodeURIComponent(JSON.stringify(newTrail));
    setBreadcrumbTrail(newTrail);

    // Clear states when navigating back
    setSelectedDataset(null);
    setLoadingCardId(null);

    const params = new URLSearchParams(location.search);
    const pidParam = url.searchParams.get("categoryIds");
    const datasetName = url.searchParams.get("datasetName");

    if (pidParam) {
      try {
        const decodedPid = JSON.parse(decodeURIComponent(pidParam));
        params.set("categoryIds", encodeURIComponent(JSON.stringify(decodedPid)));
      } catch {
        params.set("categoryIds", pidParam);
      }
    } else {
      params.delete("categoryIds");
    }

    if (datasetName) params.set("datasetName", datasetName);
    else params.delete("datasetName");

    params.set("breadcrumb", encodedTrail);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <div className="p-6">
      {breadcrumbTrail.length > 0 && (
        <Breadcrumb
          items={breadcrumbTrail}
          onItemClick={handleBreadcrumbClick}
          setSelectedDatasets={() => setSelectedDataset(null)}
        />
      )}

      {selectedDataset ? (
        <DatasetView
          data={selectedDataset}
          setExternalDateRange={setExternalDateRange}
        />
      ) : (
        <>
          {displayData?.categories?.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mt-6 mb-3 text-primary">
                Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {displayData.categories.map((item) => (
                  <motion.div
                    key={item.categoryIds.join("-")}
                    whileHover={!isLoading ? { y: -2, scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    onClick={() => handleCategoryClick(item)}
                    className={`bg-background shadow-2xs relative w-full h-[100px] border border-border rounded-2xl p-4 flex items-center justify-between transition ${isLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:bg-border/10"
                      }`}
                  >
                    <div className="flex items-center">
                      <Folder className="text-accent" />
                      <p className="ml-3 text-start text-primary">
                        {formatText({ name: item.name })}
                      </p>
                    </div>
                    {loadingCardId === item.categoryIds.join("-") && (
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {displayData?.datasets?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Datasets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayData.datasets.map((dataset) => (
                  <motion.div
                    key={dataset.name}
                    whileHover={!isLoading ? { y: -2, scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    onClick={() => handleDatasetClick(dataset)}
                    className={`shadow-2xs w-full h-[90px] border border-border rounded-2xl p-4 flex items-center justify-between bg-dataset-card bg-background transition ${isLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center">
                      <TableProperties className="text-accent" />
                      <p className="ml-3 text-start text-primary">
                        {dataset.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {displayData?.categories?.length === 0 && displayData?.datasets?.length === 0 && (
            <p className="text-primary/75 text-center mt-10">
              No categories or datasets found for this level.
            </p>
          )}
        </>
      )}
    </div>
  );
}
