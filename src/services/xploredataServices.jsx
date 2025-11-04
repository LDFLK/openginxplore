import axios from "axios";

const apiUrlData = window?.configs?.apiUrlData ? window.configs.apiUrlData : "/"
// const apiUrlData = "";

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
