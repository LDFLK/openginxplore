import axios from "axios";
import axiosInstance from "../lib/axios";

const apiUrlData = window?.configs?.apiUrlData ? window.configs.apiUrlData : "/"

// const apiUrlData = "";

const GI_SERVICE_URL = "/v1/data";

export const getDataCatalog = async ({ categoryIds = [], signal }) => {
  const { data } = await axiosInstance.post(
    `${GI_SERVICE_URL}/data-catalog`,
    { categoryIds },
    { signal }
  );
  return data;
};

const fetchCategoriesAndDatasets = async (parentId = "") => {
  try {
    const url =
      parentId === ""
        ? `${apiUrlData}/categories`
        : `${apiUrlData}/categories?id=${parentId}`;
    const response = await axios.get(url, {
      headers: { "Content-Type": "application/json" },
    });

    const { categories, datasets } = response.data;
    return { categories, datasets };
  } catch (e) {
    console.error("Failed to fetch categories:", e);
    return { categories: [], datasets: {} };
  }
};

const fetchDataset = async (dataset) => {
  try {
    const response = await axios.post(
      `${apiUrlData}/data/attribute/${dataset.parentId}`,

      {
        nameCode: dataset.name,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (e) {
    console.error("Failed to fetch dataset : ", e);
  }
};

export default { fetchCategoriesAndDatasets, fetchDataset };
