import axios from "../lib/axios";

const GI_SERVICE_URL = "/v1/data";

export const getDataCatalog = async ({ categoryIds = [], signal }) => {
  const { data } = await axios.post(
    `${GI_SERVICE_URL}/data-catalog`,
    { categoryIds },
    { signal }
  );
  return data;
};

export const getAvailableYearsForDataset = async ({ datasetIds = [], signal }) => {
  const { data } = await axios.post(
    `${GI_SERVICE_URL}/datasets/years`,
    { datasetIds },
    { signal }
  );
  return data;
};

export const getDatasetById = async ({ datasetId, signal }) => {
  const { data } = await axios.get(
    `${GI_SERVICE_URL}/datasets/${datasetId}/data`,
    { signal }
  );
  return data;
};

