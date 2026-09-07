// @ts-nocheck
import { test as base, expect } from '@playwright/test';

export const PERSON_ID = '1234';
export const GOV_ID = 'gov_01';

// ---- Mock data ----

export const mockPersonProfile = {
  name: 'Test Person One',
  political_party: 'Test Party A',
  date_of_birth: '1968-11-24',
  religion: 'Test Religion',
  profession: 'Test Profession',
  email: '',
  phone_number: '',
  education_qualifications: 'Test Degree',
  professional_qualifications: '',
  image_url: 'data/people/images/test-person-one.jpg',
  age: 57,
};

export const mockPersonHistory = {
  ministry_history: [
    {
      id: '1111',
      name: 'Test Ministry Role 1',
      term: '2024-11-18 - Present',
      is_president: true,
    },
    {
      id: '2222',
      name: 'Test Ministry Role 2',
      term: '2024-11-18 - Present',
      is_president: true,
    },
    {
      id: '3333',
      name: 'Test Ministry Role 3',
      term: '2024-09-23 - 2024-09-25',
      is_president: true,
    },
  ],
  ministries_worked_at: 38,
  worked_as_president: 1,
};

export const mockEmptyBody = { body: [], total: 0 };
export const mockEmptyArray = [];

// personImages.json is imported directly (import presidentDetails from ".../personImages.json")
// and dataLoadingAnimatedComponent.jsx calls presidentDetails.find(detail => detail.personName...)
// on it — so it MUST be an array of {personName, imageUrl, themeColorLight}, not an object keyed
// by ID. Getting this wrong throws "presidentDetails.find is not a function" inside
// fetchPersonData()'s try block, which is swallowed into setShowServerError(true) -> the whole
// app renders a generic 500 page regardless of which route you're on.
export const mockPersonImages = [
  {
    personName: 'Test Person One',
    imageUrl: 'data/people/images/test-person-one.jpg',
    themeColorLight: '#2E7D32',
  },
  {
    personName: 'Test Person Two',
    imageUrl: 'data/people/images/test-person-two.jpg',
    themeColorLight: '#1565C0',
  },
  {
    personName: 'Test Person Three',
    imageUrl: 'data/people/images/test-person-three.jpg',
    themeColorLight: '#6A1B9A',
  },
];

// fetchAllPersons() -> POST /v1/entities/search {kind:{major:"Person",minor:"citizen"}}
// listToDict keyed by `id`. Must include every relatedEntityId referenced in the
// AS_PRESIDENT relations below, or personDictInDetail.filter(Boolean) drops that president.
export const mockEntitiesSearchPerson = {
  body: [
    {
      id: PERSON_ID,
      name: 'Test Person One',
      kind: { major: 'Person', minor: 'citizen' },
      political_party: 'Test Party A',
      image_url: 'data/people/images/test-person-one.jpg',
    },
    {
      id: '5678',
      name: 'Test Person Two',
      kind: { major: 'Person', minor: 'citizen' },
    },
    {
      id: '9012',
      name: 'Test Person Three',
      kind: { major: 'Person', minor: 'citizen' },
    },
  ],
  total: 3,
};

// fetchPresidentsData() -> POST /v1/entities/gov_01/relations {name:"AS_PRESIDENT"}
// services.js returns response.json() DIRECTLY here -> plain ARRAY, not {body:...}.
// This becomes presidentRelationDict (keyed by relatedEntityId) AND presidentDict
// (the actual person objects, enriched) in dataLoadingAnimatedComponent.jsx.
// The primary test person's relation has endTime: "" (still in office) so
// FilteredPresidentCards treats their term as ongoing (rel.endTime falsy -> presEnd = new Date()).
export const mockAsPresidentRelations = [
  {
    id: 'gov_01_5678_2025-10-27T12-25-37+05-30',
    relatedEntityId: '5678',
    name: 'AS_PRESIDENT',
    startTime: '2019-11-17T00:00:00Z',
    endTime: '2022-07-20T00:00:00Z',
    direction: 'OUTGOING',
  },
  {
    id: 'gov_01_9012_2025-10-27T12-35-25+05-30',
    relatedEntityId: '9012',
    name: 'AS_PRESIDENT',
    startTime: '2022-07-20T00:00:00Z',
    endTime: '2024-09-23T00:00:00Z',
    direction: 'OUTGOING',
  },
  {
    id: `gov_01_${PERSON_ID}_2025-10-27T12-39-59+05-30`,
    relatedEntityId: PERSON_ID,
    name: 'AS_PRESIDENT',
    startTime: '2024-09-23T00:00:00Z',
    endTime: '',
    direction: 'OUTGOING',
  },
];

// fetchInitialGazetteData() -> two POST /v1/entities/search calls (extgztorg + extgztperson),
// merged into a flat list of {date, gazetteId[]} sorted by date. FilteredPresidentCards'
// URL-init effect WON'T RUN until this list is non-empty, and selectPresidentAndDates()
// uses it to compute the default selectedDate. Must include a date inside the primary test
// person's term (>= 2024-09-23) so initialization actually resolves to a real date.
export const mockGazetteSearchResult = {
  body: [
    {
      created: '2024-09-23T00:00:00Z',
      name: JSON.stringify({ value: '676f767f3031' }),
    },
    {
      created: '2025-01-15T00:00:00Z',
      name: JSON.stringify({ value: '676f767f3032' }),
    },
    {
      created: '2026-04-21T00:00:00Z',
      name: JSON.stringify({ value: '676f767f3033' }),
    },
  ],
  total: 3,
};

// ---- Route setup ----

async function setupMocks(page) {
  await page.route('**/v1/**', async (route) => {
    console.warn(`[MOCK FALLBACK] ${route.request().method()} ${route.request().url()}`);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route(`**/v1/person/person-profile/${PERSON_ID}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', json: mockPersonProfile });
    } else {
      await route.continue();
    }
  });

  await page.route(`**/v1/person/person-history/${PERSON_ID}`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: mockPersonHistory });
  });

  await page.route('**/v1/entities/search', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    let body = {};
    try { body = JSON.parse(route.request().postData() || '{}'); } catch {}

    const minor = body?.kind?.minor;
    const major = body?.kind?.major;

    if (major === 'Person' && minor === 'citizen') {
      await route.fulfill({ status: 200, contentType: 'application/json', json: mockEntitiesSearchPerson });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', json: mockEmptyBody });
    }
  });

  await page.route('**/v1/entities/**/relations', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: mockEmptyArray });
  });

  await page.route(`**/v1/entities/${GOV_ID}/relations`, async (route) => {
    console.log('[DEBUG] gov_01/relations handler hit, returning', mockAsPresidentRelations.length, 'relations');
    await route.fulfill({ status: 200, contentType: 'application/json', json: mockAsPresidentRelations });
  });

  await page.route('**/v1/organisation/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: mockEmptyBody });
  });

  await page.route('**/assets/personImages.json*', async (route) => {
    const body = `export default ${JSON.stringify(mockPersonImages)};`;
    await route.fulfill({ status: 200, contentType: 'text/javascript', body });
  });
}

// ---- Fixture ----

type MockFixtures = {
  mocks: void; // no return value — it just sets routes up as a side effect
};

export const test = base.extend<MockFixtures>({
  // Automatic, test-scoped: runs before every test that imports `test` from
  // this file, without needing to be listed in the test's argument list.
  // Boxed so it doesn't clutter the trace/report with its own step, since it's
  // pure setup with no assertions of interest.
  mocks: [
    async ({ page }, use) => {
      await setupMocks(page);
      await use();
    },
    { auto: true, box: true },
  ],
});

export { expect };