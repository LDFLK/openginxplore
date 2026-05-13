import axios from "../lib/axios";

const SEARCH_URL = "/v1/search";
const DATA_URL = "/v1/data";

export const search = async ({ query, type, signal }) => {
  const params = { search_query: query };
  if (type) params.type = type;

  const { data } = await axios.get(SEARCH_URL, { params, signal });
  return data;
};

export const getDatasetCategories = async ({ datasetId, signal }) => {
  const { data } = await axios.get(
    `${DATA_URL}/datasets/${datasetId}/categories`,
    { signal }
  );
  return data;
};
