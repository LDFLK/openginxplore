import axios from "../lib/axios";

const SEARCH_URL = "/v1/search";
const DATA_URL = "/v1/data";

/**
 * Search across entities (persons, departments, ministries, datasets)
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query (min 2 characters)
 * @param {string} [params.type] - Filter by entity type (person, department, ministry, dataset)
 * @param {AbortSignal} [params.signal] - Abort signal for cancellation
 * @returns {Promise<Object>} Search results (all matching results)
 */
export const search = async ({ query, type, signal }) => {
  const params = { search_query: query };
  if (type) params.type = type;

  const { data } = await axios.get(SEARCH_URL, { params, signal });
  return data;
};

/**
 * Get category hierarchy for a dataset (used for navigation)
 * @param {Object} params - Parameters
 * @param {string} params.datasetId - Dataset ID
 * @param {AbortSignal} [params.signal] - Abort signal for cancellation
 * @returns {Promise<Object>} Dataset info with category hierarchy
 */
export const getDatasetCategories = async ({ datasetId, signal }) => {
  const { data } = await axios.get(
    `${DATA_URL}/datasets/${datasetId}/categories`,
    { signal }
  );
  return data;
};
