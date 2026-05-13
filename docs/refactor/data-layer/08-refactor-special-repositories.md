# Step 8: Refactor Special Repositories

## Goal

Move custom repositories onto the new architecture after specialized stores and mappers are ready.

## Current Context

Backgrounds, classes, races, DM screen, and character sheets each have behavior that cannot be represented by the generic repository path alone.

## Scope

Refactor these repositories:

- Backgrounds
- Classes
- Races
- DM Screen
- Character Sheets

## Out of Scope

- Do not change UI components.
- Do not change database schema unless a locked regression test proves current schema cannot preserve behavior.
- Do not change seed flow in this step.

## Implementation Tasks

- Refactor background repository to use service/mapper/store flow for JSON plus associated HTML.
- Refactor class repository to use class store for base classes and archetypes, and mapper/service flow for fragment HTML.
- Refactor race repository to use race store for nested subrace persistence and hierarchy reads.
- Refactor DM screen repository to use store partial-description update behavior.
- Refactor character sheet repository to use local import mapper/store flow and remain API-free.
- Preserve all public repository methods used by features and UI event listeners.
- Remove direct `DB`, concrete DAO, and `requestUrl` dependencies from these repositories.

## Tests

- Background loads JSON plus associated HTML.
- Class loads JSON plus fragment HTML and still separates base classes from archetypes.
- Race saves and reads nested subraces.
- DM screen refreshes missing descriptions without breaking root/children reads.
- Character sheet import generates unique URLs and persists only domain models.

## Acceptance Criteria

- No special repository imports concrete SQL DAO classes.
- No special repository imports Obsidian `requestUrl`.
- Character sheet repository remains local-only.
- All locked regression scenarios pass.

## Verification

```bash
npm run test -- --run
npm run svelte-check
npm run build
```
