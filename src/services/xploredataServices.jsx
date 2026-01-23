import axios from "axios";
import axiosInstance from "../lib/axios";

const apiUrlData = window?.configs?.apiUrlData ? window.configs.apiUrlData : "/"

const GI_SERVICE_URL = "/v1/data";

export const getDataCatalog = async ({ categoryIds = [], signal }) => {
  const { data } = await axiosInstance.post(
    `${GI_SERVICE_URL}/data-catalog`,
    { categoryIds },
    { signal }
  );
  return data;
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

export default { fetchDataset };
