import { getDatasetCategories } from "../services/searchServices";

/**
 * Shared logic for handling a search result click.
 * Ensures consistent navigation across SearchBar and SearchPage.
 * 
 * @param {Object} result - The search result entity
 * @param {Object} options - Navigation options
 * @param {Function} options.navigate - React Router navigate function
 * @param {Object} options.location - React Router location object
 * @param {Function} options.setLoadingDatasetId - Function to set currently loading dataset ID
 * @param {Function} [options.buildDatasetUrl] - Function to build dataset URL (if specific to component)
 * @param {Function} [options.onComplete] - Callback after completion (e.g. to close dropdown)
 */
export const handleResultNavigation = async (result, {
    navigate,
    location,
    setLoadingDatasetId,
    buildDatasetUrl,
    onComplete
}) => {
    if (onComplete) onComplete();

    const returnPath = location.pathname + location.search;

    switch (result.type) {
        case "person":
            navigate(`/person-profile/${result.id}`, {
                state: { from: returnPath },
            });
            break;

        case "department":
            navigate(`/department-profile/${result.id}`, {
                state: { from: returnPath },
            });
            break;

        case "ministry":
        case "minister": {
            // Build URL with proper date context for ministry/minister search
            const params = new URLSearchParams();

            // Use term_start date if available, otherwise use current date
            const selectedDate = result.term_start
                ? result.term_start.split("T")[0]
                : new Date().toISOString().split("T")[0];

            // Set date range (1 year before selected date to now)
            const endDate = new Date().toISOString().split("T")[0];
            const startDateObj = new Date(selectedDate);
            startDateObj.setFullYear(startDateObj.getFullYear() - 1);
            const startDate = startDateObj.toISOString().split("T")[0];

            params.set("startDate", startDate);
            params.set("endDate", endDate);
            params.set("filterByType", "all");
            params.set("viewMode", "Grid");
            params.set("selectedDate", selectedDate);
            params.set("filterByName", result.name);

            navigate(`/organization?${params.toString()}`);
            break;
        }

        case "dataset":
            if (setLoadingDatasetId) setLoadingDatasetId(result.id);
            try {
                const response = await getDatasetCategories({ datasetId: result.id });
                const url = buildDatasetUrl
                    ? buildDatasetUrl(result.name, response.categories || [])
                    : "/data";
                navigate(url);
            } catch (err) {
                console.error("Failed to fetch dataset categories:", err);
                navigate("/data");
            } finally {
                if (setLoadingDatasetId) setLoadingDatasetId(null);
            }
            break;

        default:
            break;
    }
};
