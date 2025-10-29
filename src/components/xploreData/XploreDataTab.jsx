import { Folder, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "./breadcrumb";
import formatText from "../../utils/common_functions";
import apiData from "./../../services/xploredataServices";
import { DatasetView } from "./dataset-view";

export default function XploreDataTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    categories: [],
    datasets: {},
  });

  const [categoriesByParentId, setCategoriesByParentId] = useState(new Map());
  const [datasetsByParentId, setDatasetsByParentId] = useState(new Map());
  const [breadcrumbTrail, setBreadcrumbTrail] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState(null);

  const [loadingCategoryId, setLoadingCategoryId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchCategoriesAndDatasets = async (parentId = "") => {
    try {
      const response = await apiData.fetchCategoriesAndDatasets(parentId);

      const { categories, datasets } = response;

      setCategoriesByParentId((prev) => {
        const newMap = new Map(prev);
        newMap.set(parentId, categories);
        return newMap;
      });

      if (datasets && Object.keys(datasets).length > 0) {
        const allDatasets = Object.values(datasets).flat();
        setDatasetsByParentId((prev) => {
          const newMap = new Map(prev);
          newMap.set(parentId, allDatasets);
          return newMap;
        });
      }

      return { categories, datasets };
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      return { categories: [], datasets: {} };
    }
  };

  useEffect(() => {
    const parentId = searchParams.get("parentId") || "";
    const breadcrumbParam = searchParams.get("breadcrumb");

    if (breadcrumbParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(breadcrumbParam));
        if (Array.isArray(decoded)) setBreadcrumbTrail(decoded);
      } catch {
        console.warn("Invalid breadcrumb in URL");
      }
    }

    const loadInitialData = async () => {
      setInitialLoading(true);

      const cachedCategories = categoriesByParentId.get(parentId);
      const cachedDatasets = datasetsByParentId.get(parentId);

      const normalizedDatasets = Array.isArray(cachedDatasets)
        ? cachedDatasets.reduce((acc, dataset) => {
            const year = new Date(dataset.created).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(dataset);
            return acc;
          }, {})
        : cachedDatasets || {};

      if (cachedCategories) {
        setData({
          categories: cachedCategories,
          datasets: normalizedDatasets,
        });
      } else {
        const { categories, datasets } = await fetchCategoriesAndDatasets(
          parentId
        );
        setData({ categories, datasets });
      }

      setInitialLoading(false);
    };

    loadInitialData();
  }, [searchParams]);

  const handleCategoryClick = async (categoryId, categoryName) => {
    try {
      setLoadingCategoryId(categoryId);

      if (
        !breadcrumbTrail.find(
          (breadcrumbItem) => breadcrumbItem.label == categoryName
        )
      ) {
        const newBreadcrumb = [
          ...breadcrumbTrail,
          {
            label: formatText({ name: categoryName }) || "Category",
            path: `/datasets?parentId=${categoryId}`,
          },
        ];

        const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));

        // navigate(`/datasets?parentId=${categoryId}&breadcrumb=${encodedTrail}`);
        setBreadcrumbTrail(newBreadcrumb);
      }

      const cachedCategories = categoriesByParentId.get(categoryId);
      const cachedDatasets = datasetsByParentId.get(categoryId);

      if (cachedCategories) {
        const normalizedDatasets = Array.isArray(cachedDatasets)
          ? cachedDatasets.reduce((acc, dataset) => {
              const year = new Date(dataset.created).getFullYear();
              if (!acc[year]) acc[year] = [];
              acc[year].push(dataset);
              return acc;
            }, {})
          : cachedDatasets || {};
        setData({
          categories: cachedCategories,
          datasets: normalizedDatasets,
        });
      } else {
        const { categories, datasets } = await fetchCategoriesAndDatasets(
          categoryId
        );
        setData({ categories, datasets });
      }
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    } finally {
      setLoadingCategoryId(null);
    }
  };

  const handleDatasetClick = () => {
    // const parentId = searchParams.get("parentId") || "";
    // const datasetName = dataset.nameExact || formatText({ name: dataset.name });

    setSelectedDatasets(data.datasets);

    // if (
    //   !breadcrumbTrail.find(
    //     (breadcrumbItem) => breadcrumbItem.label == datasetName
    //   )
    // ) {
    //   const newBreadcrumb = [
    //     ...breadcrumbTrail,
    //     {
    //       label: datasetName,
    //       path: `/datasets?datasetId=${dataset.id}&datasetName=${datasetName}&parentId=${parentId}`,
    //     },
    //   ];

    //   const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));

    //   setBreadcrumbTrail(newBreadcrumb);
    //   // navigate(
    //   //   `/datasets?datasetId=${dataset.id}&datasetName=${datasetName}&parentId=${parentId}&breadcrumb=${encodedTrail}`
    //   // );
    // }
  };

  const handleBreadcrumbClick = async (index, item) => {
    try {
      const newTrail = breadcrumbTrail.slice(0, index + 1);
      const encodedTrail = encodeURIComponent(JSON.stringify(newTrail));

      setBreadcrumbTrail(newTrail);

      const url = new URL(item.path, window.location.origin);
      const parentId = url.searchParams.get("parentId") || "";
      const datasetId = url.searchParams.get("datasetId");

      const newUrl =
        datasetId && parentId
          ? `/datasets?datasetId=${datasetId}&parentId=${parentId}&breadcrumb=${encodedTrail}`
          : parentId
          ? `/datasets?parentId=${parentId}&breadcrumb=${encodedTrail}`
          : `/datasets?breadcrumb=${encodedTrail}`;

      // navigate(newUrl);

      const cachedCategories = categoriesByParentId.get(parentId);
      const cachedDatasets = datasetsByParentId.get(parentId);

      const normalizedDatasets = Array.isArray(cachedDatasets)
        ? cachedDatasets.reduce((acc, dataset) => {
            const year = new Date(dataset.created).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(dataset);
            return acc;
          }, {})
        : cachedDatasets || {};

      if (cachedCategories) {
        setData({
          categories: cachedCategories,
          datasets: normalizedDatasets,
        });
      } else {
        const { categories, datasets } = await fetchCategoriesAndDatasets(
          parentId
        );
        setData({ categories, datasets });
      }
    } catch (err) {
      console.error("Failed to handle breadcrumb click:", err);
    }
  };

  const firstKey = data?.datasets ? Object.keys(data.datasets)[0] : null;
  const firstDataset =
    firstKey && data.datasets[firstKey] && data.datasets[firstKey].length > 0
      ? data.datasets[firstKey][0]
      : null;

  return (
    <div className="p-6">
      {breadcrumbTrail && breadcrumbTrail.length > 0 && (
        <Breadcrumb
          items={breadcrumbTrail}
          onItemClick={handleBreadcrumbClick}
          setSelectedDatasets={setSelectedDatasets}
        />
      )}
      <div className="">
        {initialLoading ? (
          <div className="text-gray-500 text-center py-10">Loading...</div>
        ) : selectedDatasets ? (
          <DatasetView data={selectedDatasets} />
        ) : (
          <>
            {data.categories && data.categories.length > 0 && (
              <>
                <h3 className="text-xl font-normal mt-6 mb-3 text-gray-100">
                  Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.categories.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryClick(item.id, item.name)}
                      className={`cursor-pointer w-full h-[100px] border border-gray-600 rounded-2xl p-4 flex items-center bg-category-card transition  hover:text-gray-900 ${
                        loadingCategoryId === item.id
                          ? "opacity-50 pointer-events-none"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      <Folder className="text-blue-400" />
                      <p className="ml-3 text-start text-gray-200">
                        {formatText({ name: item.name })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {data.datasets && Object.keys(data.datasets).length > 0 ? (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">
                  Datasets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {firstDataset && (
                    <motion.div
                      key={firstDataset.id}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDatasetClick}
                      className="cursor-pointer w-full h-[90px] border border-gray-600 rounded-xl p-4 flex items-center bg-dataset-card hover:bg-gray-800 transition"
                    >
                      <FileText className=" text-blue-400" />
                      <div className="ml-3 text-left">
                        <p className="font-medium  text-gray-100">
                          {firstDataset.nameExact ||
                            formatText({ name: firstDataset.name })}
                        </p>
                        {firstDataset.source && (
                          <p className="text-sm  text-gray-400">
                            {firstDataset.source}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              data.categories &&
              data.categories.length === 0 && (
                <p className="text-gray-500 text-center mt-10">
                  No categories or datasets found for this level.
                </p>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
