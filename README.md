# Property Ads — xe.gr Web Developer Challenge

A full-stack web app for creating and listing real-estate ads. Its main feature is the **area selection field**: an autocomplete input backed by the xe.gr places API.

- **Frontend:** React 19 + TypeScript (Vite), TanStack Query, React Router
- **Backend:** Node.js + Express 5 (TypeScript), SQLite for storage, Redis for caching
- **Shared:** one zod validation schema and set of TypeScript types used by both client and server

---

## Table of contents

- [Features](#features)
- [Tech stack and packages](#tech-stack-and-packages)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API](#api-reference)
- [Validation rules](#validation-rules)
- [How it works](#how-it-works)
- [Testing](#testing)
- [Known limitations and future work](#known-limitations-and-future-work)

---

## Features

### Core requirements

- **New property ad form** with Title, Type, Area, Price and Extra description.
- **Area autocomplete:**
  - suggestions appear after **3 characters** and update as you type;
  - choosing a suggestion fills the field with the text returned by the API;
  - the selected **`placeId` is submitted** with the form;
  - the field is **required**: typed text that wasn't chosen from the list is rejected.
- **Validation:**
  - all fields are required except the extra description;
  - the title is limited to 155 characters;
  - the type is one of Rent / Buy / Exchange / Donation;
  - the price accepts numbers only.
- **Backend proxy for the places API.** The browser never calls the external API directly.
- **Error handling.** API errors are caught on the server and shown to the user: per-field form errors, a failure banner, and loading and error states.

### Extras (bonus points)

- **Persistence.** Ads are stored in a **SQLite** database.
- **Caching.** Autocomplete results (and property reads) are cached in **Redis** for 24 hours, so the external API is called less often. Redis is **optional**: if it isn't running, the app works normally without the cache.
- **Additional attributes:** floor and bathrooms.
- **Properties page** that lists every saved ad, with the option to delete one.
- **Fluid layout.** Percentage-based widths with sensible minimums.
- **Keyboard-accessible autocomplete:** ↑ / ↓ to move, Enter to choose, Escape to close, with ARIA combobox and listbox roles.

---

## Tech stack and packages

All packages are open source. Why each one is used:

### Backend (`apps/api`)

| Package       | Purpose                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| [express] v5  | HTTP server and routing. Version 5 forwards errors from `async` routes to the error handler automatically |
| [redis]       | Redis client for the response cache                                                                       |
| [zod] v4      | Validates request bodies (shared with the frontend)                                                       |
| [cors]        | Allows the Vite dev server origin during development                                                      |
| `node:sqlite` | SQLite database. Nothing extra to install and no native build step                                        |
| [typescript]  | Type checking. Node runs `.ts` files directly through type stripping, so the API needs no build step      |

### Frontend (`apps/web`)

| Package                    | Purpose                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| [react] v19 / react-dom    | UI                                                                                                  |
| [vite]                     | Dev server and production build; proxies `/api` to the backend in development                       |
| [@tanstack/react-query]    | Fetching, caching, loading and error states (`useQuery` for reads, `useMutation` for create/delete) |
| [react-router-dom] v7      | Client-side routing                                                                                 |
| [zod] v4                   | Form validation with per-field error messages (same schema as the server)                           |
| [dayjs]                    | Date formatting on the property cards                                                               |
| eslint + typescript-eslint | Linting                                                                                             |

### Shared (`apps/shared`, published inside the repo as `@xe/shared`)

| Package                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| [zod](https://zod.dev/) | `PropertySchema`, the common object for validation |

---

## Project structure

Running `npm install` once at the root installs everything, and `@xe/shared` is linked into both apps.

```
xe_project/
└── apps/
    ├── api/                # Express backend
    ├── web/                # React frontend (Vite)
    └── shared/             # @xe/shared: zod schemas and TypeScript types

```

## Prerequisites

| Requirement | Version                             | Notes                                                                     |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------- |
| **Node.js** | **22.18 or newer** (tested on 25.7) | Needed for built-in TypeScript support and `node:sqlite`                  |
| npm         | 10+                                 | Comes with Node                                                           |
| Redis       | any recent version                  | **Optional.** Without it, caching is turned off and everything else works |

The easiest way to start Redis is with Docker:

```bash
docker run -d --name redis -p 6379:6379 redis
```

---

## Getting started

### 1. Install dependencies (from the repo root)

```bash
npm install
```

### 2. Configure the API

create a .env and copy the contains of .env.example

### 3a. Run it as one server (production-like)

```bash
npm run build -w client   # builds the React app into apps/web/dist
npm start                 # starts the API, which also serves the built app
```

Open **http://localhost:3000**.

### 3b. Or run in development mode (hot reload)

Use two terminals:

```bash
npm run dev -w api        # API on http://localhost:3000 (restarts on change)
npm run dev -w client     # UI on http://localhost:5173 (proxies /api → :3000)
```

Open **http://localhost:5173**.

### Pages

| URL               | Page                                                          |
| ----------------- | ------------------------------------------------------------- |
| `/`               | Home: choose "Create new property ad" or "List of properties" |
| `/properties/new` | New property ad form                                          |
| `/properties`     | All saved ads                                                 |

---

## Configuration

Environment variables for the API, set in `apps/api/.env`:

| Variable      | Default                  | Description                                                                                |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `PORT`        | `3000`                   | API port. If you change it, update the proxy target in `apps/web/vite.config.ts`           |
| `PLACES_API`  | — (**required**)         | Base URL of the xe.gr autocomplete API, ending in `?input=`                                |
| `REDIS_URL`   | `redis://localhost:6379` | Redis connection string                                                                    |
| `DB_PATH`     | `data/app.db`            | SQLite file, resolved relative to the folder the API is started from (normally `apps/api`) |
| `CORS_ORIGIN` | `http://localhost:5173`  | Origin allowed by CORS (only matters in development)                                       |
| `WEB_DIST`    | `../web/dist`            | Folder of the built frontend that Express serves                                           |

The database file and its tables are created automatically on first start. Delete `apps/api/data/` while the server is stopped to reset all data.

---

## API

Base path: `/api`. All responses are JSON. Errors have the shape `{ "error": "<message>" }`, except validation errors (see below).

### `GET /api/health`

Liveness check: `200 { "status": "ok" }`.

### `GET /api/areas/:input`

Autocomplete for areas. Proxies the xe.gr places API, with caching.

| `input` | Search text (Greek or English), at least 3 characters. Letters, numbers, spaces and `- . , ' +` are allowed |
| **200** | `{ "places": [{ "placeId": "…", "mainText": "Nafplio", "secondaryText": "Ελλάδα" }] }` |
| **400** | Input too short or contains special characters |
| **502** | The places API failed, timed out (5s) or couldn't be reached |

### `GET /api/properties`

Lists all ads, newest first: `200 Property[]`. Cached; the cache is cleared on create and delete.

### `GET /api/properties/:id`

Returns a single ad: `200 Property`, or `404` if it doesn't exist.

### `POST /api/properties`

Creates an ad. Example body:

```json
{
  "title": "Bright 2-bedroom apartment",
  "type": "Rent",
  "price": 750,
  "placeId": "ChIJY3lRwZz6nxQRuEDWtg1FTgg",
  "area": "Nafplio, Ελλάδα",
  "floor": 2,
  "bathrooms": 1,
  "extra_description": "Close to the old town"
}
```

| Status | Meaning |
| **201** | Created; returns the stored `Property` (including `id`, `created_at`, `updated_at`) |
| **400** | Validation failed; the body is the list of zod issues (`[{ "path": ["title"], "message": "Title is required!" }, …]`) |

### `DELETE /api/properties/:id`

Deletes an ad: `204 No Content`, or `404` if it doesn't exist.

### `Property` object

| Field                       | Type                                          | Notes                                   |
| --------------------------- | --------------------------------------------- | --------------------------------------- |
| `id`                        | number                                        | Auto-increment                          |
| `title`                     | string                                        | 1–155 characters                        |
| `type`                      | `"Rent" \| "Buy" \| "Exchange" \| "Donation"` |                                         |
| `price`                     | number                                        | ≥ 0, up to 2 decimals in the form       |
| `placeId`                   | string                                        | From the places API                     |
| `area`                      | string                                        | Display text: `mainText, secondaryText` |
| `floor`                     | integer                                       | 0–6                                     |
| `bathrooms`                 | integer                                       | ≥ 1                                     |
| `extra_description`         | string \| null                                | Optional                                |
| `created_at` / `updated_at` | string                                        | UTC timestamps (`YYYY-MM-DD HH:MM:SS`)  |

---

## Validation rules

Both sides use one schema, `PropertySchema` in `apps/shared/src/schemas.ts`:

- **The browser** validates before sending and shows each error under its field.
- **The server** validates every request again, so it never relies on the client.

| Field | Rule |
| Title | Required, trimmed, at most 155 characters |
| Type | One of Rent, Buy, Exchange, Donation |
| Area | Required. A suggestion must be **chosen from the list** (non-empty `placeId`). Editing the text afterwards clears the selection |
| Price | Required number, ≥ 0 |
| Floor | Required integer, 0–6 |
| Bathrooms | Required integer, ≥ 1 |
| Extra description | Optional |

---

## How it works

### Area autocomplete

1. The user types in the Area field (`features/AutocompleteInput.tsx`).
2. Once the text has 3 or more characters, the frontend calls `GET /api/areas/:input`. The term is URL-encoded, and TanStack Query cancels requests that are no longer needed.
3. The backend (`routes/area.ts`) checks the input, then looks in Redis under `areas_<lower-cased term>`.
4. On a cache miss, it calls the places API with a 5-second timeout, stores the result for 24 hours, and returns `{ places }`.
5. The dropdown shows loading, empty and result states. Choosing an option fills the field and stores `placeId` and `area` in the form state.

### Caching

- `apps/api/src/redis.ts` provides `getCachedData`, `setCachedData` (default expiry 24h) and `deleteCachedData`.
- **Redis is optional by design.** Every helper checks `redis.isReady` and catches errors, and the client is set to fail immediately instead of queueing commands while disconnected. If Redis is down, requests skip the cache and still succeed. The client reconnects in the background.
- The property list cache (`properties_all`) is cleared whenever an ad is created or deleted, so the list never shows stale data.

### Error handling

- **Backend:** each route returns a clear status code: 400 for bad input, 404 for missing records, 502 when the places API fails. Anything unexpected reaches a global Express error handler, which logs it and returns a generic `500` without leaking internal details.
- **Frontend:** a shared `request()` helper (`web/src/api/request.ts`) throws an `ApiError` with the HTTP status for every non-OK response. TanStack Query exposes it as the query or mutation `error`. The UI then shows per-field validation messages, a success or failure banner after saving, and error states on the list page and in the autocomplete.

### Serving

In production mode, Express serves the built React app from `apps/web/dist`, with a fallback to `index.html`, so client-side routes work on refresh. Unknown `/api/*` paths always return a JSON 404.

---

## Testing

Static checks:

```bash
npm run typecheck -w api
npm run build -w client    # includes tsc type-checking
npm run lint -w client
```

Manual test checklist:

- [ ] Typing 1–2 characters in **Area** shows no suggestions; typing 3 or more shows them, and they update as you type
- [ ] Greek input works (e.g. `Ναύπλ`)
- [ ] Choosing a suggestion fills the field; submitting sends the `placeId` (check the request in DevTools → Network)
- [ ] Typing in Area without choosing a suggestion → "No area selected!"
- [ ] An empty title / type / price / floor / bathrooms shows the matching error; a title over 155 characters is rejected
- [ ] A successful save shows a green banner and resets the form; the new ad appears on `/properties`
- [ ] Stopping Redis: the app still works (no caching); `curl` the areas endpoint twice with Redis running to see the cached response in the API log

> Automated tests are not included yet; see [Known limitations](#known-limitations-and-future-work).

---

## Known limitations and future work

- **Automated tests.** The next step would be Vitest + Supertest for the API (validation, CRUD, areas route with a mocked `fetch`: cache hit, upstream failure, timeout) and React Testing Library for the autocomplete and the form.
- **Editing ads.** The `UPDATE` query exists, but the `PUT` endpoint and edit page aren't finished.
- **Places API errors** all return a single 502. They could be split into "invalid search" (400), "rate limited" (503) and "timeout" (504).
- **Autocomplete debounce.** A request is sent on every keystroke after the third character. Redis absorbs repeated terms, but a ~300ms debounce would reduce calls further.
- **Validation error format.** `POST` returns zod's issue list. A `{ error, fieldErrors }` shape would let the frontend show server-side errors under each field.
- **Mobile layout.** The layout is fluid, but breakpoints for very small screens would improve it.
