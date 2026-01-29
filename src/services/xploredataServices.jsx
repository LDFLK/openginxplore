import axios from "../lib/axios";

const GI_SERVICE_URL = "/v1/data";

export const getDataCatalog = async ({ categoryIds = [], signal }) => {
  try {
    const { data } = await axios.post(
      `${GI_SERVICE_URL}/data-catalog`,
      { categoryIds },
      { signal }
    );
    return data;
  } catch (error) {
    if (error.name === 'CanceledError') throw error;
    throw new Error("An unexpected error occurred while fetching the data.");
  }
};


export const getAvailableYearsForDataset = async ({ datasetIds = [], signal }) => {
  try {
    const { data } = await axios.post(
      `${GI_SERVICE_URL}/datasets/years`,
      { datasetIds },
      { signal }
    );
    return data;
  } catch (error) {
    if (error.name === 'CanceledError') throw error;
    throw new Error("Failed to load available years for the selected dataset.");
  }
};

export const getDatasetById = async ({ datasetId, signal }) => {
  try {
    const { data } = await axios.get(
      `${GI_SERVICE_URL}/datasets/${datasetId}/data`,
      { signal }
    );
    return data;
  } catch (error) {
    if (error.name === 'CanceledError') throw error;
    throw new Error("Failed to load dataset content. Please try again later.");
  }
};

export const getRootOrganization = async ({ datasetId, signal }) => {
  try {
    const { data } = await axios.get(
      `${GI_SERVICE_URL}/datasets/${datasetId}/root`,
      { signal }
    );
    return data;
  } catch (error) {
    if (error.name === 'CanceledError') throw error;
    throw new Error("Failed to load publisher information.");
  }
};
