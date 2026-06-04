import { statItems, meetingBodies } from "../data/mockdata";

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
    const items = meetingBodies.slice(start, end);
    const output = items.map((ministry) => ({ "id": ministry?.id, "title": ministry?.title, "track": ministry?.bodies?.length || 0 }))

    return {
        data: output,
        page,
        pageSize,
        total: meetingBodies.length,
        hasNextPage: end < meetingBodies.length,
    };
}

export const getMeetingMinistryBodies = async ({ ministryId, page = 1, pageSize = 20, signal } = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const ministry = meetingBodies.find((m) => m.id === ministryId);
    const bodies = ministry.bodies.slice(start, end);
    return {
        data: bodies,
        page,
        pageSize,
        total: ministry.bodies.length,
        hasNextPage: end < ministry.bodies.length,
    };
}

export const getMeetingMinistryData = async ({ ministryId, signal } = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const ministry = meetingBodies.find((m) => m.id === ministryId);
    return { data: ministry };
}

export const getMeetingMinistryBodyData = async ({ ministryId, bodyId, signal } = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const ministry = meetingBodies.find((m) => m.id === ministryId);
    const body = ministry.bodies.find((b) => b.id === bodyId);
    return { data: body };
}
