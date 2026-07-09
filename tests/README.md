# Playwright Mocking Notes — Profile / Organization Flow

This documents every API call mocked for `view-profile.spec.ts`, where each call
comes from in the codebase, why it needs the exact shape it has, and the method
used to discover each one. Written so the next person (or future you) doesn't
have to re-derive all of this from scratch.

---

## 1. Why this app needs so many mocks

Every route in this app — `/organization`, `/person-profile/:id`
`/department-profile/:id` — mounts the same component:

```
src/pages/SplashPage/screens/dataLoadingAnimatedComponent.jsx
```

On mount, this component fires **4 functions in parallel** via `Promise.allSettled`,
each making its own BFF (Backend-For-Frontend) calls, then dispatches the results
into Redux. The actual page (`HomePage`, `PersonProfile`, etc.) doesn't render
until this finishes. That means **every test on every route depends on all of
these calls succeeding**, regardless of what the test is actually trying to check.

If *any* one of the 4 functions throws, its `catch` block sets
`showServerError = true`, and the **entire app** renders a generic `Error500`
page — no matter which call failed. This is why early failures looked like
total app breakage rather than a single missing field.

---

## 2. Discovery method

We did **not** guess at endpoint shapes. Each one was found by reading source,
in this order:

1. **`dataLoadingAnimatedComponent.jsx`** — read first, to find the 4 top-level
   fetch functions and what Redux actions each one dispatches.
2. **`src/services/services.js`** — read in full, to see the *real* `fetch()`
   calls inside each of those 4 functions: exact URL, HTTP method, request body,
   and critically, **what each function returns** (raw `Response` object vs.
   already-parsed JSON vs. a plain array) — this varies per function and is
   the single most common source of mock bugs.
3. **`src/utils/utils.jsx`** — read because several responses get passed through
   `extractNameFromProtobuf` / `decodeHexString`, which expect a specific
   `{value: <hex string>}` JSON-encoded shape.
4. **Component tree, read top-down, to find rendering gates**:
   `HomePage.jsx` → `Organization.jsx` → `FilteredPresidentCards.jsx` /
   `MinistryCardGrid.jsx` — read to find out which Redux fields and local
   React state actually control what renders, since mocking the network
   correctly is necessary but **not sufficient** — some rendering depends on
   local state (e.g. URL-derived date ranges) that no mock can fix directly.
5. **Live error capture** — `page.on('console', ...)` and `page.on('pageerror', ...)`
   forwarded the browser's own `console.log`/`console.error` calls (which the
   app already emits in its `catch` blocks) into the terminal. This is what
   found the one bug that static reading missed (see §5, `personImages.json`).

---

## 3. APIs mocked, grouped by source function

### 3.1 `fetchPersonData()` — found in `dataLoadingAnimatedComponent.jsx`

Calls two BFF endpoints and one static asset, then dispatches `setAllPerson`,
`setPresidentRelationDict`, `setPresidentDict`, `setSelectedPresident`.

| # | Endpoint | Method | Request body | Response shape | Source function |
|---|---|---|---|---|---|
| 1 | `/v1/entities/search` | POST | `{kind:{major:"Person",minor:"citizen"}}` | `{body: Person[], total}` — raw `Response`, app calls `.json()` itself | `api.fetchAllPersons()` in `services.js` |
| 2 | `/v1/entities/gov_01/relations` | POST | `{name:"AS_PRESIDENT"}` | **Plain array** of relation objects — `services.js` returns `response.json()` directly, NOT wrapped in `{body:...}` | `api.fetchPresidentsData()` in `services.js` |
| 3 | `/assets/personImages.json` | GET (static import) | — | **Array** of `{personName, imageUrl, themeColorLight}` | direct `import` in `dataLoadingAnimatedComponent.jsx` |

**Mock bodies used:**

```js
// #1 — fetchAllPersons
const mockEntitiesSearchPerson = {
  body: [
    { id: '2403-03-01_cit_1', name: 'Anura Kumara Dissanayake', kind: {major:'Person',minor:'citizen'}, political_party: "National People's Power", image_url: '...' },
    { id: '2149-34_cit_1', name: 'Gotabaya Rajapaksa', kind: {major:'Person',minor:'citizen'} },
    { id: '2279-23_cit_1', name: 'Ranil Wickremesinghe', kind: {major:'Person',minor:'citizen'} },
  ],
  total: 3,
};

// #2 — fetchPresidentsData (plain array, not {body:...})
const mockAsPresidentRelations = [
  { id: '...', relatedEntityId: '2149-34_cit_1', name: 'AS_PRESIDENT', startTime: '2019-11-17T00:00:00Z', endTime: '2022-07-20T00:00:00Z', direction: 'OUTGOING' },
  { id: '...', relatedEntityId: '2279-23_cit_1', name: 'AS_PRESIDENT', startTime: '2022-07-20T00:00:00Z', endTime: '2024-09-23T00:00:00Z', direction: 'OUTGOING' },
  { id: '...', relatedEntityId: '2403-03-01_cit_1', name: 'AS_PRESIDENT', startTime: '2024-09-23T00:00:00Z', endTime: '', direction: 'OUTGOING' },
];

// #3 — personImages.json (array, NOT object-keyed-by-id)
const mockPersonImages = [
  { personName: 'Anura Kumara Dissanayake', imageUrl: '...', themeColorLight: '#2E7D32' },
  { personName: 'Gotabaya Rajapaksa', imageUrl: '...', themeColorLight: '#1565C0' },
  { personName: 'Ranil Wickremesinghe', imageUrl: '...', themeColorLight: '#6A1B9A' },
];
```

