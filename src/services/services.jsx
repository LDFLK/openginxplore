import utils from "../utils/utils";
import axios from "@/lib/axios";

const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : ""
// const apiUrl = "";

const GI_SERVICE_URL = "/v1/organisation";
const GI_SERVICE_URL_PERSON = "/v1/person";
const OPEN_GIN_REQUEST_CONFIG = { baseURL: "" };

export const getActivePortfolioList = async ({ presidentId, date, signal }) => {
  const { data } = await axios.post(
    `${GI_SERVICE_URL}/active-portfolio-list`,
    { date },
    {
      params: { presidentId },
      signal
    }
  );

  return data;
};

export const getPersonProfile = async ({ personId, signal }) => {
  const { data } = await axios.get(
    `${GI_SERVICE_URL_PERSON}/person-profile/${personId}`,
    { signal }
  );

  return data;
};


export const getCabinetFlow = async ({ presidentId, dates }) => {
  const { data } = await axios.post(
    `${GI_SERVICE_URL}/cabinet-flow/${presidentId}`,
    dates
  );

  return data;
}

export const getDepartmentsByPortfolio = async ({ portfolioId, date, signal, }) => {
  const { data } = await axios.post(
    `${GI_SERVICE_URL}/departments-by-portfolio/${portfolioId}`,
    { date },
    { signal }
  );

  return data;
};

export const getPrimeMinister = async ({ date, signal }) => {
  const { data } = await axios.post(
    `${GI_SERVICE_URL}/prime-minister`,
    { date },
    { signal }
  );

  return data;
};

export const getDepartmentHistory = async ({ departmentId, signal }) => {
  const { data } = await axios.get(
    `${GI_SERVICE_URL}/department-history/${departmentId}`,
    { signal }
  );

  return data;
};

export const getPersonHistory = async ({ personId, signal }) => {
  const { data } = await axios.get(
    `${GI_SERVICE_URL_PERSON}/person-history/${personId}`,
    { signal }
  );

  return data;
};

