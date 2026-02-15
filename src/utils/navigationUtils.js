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
    const returnPath = location.pathname + location.search;

    switch (result.type) {
        case "person":
            if (onComplete) onComplete();
            navigate(`/person-profile/${result.id}`, {
                state: { from: returnPath, searchResultName: result.name },
            });
            break;

        case "department":
            if (onComplete) onComplete();
            navigate(`/department-profile/${result.id}`, {
                state: { from: returnPath, searchResultName: result.name },
            });
            break;

        case "cabinetMinister":
        case "stateMinister": {
            // Build URL with proper date context for cabinet ministry/state minister search
            const params = new URLSearchParams();

            // Use term_start date if available, otherwise use current date
            const selectedDate = result.created
                ? result.created.split("T")[0]
                : new Date().toISOString().split("T")[0];

            const startDateObj = new Date(selectedDate);
            const year = startDateObj.getFullYear();

            // Set range to the full calendar year of the term_start
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;

            params.set("startDate", startDate);
            params.set("endDate", endDate);
            params.set("filterByType", "all");
            params.set("viewMode", "Grid");
            params.set("selectedDate", selectedDate);
            params.set("filterByName", result.name);

            if (onComplete) onComplete();
            navigate(`/organization?${params.toString()}`, {
                state: { searchResultName: result.name },
            });
            break;
        }

        case "dataset":
            if (setLoadingDatasetId) setLoadingDatasetId(result.id);
            try {
                const response = await getDatasetCategories({ datasetId: result.id });
                const year = result.year || (result.created ? new Date(result.created).getFullYear() : null);
                const url = buildDatasetUrl
                    ? buildDatasetUrl(result.name, response.categories || [], year)
                    : "/data";

                if (onComplete) onComplete();
                navigate(url, {
                    state: { searchResultName: result.name },
                });
            } catch (err) {
                console.error("Failed to fetch dataset categories:", err);
                if (onComplete) onComplete();
                navigate("/data");
            } finally {
                if (setLoadingDatasetId) setLoadingDatasetId(null);
            }
            break;

        default:
            if (onComplete) onComplete();
            break;
    }
};
