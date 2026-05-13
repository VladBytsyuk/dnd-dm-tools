# Step 7: Refactor Simple Repositories

## Goal

Move simple TTG-backed repositories onto the new store/service/mapper/projector architecture first.

## Current Context

Bestiary, Spellbook, Arsenal, Armory, Equipment, Artifactory, and Feats mostly use the generic `BaseRepository` flow and do not have the same custom persistence rules as races, classes, backgrounds, DM screen, or character sheets.

## Scope

Refactor these repositories:

- Bestiary
- Spellbook
- Arsenal
- Armory
- Equipment
- Artifactory
- Feats

## Out of Scope

- Do not refactor races, classes, backgrounds, DM screen, or character sheets in this step.
- Do not change UI components.
- Do not change seed flow.

## Implementation Tasks

- Update simple repositories to receive store, service, mapper, and projector dependencies.
- Preserve repository public methods and grouping/filter collection behavior.
- Implement cache-first full-item reads through the store.
- On cache miss, call service, mapper, store, then return the mapped domain item.
- Use projectors for user saves instead of spreading/casting full items into small items.
- Remove direct `DB`, concrete DAO, and `requestUrl` dependencies from these repositories.
- Keep a compatibility base class only if it no longer owns HTTP or DAO details.

## Tests

- Repository orchestration tests for cache hit, cache miss, service failure, save, delete, and cache invalidation.
- Existing repository tests for filters, grouping, names, and full-item lookups.

## Acceptance Criteria

- Simple repositories import no concrete SQL DAOs.
- Simple repositories import no Obsidian `requestUrl`.
- UI-facing repository methods keep the same behavior.
- All simple repository tests pass.

## Verification

```bash
npm run test -- --run
npm run svelte-check
npm run build
```
