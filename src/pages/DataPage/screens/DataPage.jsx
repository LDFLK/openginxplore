import { AlertCircle, Folder, Loader2, TableProperties } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../components/breadcrumb";
import formatText from "../../../utils/common_functions";
import { DatasetView } from "../components/dataset-view";
import { useDataCatalog } from "../../../hooks/useDataCatalog";

export default function DataPage({ setExternalDateRange }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [breadcrumbTrail, setBreadcrumbTrail] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loadingCardId, setLoadingCardId] = useState(null);

  // Clean up URL parameters that don't belong in the data route
  useEffect(() => {
    if (searchParams.has("filterByName")) {
      const params = new URLSearchParams(searchParams);
      params.delete("filterByName");
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [searchParams, location.pathname, navigate]);

  // Decode categoryIds from URL as an array
  const categoryIdsParam = searchParams.get("categoryIds") || "";
  let categoryIds = [];
  if (categoryIdsParam) {
    try {
      // searchParams.get already decodes once. No need for decodeURIComponent.
      categoryIds = JSON.parse(categoryIdsParam);
      if (!Array.isArray(categoryIds)) categoryIds = [categoryIds];
    } catch {
      categoryIds = [categoryIdsParam];
    }
  }

  const { data, isLoading, isError, error } = useDataCatalog(categoryIds);

  // Keep reference to previous data while loading
  const [displayData, setDisplayData] = useState(null);

  // 1. Sync breadcrumb from URL or set default
  useEffect(() => {
    const breadcrumbParam = searchParams.get("breadcrumb");
    if (breadcrumbParam) {
      try {
        const decoded = JSON.parse(breadcrumbParam);
        if (Array.isArray(decoded)) {
          setBreadcrumbTrail(decoded);
          return;
        }
      } catch {
        console.warn("Invalid breadcrumb in URL");
      }
    }

    // Default root breadcrumb if param is missing
    setBreadcrumbTrail([]);
  }, [searchParams]);

  // Update display data only when new data is fully loaded
  useEffect(() => {
    if (!isLoading && data) {
      setDisplayData(data);
      setLoadingCardId(null);
    }
  }, [isLoading, data]);

  // 3. Sync selectedDataset with URL
  useEffect(() => {
    const datasetName = searchParams.get("datasetName");
    if (!datasetName) {
      setSelectedDataset(null);
    } else if (displayData?.datasets) {
      const found = displayData.datasets.find((d) => d.name === datasetName);
      if (found) {
        setSelectedDataset(found);
      }
    }
  }, [searchParams, displayData]);

  const handleCategoryClick = (category) => {
    // Prevent clicking while loading
    if (isLoading) return;

    const categoryIdsArray = category.categoryIds; // full array
    const categoryName = category.name;
    const cardId = category.categoryIds.join("-");

    if (!breadcrumbTrail.find((b) => b.label === categoryName)) {
      setLoadingCardId(cardId);

      // 1. Prepare parents: Ensure the previous leaf now has its navigation data
      const updatedTrail = breadcrumbTrail.map((item, idx) => {
        if (idx === breadcrumbTrail.length - 1) {
          // This was the old leaf, now it needs its IDs before becoming a parent
          return { ...item, categoryIds: categoryIds };
        }
        return item;
      });

      // 2. Add the new leaf (label only, no redundant IDs)
      const newBreadcrumb = [
        ...updatedTrail,
        {
          label: formatText({ name: categoryName }) || "Category",
        },
      ];

      const jsonTrail = JSON.stringify(newBreadcrumb);
      setBreadcrumbTrail(newBreadcrumb);
      setLoadingCardId(cardId);

      const params = new URLSearchParams(window.location.search);
      params.set("categoryIds", JSON.stringify(categoryIdsArray));
      params.set("breadcrumb", jsonTrail);
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  const handleDatasetClick = (dataset) => {
    // Prevent clicking while loading
    if (isLoading) return;

    const datasetName = dataset.name || formatText({ name: dataset.name });

    if (!breadcrumbTrail.find((b) => b.label === datasetName)) {
      setLoadingCardId(datasetName);

      // 1. Prepare parents: Ensure the previous leaf (the category) has its navigation data
      const updatedTrail = breadcrumbTrail.map((item, idx) => {
        if (idx === breadcrumbTrail.length - 1) {
          return { ...item, categoryIds: categoryIds };
        }
        return item;
      });

      // 2. Add the new leaf (label only)
      const newBreadcrumb = [
        ...updatedTrail,
        {
          label: datasetName,
        },
      ];

      const jsonTrail = JSON.stringify(newBreadcrumb);
      setBreadcrumbTrail(newBreadcrumb);
      setLoadingCardId(datasetName);

      const params = new URLSearchParams(window.location.search);
      params.set("datasetName", datasetName);
      params.set("categoryIds", JSON.stringify(categoryIds));
      params.set("breadcrumb", jsonTrail);
      navigate(`${location.pathname}?${params.toString()}`);
    }

    setSelectedDataset(dataset);
  };

  const handleBreadcrumbClick = (index, item) => {
    if (index === -1) {
      navigate("/data");
      return;
    }

    const newTrail = breadcrumbTrail.slice(0, index + 1);
    const selectedItem = newTrail[index];

    // Clear states when navigating back
    setSelectedDataset(null);
    setLoadingCardId(null);

    const params = new URLSearchParams(window.location.search);

    if (selectedItem.categoryIds) {
      params.set("categoryIds", JSON.stringify(selectedItem.categoryIds));
    } else {
      params.delete("categoryIds");
    }

    if (selectedItem.datasetName) {
      params.set("datasetName", selectedItem.datasetName);
    } else {
      params.delete("datasetName");
    }

    // When we navigate TO an item, it becomes the new leaf. 
    // We should strip its data for the URL version to keep it clean.
    const trailForUrl = newTrail.map((item, i) => {
      if (i === newTrail.length - 1) {
        return { label: item.label };
      }
      return item;
    });

    setBreadcrumbTrail(newTrail);
    params.set("breadcrumb", JSON.stringify(trailForUrl));
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <div className="p-2 lg:p-4">
      {breadcrumbTrail.length > 0 && (
        <Breadcrumb
          items={breadcrumbTrail}
          onItemClick={handleBreadcrumbClick}
          setSelectedDatasets={() => setSelectedDataset(null)}
        />
      )}
      {isError && (
        <div className="mt-6 p-4 flex items-center justify-center text-primary/50 rounded-xl">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">
            {error?.message || "An unexpected error occurred while fetching the data."}
          </p>
        </div>

      )}

      {isLoading && !displayData && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-7 h-7 text-accent animate-spin mb-4" />
          <p className="text-primary/70 textsm md:text-md">
            Loading Data...
          </p>
        </div>
      )}

      {selectedDataset ? (
        <DatasetView
          data={selectedDataset}
          setExternalDateRange={setExternalDateRange}
        />
      ) : (
        <>
          {!isError && displayData?.categories?.length > 0 && (
            <>
              <h3 className="text-sm lg:text-lg font-semibold mt-2 mb-3 text-primary">
                Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
                {displayData.categories.map((item) => (
                  <motion.div
                    key={item.categoryIds.join("-")}
                    whileHover={!isLoading ? { y: -2, scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    onClick={() => handleCategoryClick(item)}
                    className={`bg-background shadow-2xs relative w-full  border border-border rounded-xl px-4 py-6 flex items-center justify-between transition ${isLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center">
                      <Folder className="text-accent" />
                      <p className="ml-2 md:ml-3 text-xs md:text-sm text-start text-primary">
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

          {!isError && displayData?.datasets?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm lg:text-lg font-semibold mb-3 text-primary">
                Datasets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2">
                {displayData.datasets.map((dataset) => (
                  <motion.div
                    key={dataset.name}
                    whileHover={!isLoading ? { y: -2, scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    onClick={() => handleDatasetClick(dataset)}
                    className={`shadow-2xs w-full border border-border rounded-xl px-4 py-6 flex items-center justify-between bg-dataset-card bg-background transition ${isLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center">
                      <TableProperties className="text-accent" />
                      <p className="ml-2 md:ml-3 text-xs md:text-sm text-start text-primary">
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
