# Step 11: Final Cleanup and Docs

## Goal

Remove obsolete data-layer coupling and update documentation to describe the final architecture.

## Current Context

Earlier steps may leave compatibility helpers, deprecated DAO methods, or outdated documentation while preserving behavior during the migration.

## Scope

- Remove obsolete repository HTTP and DAO paths.
- Remove or formally deprecate old seed hooks.
- Update architecture documentation.
- Run full automated and manual verification.

## Out of Scope

- Do not add new feature behavior.
- Do not perform unrelated UI refactors.
- Do not change data contents.

## Implementation Tasks

- Remove old `fetchFromAPI`, `fetchHtmlFromAPI`, `mapApiResponse`, and `getApiRequestBody` paths.
- Remove direct repository imports of Obsidian `requestUrl`.
- Remove direct repository imports of concrete SQL DAO classes.
- Remove or formally deprecate DAO `getLocalData()`.
- Update `docs/architecture.md`.
- Update `docs/data-layer.md`.
- Update `docs/adding-new-feature.md`.
- Update repo-root `AGENTS.md` if present.
- Fix stale path references from `src/data/databse` to `src/data/database`.

## Tests

- Full automated test suite.
- Type checking and production build.
- Manual Obsidian smoke check.

## Acceptance Criteria

- Repositories depend on stores, services, mappers, and projectors instead of `DB`, DAOs, or `requestUrl`.
- DAOs are SQL table adapters only.
- Documentation matches the final implementation.
- Full verification passes.

## Verification

```bash
npm run test -- --run
npm run svelte-check
npm run build
```

Manual smoke check:

- Side panels open.
- Filters work.
- Cached full item opens.
- Uncached full item fetches.
- Background/class HTML renders.
- Race subrace hierarchy works.
- DM screen expansion works.
- Character sheet import generates unique URLs.
