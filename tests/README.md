# Playwright Tests — Profile / Organization Flow

Covers `view-profile.spec.ts`. Runs against a real browser with the backend
mocked via `page.route()`, so tests exercise real rendering/navigation without
depending on a live BFF.

## Flows tested

**Profile full flow** (runs once per browser/viewport project — see `playwright.config.js`):
1. Open the organization page and click "View Profile" on a person card
2. Confirm the URL updates to `/person-profile/:id` and the profile data renders (name, party)
3. Click the share button and confirm the profile link is copied to the clipboard (Chromium only)
4. Click the external source link and confirm it opens `parliament.lk` in a new tab
5. Switch between the "Portfolios Held" and "Qualifications" tabs and confirm the active tab styling updates
6. Click "Back" and confirm navigation returns to the organization page

**Direct profile navigation**: loads `/person-profile/:id` directly (bypassing the organization page) and checks the same tab-switching behavior, as a simpler, less-gated smoke test.

## Mocked API summary

| Endpoint | Method | Returns |
|---|---|---|
| `/v1/person/person-profile/:id` | GET | Person profile fields (name, party, DOB, etc.) |
| `/v1/person/person-history/:id` | GET | Ministry history list + summary counts |
| `/v1/entities/search` | POST | Branches on request body's `kind.major`/`kind.minor` — returns a person list for `Person/citizen`, empty results for everything else (departments, ministries, gazette data) |
| `/v1/entities/gov_01/relations` | POST | Presidential term relations (plain array, not wrapped in `{body}`) |
| `/v1/entities/:id/relations` | POST | Generic relations catch-all, returns an empty array |
| `/v1/organisation/**` | POST | Portfolio/ministry/PM data, returns empty (the UI has explicit empty-state copy) |
| `/assets/personImages.json` | GET | Static image metadata, must stay an array (`.find()` is called on it) |
| `**/v1/**` | any | Catch-all fallback for anything else, returns `{}` |

For how to install dependencies and run the suite, see the root [README](../README.md#how-to-run-tests).
