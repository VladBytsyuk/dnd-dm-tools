# TTG Integration

## Status

- Version: 1.0.1
- Updated: 2026-08-09
- Audience: maintainers working on repository services, TTG mappers, and remote item loading
- API contract reference: [`ttg-openapi.json`](./ttg-openapi.json)

## Overview

The plugin loads bundled D&D 5e data into SQL.js, then fetches uncached full items from TTG when a user opens an item that is not present in the local database. Runtime TTG access is isolated to `src/data/services/`.

`TtgApiService` owns HTTP transport and TTG endpoint selection. `TtgService` adapts returned TTG payloads into the older domain shapes consumed by repositories and UI components.

The plugin targets D&D 5e 2014 content. It should avoid 2024 TTG results when a 2014-compatible result is available.

## Runtime Flow

1. A repository checks local full-item storage.
2. On cache miss, the repository calls a `FullItemReadService`.
3. `TtgApiService` tries the mapped TTG v2 detail endpoint.
4. If v2 detail lookup returns 404, it tries v2 search and chooses a compatible result.
5. If v2 direct, search, or retry fails, it falls back to the legacy v1 endpoint.
6. `TtgService` adapts v2 responses into the plugin domain shape.
7. The repository mapper normalizes the response and persists it locally.

Repositories must not import Obsidian `requestUrl` or construct TTG URLs directly.

## Endpoint Mapping

| Plugin URL prefix | Primary TTG endpoint | Notes |
| --- | --- | --- |
| `/spells/{slug}` | `GET https://new.ttg.club/api/v2/spells/{slug}` | Search fallback uses `/api/v2/spells/search?q={slug}`. |
| `/bestiary/{slug}` | `GET https://new.ttg.club/api/v2/bestiary/{slug}` | Search fallback uses `/api/v2/bestiary/search?q={slug}`. |
| `/classes/{slug}` | `GET https://new.ttg.club/api/v2/classes/{slug}` | Class HTML fragments still use the TTG HTML service. |
| `/races/{slug}` | `GET https://new.ttg.club/api/v2/species/{slug}` | TTG v2 renamed races to species. |
| `/backgrounds/{slug}` | `GET https://new.ttg.club/api/v2/backgrounds/{slug}` | Associated HTML may come from `associatedUrl` or returned `url`. |
| `/feats/{slug}` | `GET https://new.ttg.club/api/v2/feats/{slug}` | Uses standard v2 detail and search fallback. |
| `/weapons/{slug}` | `GET https://new.ttg.club/api/v2/item/{slug}` | Mundane item-like resources are routed through v2 item. |
| `/armor/{slug}`, `/armors/{slug}` | `GET https://new.ttg.club/api/v2/item/{slug}` | Both legacy armor prefixes map to v2 item. |
| `/items/{slug}`, `/equipment/{slug}` | `GET https://new.ttg.club/api/v2/item/{slug}` | Mundane equipment uses v2 item. |
| `/items/magic/{slug}` | `GET https://new.ttg.club/api/v2/magic-items/{slug}` | Magic item URLs use the v2 magic-items resource. |
| `/screens/{slug}` | `POST https://ttg.club/api/v1/screens/{slug}` | DM screen runtime requests remain legacy. |

Legacy fallback uses `POST https://ttg.club/api/v1/{plugin-path}` for non-screen content when v2 lookup cannot return a usable object.

## Edition and Source Selection

When v2 detail lookup fails and v2 search returns candidates, the service:

- filters out candidates whose `srdVersion` contains `2024`
- prefers candidates matching configured source books
- prefers URL or name matches for the requested slug
- falls back to the first compatible non-2024 candidate

This preserves D&D 5e 2014 behavior while still allowing legacy v1 fallback when v2 search is unavailable or incomplete.

## Response Adaptation

TTG v2 DTOs do not always match the plugin domain models. `TtgService` adapts response objects before repositories map and persist them.

Important adaptation rules:

- `name` is normalized to `{ rus, eng }`.
- `source` is normalized to the legacy source shape with `shortName`, `name`, and `group`.
- markup-like descriptions are converted to strings.
- races use v2 `species` payloads but preserve plugin race fields.
- bestiary responses always receive UI-safe defaults for nested fields such as `size`, `senses`, `hits`, `ability`, arrays, and images.
- legacy v1 payloads with existing legacy source shape are preserved instead of being remapped as v2.

Monster responses are additionally normalized by `MonsterMapper` with `normalizeMonsterForEditing()` before being returned to the UI or cached. This prevents read-only rendering crashes when TTG omits optional nested fields.

## Error Handling

Obsidian `requestUrl` can either return a non-200 response or throw an error such as `Request failed, status 404`. `TtgApiService` converts both forms into `ServiceResult` failures and treats thrown 404s like normal 404 responses for fallback purposes.

Repository cache-miss failures should be visible in the developer console. Standard repositories log remote load failures with the requested URL and failure reason, then return `null` instead of throwing.

`BaseSidePanelUi` shows a generic load error when an item cannot be opened and logs the item URL. Uncaught UI render errors should be treated as missing mapper or response-adapter defaults.

## Validation

The current TTG integration changes were validated with:

- `npx vitest run test/data/services/TtgService.test.ts --coverage=false`
- `npm run svelte-check`
- `npx vitest run --coverage=false`
- `npm run build`

Coverage includes v2 direct requests, v2 search fallback, 2024 filtering, legacy fallback, thrown Obsidian request errors, legacy monster preservation, and v2 bestiary defaults.

## Maintenance Checklist

- Update `docs/integrations/ttg-openapi.json` when TTG public API contracts change.
- Keep endpoint routing in `TtgApiService` aligned with this document.
- Add or update `TtgService` adapters when a feature consumes a new v2 DTO shape.
- Add regression tests for every new fallback rule or response-shape normalization.
- Keep repository failures logged, but keep Obsidian UI errors user-readable.

## Assumptions

- Assumption: TTG v2 remains the preferred runtime API for supported content types.
  Impact if wrong: endpoint mapping and fallback priority should be revised.
- Assumption: The plugin continues to target D&D 5e 2014 data by default.
  Impact if wrong: search filtering and source-book selection need product and data-model review.
