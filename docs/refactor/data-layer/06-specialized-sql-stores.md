# Step 6: Specialized SQL Stores

## Goal

Move feature-specific persistence rules into dedicated stores before rewriting special repositories.

## Current Context

Several repositories bypass generic behavior because their persistence or read model is specialized. These rules must not be lost when repositories stop touching concrete DAOs.

## Scope

- Add specialized stores for races, classes, DM screen, and character sheets.
- Keep all direct DAO-specific behavior inside stores.

## Out of Scope

- Do not change UI components.
- Do not change seed ownership.
- Do not change database schema unless a locked test proves it is required.

## Implementation Tasks

- Add `RaceStore` with race tree save, subrace reads, top-level reads, and hierarchy reconstruction.
- Add `ClassStore` with base-class reads, archetype reads, and full-class persistence.
- Add `DmScreenStore` with root reads, children reads, children counts, name/url reads, and partial-description update.
- Add `CharacterSheetStore` with optimized small reads, full reads, import save, delete, and URL uniqueness checks.
- Ensure each store uses transactions for multi-write operations.

## Tests

- Race tree save/read with nested subraces.
- Class base-class filtering and archetype reads.
- DM screen root/children reads and description update without breaking tree reads.
- Character sheet small/full reads, unique URL checks, save, and delete.

## Acceptance Criteria

- Special repositories can be rewritten without direct DAO imports.
- Specialized store behavior matches locked characterization tests.
- Stores persist domain models only.

## Verification

```bash
npm run test -- --run
npm run build
```
