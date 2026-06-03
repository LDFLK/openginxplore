import { meetings, statItems } from "../data/mockdata";


const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : ""

const GI_SERVICE_URL = "";

export const getMinistryMeetingHighlight = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return statItems;
}

export const getMinistryMeetings = async ({ page = 1, pageSize = 20, signal } = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = meetings.slice(start, end);
    return {
        data: items,
        page,
        pageSize,
        total: meetings.length,
        hasNextPage: end < meetings.length,
    };
}