**Why #1's `id`s must match #2's `relatedEntityId`s:** the component does

```js
const personDictInDetail = presidentResponse
  .map((p) => personDict[p.relatedEntityId])
  .filter(Boolean);
```

Any relation whose `relatedEntityId` isn't a key in the person dict gets
silently dropped — no error, just a missing president.

**Why #3 must be an array:** the component calls

```js
presidentDetails.find((detail) => detail.personName.toLowerCase().includes(...))
```

`.find()` doesn't exist on plain objects. Shaping this as
`{'2403-03-01_cit_1': 'path/to/image.jpg'}` (object keyed by ID — the first,
wrong attempt) throws `presidentDetails.find is not a function` inside the
`try` block, silently triggering the app-wide `Error500` page.

---

### 3.2 `fetchAllDepartmentData()`

| # | Endpoint | Method | Request body | Response shape |
|---|---|---|---|---|
| 4 | `/v1/entities/search` | POST | `{kind:{major:"Organisation",minor:"department"}}` | `{body: [], total: 0}` — empty is safe |

---

### 3.3 `fetchAllMinistryData()`

| # | Endpoint | Method | Request body | Response shape |
|---|---|---|---|---|
| 5 | `/v1/entities/search` | POST | `{kind:{major:"Organisation",minor:"stateMinister"}}` | `{body: [], total: 0}` |
| 6 | `/v1/entities/search` | POST | `{kind:{major:"Organisation",minor:"cabinetMinister"}}` | `{body: [], total: 0}` |

---

### 3.4 `fetchAllGazetteDate()` → `fetchInitialGazetteData()`

| # | Endpoint | Method | Request body | Response shape |
|---|---|---|---|---|
| 7 | `/v1/entities/search` | POST | `{kind:{major:"Document",minor:"extgztorg"}}` | `{body: [], total: 0}` (kept empty in final version — see §6) |
| 8 | `/v1/entities/search` | POST | `{kind:{major:"Document",minor:"extgztperson"}}` | `{body: [], total: 0}` |

All five of #4–#8 hit the same URL (`/v1/entities/search`), distinguished only
by the JSON request body's `kind.major`/`kind.minor`. One `page.route()`
handler parses the POST body and branches on these fields rather than using
five separate route registrations.

---

### 3.5 Profile page — `PersonProfile` component (mode="person-profile")

| # | Endpoint | Method | Response shape |
|---|---|---|---|
| 9 | `/v1/person/person-profile/:personId` | GET | flat object: `name`, `political_party`, `date_of_birth`, `religion`, `profession`, `email`, `phone_number`, `education_qualifications`, `professional_qualifications`, `image_url`, `age` |
| 10 | `/v1/person/person-history/:personId` | GET | `{ministry_history: [{id, name, term, is_president}], ministries_worked_at, worked_as_president}` |

---

### 3.6 Org page widgets — `MinistryCardGrid.jsx`

| # | Endpoint | Method | Request body | Consumed as |
|---|---|---|---|---|
| 11 | `/v1/organisation/active-portfolio-list` | POST | `{date}`, `presidentId` as query param | `data.portfolioList`, `data.NoOfCabinetMinistries`, `data.NoOfStateMinistries`, `data.newMinistries`, `data.newMinisters`, `data.ministriesUnderPresident` (via `useActivePortfolioList` hook) |
| 12 | `/v1/organisation/prime-minister` | POST | `{date}` | `data.body` → PM object with `name`, `id`, `term`, `imageUrl`, `isNew` (via `usePrimeMinister` hook) |
| 13 | `/v1/organisation/cabinet-flow/:presidentId` | POST | date range | unused in this flow (Cabinet Flow tab not exercised) |

Mocked as one catch-all `**/v1/organisation/**` returning `{body: [], total: 0}`
— confirmed safe because `MinistryCardGrid` and the PM section both have
explicit empty-state UI (`"No ministries."`, `"No Prime Minister appointed..."`).

