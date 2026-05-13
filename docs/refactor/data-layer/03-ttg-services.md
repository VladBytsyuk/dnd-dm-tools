# Step 3: TTG Services

## Goal

Move TTG HTTP access out of repositories and into services that return `ServiceResult`.

## Current Context

`BaseRepository` currently imports `requestUrl`, constructs `https://ttg.club/api/v1/${url}` JSON requests, handles HTTP status, parses JSON, and returns `null` on errors. Some repositories override request bodies or call HTML fetch helpers.

## Scope

- Add low-level TTG JSON and HTML services.
- Add a TTG composite service for repository-facing operations.
- Preserve current request behavior and error tolerance.

## Out of Scope

- Do not fully rewrite repositories yet.
- Do not move DTO-to-domain mapping yet.
- Do not change persistence behavior.

## Implementation Tasks

- Add `TtgApiService` for TTG JSON `POST` calls.
- Add `TtgHtmlService` for TTG HTML `GET` calls.
- Add `TtgService` as the preferred composite dependency.
- Move TTG base URL construction, request bodies, status handling, response parsing, and thrown request errors into services.
- Support entity-specific options currently represented by repository `getApiRequestBody`, especially race and class source-book filters.
- Expose operations needed later:
  - `getFullItem(url, options?)`
  - `getClassWithHtml(url, options?)`
  - `getBackgroundWithHtml(url)`
  - `getDmScreenDescription(url)`
  - `getRaceTree(url, options?)`

## Tests

- Service success for JSON and HTML.
- Non-200 maps to `ServiceResult` failure.
- Malformed JSON or invalid response shape maps to `invalid-response` where detectable.
- Thrown `requestUrl` errors map to `network`.
- Service does not write to DB.

## Acceptance Criteria

- Services are the only new code that imports Obsidian `requestUrl`.
- Existing repositories can still function while migration continues.
- Service tests cover failure reasons.

## Verification

```bash
npm run test -- --run
npm run build
```