// Fetch initial gazette dates and all ministry protobuf data
const fetchInitialGazetteData = async () => {
  try {
    const { data: result } = await axios.post(
      `${apiUrl}/v1/entities/search`,
      {
        kind: {
          major: "Document",
          minor: "extgztorg",
        },
      },
      OPEN_GIN_REQUEST_CONFIG
    );

    const { data: resultForPerson } = await axios.post(
      `${apiUrl}/v1/entities/search`,
      {
        kind: {
          major: "Document",
          minor: "extgztperson",
        },
      },
      OPEN_GIN_REQUEST_CONFIG
    );

    const datesList1 = result.body.map((item) => {
      return {
        date: item.created?.split("T")[0],
        gazetteId: [utils.extractNameFromProtobuf(item.name)],
      };
    });
    const datesList2 = resultForPerson.body.map((item) => {
      return {
        date: item.created?.split("T")[0],
        gazetteId: [utils.extractNameFromProtobuf(item.name)],
      };
    });

    const mergedDateList1 = datesList1.concat(datesList2).sort();
    // const dates = Array.from(new Set(mergedDateList1));

    const merged = Object.values(
      mergedDateList1.reduce((acc, { date, gazetteId }) => {
        if (!acc[date]) {
          acc[date] = { date, gazetteId: [...gazetteId] };
        } else {
          acc[date].gazetteId.push(...gazetteId);
        }
        return acc;
      }, {})
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    return merged;
  } catch (error) {
    console.error("Error fetching initial gazette data from API:", error);
    return {
      dates: [],
      allMinistryData: [],
    };
  }
};

const fetchPresidentsData = async (governmentNodeId = "gov_01") => {
  try {
    const { data: jsonResponse } = await axios.post(
      `${apiUrl}/v1/entities/${governmentNodeId}/relations`,
      { name: "AS_PRESIDENT" },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    return jsonResponse;
  } catch (e) {
    console.log(`Error fetching presidents `, e.message);
    return [];
  }
};

const fetchActiveMinistries = async (
  selectedDate,
  allMinistryData, // now a dict { id: ministryObj }
  selectedPresident
) => {
  try {
    const { data: activeMinistryRelations } = await axios.post(
      `${apiUrl}/v1/entities/${selectedPresident.id}/relations`,
      {
        relatedEntityId: "",
        startTime: "",
        endTime: "",
        id: "",
        name: "AS_MINISTER",
        activeAt: `${selectedDate.date}T00:00:00Z`,
      },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    // Extract relatedEntityId and startTime from each relation
    const activeMinistryInfo = activeMinistryRelations
      .filter((relation) => relation.relatedEntityId)
      .map((relation) => ({
        id: relation.relatedEntityId,
        startTime: relation.startTime || null,
      }));

    // Map ministry info using dict lookup instead of .find()
    const activeMinistries = activeMinistryInfo.map(({ id, startTime }) => {
      const ministry = allMinistryData[id];
      let name = ministry?.name || "Unknown Ministry";

      try {
        const parsed = JSON.parse(name);
        if (parsed?.value) {
          name = utils.decodeHexString(parsed.value);
        }
      } catch (e) {
        name = utils.extractNameFromProtobuf(name) || name;
        console.log(e.message);
      }

      return {
        name,
        id,
        type: "ministry",
        startTime,
        children: [],
      };
    });

    return {
      name: "Government",
      children: activeMinistries,
      type: "root",
    };
  } catch (error) {
    console.error("Error fetching active ministries:", error);
    return {
      name: "Government",
      children: [],
      type: "root",
    };
  }
};

const fetchAllPersons = async () => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/v1/entities/search`,
      {
        kind: {
          major: "Person",
          minor: "citizen",
        },
      },
      OPEN_GIN_REQUEST_CONFIG
    );

    return data;
  } catch (error) {
    console.error("Error fetching person data from API:", error);
    return {
      dates: [],
      allMinistryData: [],
    };
  }
};

const fetchActiveRelationsForMinistry = async (
  selectedDate,
  ministryId,
  relationType
) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/v1/entities/${ministryId}/relations`,
      {
        relatedEntityId: "",
        startTime: "",
        endTime: "",
        id: "",
        name: relationType,
        activeAt: `${selectedDate}T00:00:00Z`,
      },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    return data;
  } catch (error) {
    console.error("Error fetching active ministries:", error);
  }
};

const fetchAllDepartments = async () => {
  // Fetch all department protobuf data
  const { data } = await axios.post(
    `${apiUrl}/v1/entities/search`,
    {
      kind: {
        major: "Organisation",
        minor: "department",
      },
    },
    OPEN_GIN_REQUEST_CONFIG
  );

  return data;
};

const fetchAllStateMinistries = async () => {
  // Fetch all state ministries protobuf data
  const { data } = await axios.post(
    `${apiUrl}/v1/entities/search`,
    {
      kind: {
        major: "Organisation",
        minor: "stateMinister",
      },
    },
    OPEN_GIN_REQUEST_CONFIG
  );

  return data;
};

const fetchAllCabinetMinistries = async () => {
  // Fetch all cabinet ministries protobuf data
  const { data } = await axios.post(
    `${apiUrl}/v1/entities/search`,
    {
      kind: {
        major: "Organisation",
        minor: "cabinetMinister",
      },
    },
    OPEN_GIN_REQUEST_CONFIG
  );

  return data;
};

const fetchAllRelationsForMinistry = async ({
  ministryId,
  relatedEntityId = "",
  startTime = "",
  endTime = "",
  id = "",
  name = "",
  activeAt = "",
}) => {
  try {
    const { data: json } = await axios.post(
      `${apiUrl}/v1/entities/${ministryId}/relations`,
      {
        relatedEntityId: relatedEntityId,
        startTime: startTime,
        endTime: endTime,
        id: id,
        name: name,
        activeAt: activeAt,
      },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    return json;
  } catch (error) {
    console.error(
      `Error fetching relations for ministry ID ${ministryId}:`,
      error
    );
    return [];
  }
};

const createDepartmentHistoryDictionary = async (allMinistryData) => {
  const departmentHistory = {};

  for (const ministry of allMinistryData) {
    const ministryId = ministry.id;

    const allRelations = await fetchAllRelationsForMinistry(ministryId);

    for (const relation of allRelations) {
      if (relation.name === "AS_DEPARTMENT") {
        const departmentId = relation.relatedEntityId;

        if (!departmentHistory[departmentId]) {
          departmentHistory[departmentId] = [];
        }

        if (!departmentHistory[departmentId].includes(ministryId)) {
          departmentHistory[departmentId].push(ministryId);
        }
      }
    }
  }

  return departmentHistory;
};

const chatbotApiCall = async (question, session_id) => {
  try {
    console.log(`this is the question ${question}`);
    const { data: json } = await axios.post(
      `/chat`,
      { question, session_id },
      OPEN_GIN_REQUEST_CONFIG
    );

    return json;
  } catch (error) {
    console.error(`Chat Error`, error);
    return [];
  }
};

const getMinistriesByDepartment = async (departmentId) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/v1/entities/${departmentId}/relations`,
      {
        name: "AS_DEPARTMENT",
      },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    return data;
  } catch (error) {
    console.error("Error fetching past ministries for department:", error);
  }
};

const getDepartmentRenamedInfo = async (departmentId) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/v1/entities/${departmentId}/relations`,
      {
        name: "RENAMED_TO",
      },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    return data;
  } catch (error) {
    console.error("Error fetching renamed department info:", error);
  }
};

const getMinistriesByPerson = async (personId) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/v1/entities/${personId}/relations`,
      {
        name: "AS_APPOINTED",
      },
      {
        ...OPEN_GIN_REQUEST_CONFIG,
      }
    );

    return data;
  } catch (error) {
    console.error("Error fetching renamed department info:", error);
  }
};

export default {
  fetchInitialGazetteData,
  fetchAllRelationsForMinistry,
  getMinistriesByDepartment,
  createDepartmentHistoryDictionary,
  fetchActiveMinistries,
  fetchAllPersons,
  fetchActiveRelationsForMinistry,
  fetchAllStateMinistries,
  fetchAllCabinetMinistries,
  fetchAllDepartments,
  fetchPresidentsData,
  chatbotApiCall,
  getDepartmentRenamedInfo,
  getMinistriesByPerson,
  getPersonProfile,
  getDepartmentsByPortfolio,
  getPrimeMinister
};
