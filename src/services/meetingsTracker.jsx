import { meetings, statItems } from "../data/mockdata";


const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : ""

const GI_SERVICE_URL = "";

export const getMinistryMeetingHighlight = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return statItems;
}

export const getMinistryMeetings = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return meetings;
}
