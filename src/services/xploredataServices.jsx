import axios from "axios";

// const apiUrlData = window?.configs?.apiUrlData ? window.configs.apiUrlData : "/"
// const apiUrlData = "https://aaf8ece1-3077-4a52-ab05-183a424f6d93-dev.e1-us-east-azure.choreoapis.dev/data-platform/gi-service/v1.0";
const apiUrlData = "http://localhost:8000";

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