---

### 3.7 Generic relation calls

| # | Endpoint pattern | Used by |
|---|---|---|
| 14 | `/v1/entities/:id/relations` (any ID except `gov_01`) | ministry-portfolio relations, department relations, etc. — not exercised by name in this flow, mocked to empty array as a safe default |

Registered as a broad catch-all **before** the specific `gov_01/relations`
route (#2), so the specific one wins for that one URL while everything else
falls through to the empty-array default. (See §4 on route ordering.)

---

## 4. Route-matching order in Playwright

Playwright tries `page.route()` handlers in **reverse registration order** —
the most recently registered matching pattern wins. An unconditional
`route.fulfill()` (no `route.continue()` fallthrough) stops the search there.

This file's `setupMocks()` registers, in this exact order:

```
1. **/v1/**                          (broad catch-all, logs + returns {})
2. **/v1/person/person-profile/:id
3. **/v1/person/person-history/:id
4. **/v1/entities/search             (branches on POST body)
5. **/v1/entities/**/relations       (generic, returns [])
6. **/v1/entities/gov_01/relations   (specific, returns real data)
7. **/v1/organisation/**
8. **/assets/personImages.json*
```

Because the catch-all (#1) is registered **first**, it is tried **last** —
every more specific route gets first chance to match. Because the specific
`gov_01/relations` route (#6) is registered **after** the generic relations
route (#5), it wins for that one URL; everything else falls through to #5.

Getting this backwards (registering the catch-all last) was an actual bug
during development: it silently swallowed every request, including ones with
correctly-shaped specific mocks underneath it, producing `[MOCK FALLBACK]`
log lines for calls that should never have reached the fallback.

---

## 5. Redux state vs. local React state — what mocking can't fix

Not everything gated behind rendering comes from the network. Two examples
found by reading the component tree directly, not by mocking trial-and-error:

- **`Organization.jsx`**: `FilteredPresidentCards` only renders if
  `dateRange[0] && dateRange[1]` are both truthy. `dateRange` is
  `userSelectedDateRange`, local `useState` in `HomePage.jsx`, initialized to
  `[null, null]`. It is **not** derived from the URL's `startDate`/`endDate`
  query params anywhere in `HomePage`. No API mock can make this render —
  the test relies on `FilteredPresidentCards`' own internal effect, which
  reads `startDate`/`endDate`/`selectedDate` **directly from
  `window.location.search`** (via `useSearchParams`), independently of the
  `dateRange` prop, to self-initialize `selectedPresident`/`selectedDate` in
  Redux on first mount.

- **`FilteredPresidentCards.jsx`**: its URL-initialization `useEffect` has a
  hard early-return:

  ```js
  if (!gazetteDateClassic || gazetteDateClassic.length === 0) return;
  ```

  `gazetteDateClassic` comes from Redux, populated by `fetchInitialGazetteData()`
  (calls #7–#8 above). If that list is empty, this effect never completes
  initialization. In the final passing version we kept it empty and confirmed
  via the actual passing test run that the AKD card still renders correctly —
  the `useMemo`-derived `filteredPresidents` list (which builds the card list
  itself) doesn't depend on this effect, only on `presidents` and
  `presidentRelationDict`, both already correctly populated by calls #1–#2.

---

## 6. Live debugging technique that found the real bug

Static reading of source got us most of the way, but one bug
(`personImages.json`'s shape) was only found by **forwarding the browser's
own console output into the Playwright terminal**:

```js
page.on('console', (msg) => console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text()));
page.on('pageerror', (err) => console.log('[BROWSER PAGEERROR]', err.message, err.stack));
```

The app already does this, inside `dataLoadingAnimatedComponent.jsx`'s catch
blocks:

```js
} catch (e) {
  if (e.message !== OFFLINE_ERROR) setShowServerError(true);
  console.log(`Error fetching person data : ${e.message}`);
}
```

With the listener attached, this surfaced directly in the terminal:

```
[BROWSER LOG] Error fetching person data : presidentDetails.find is not a function
```

— which pointed straight at the exact line and the exact wrong assumption
(object vs. array), instead of us inferring it from a generic
`toBeVisible() timeout` failure with no further information. This pairing —
**reading the source first, then verifying live with console/pageerror
forwarding** — is the method to repeat for any future mocking work on this
app, rather than guessing at shapes from the test failure alone.

The remaining `[BROWSER ERROR] Error parsing protobuf name: SyntaxError...`
lines seen in passing runs are expected and harmless: `extractNameFromProtobuf`
tries `JSON.parse` on a plain string (since our mock names are plain strings,
not real protobuf-encoded `{value: hex}` JSON), catches the `SyntaxError`,
and falls back to returning the original string unchanged. It's logged via
`console.error` but never thrown, so it doesn't affect test outcomes.