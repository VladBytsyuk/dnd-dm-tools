# Step 9: Seed Flow Refactor

## Goal

Move initial static data ownership out of DAOs and into seed services/stores after repository behavior is stable.

## Current Context

`Dao.fillTableWithData()` calls `getLocalData()`, and many small DAOs override `getLocalData()` to return imported static data. `DB.initialize()` currently creates tables and fills empty tables through every DAO.

## Scope

- Add seed services for static local data.
- Add seed mappers where static source shape differs from domain shape.
- Add a seed store to persist seed domain models.
- Change database initialization to delegate table filling to seed orchestration.

## Out of Scope

- Do not refactor repositories in this step.
- Do not change static data contents.
- Do not change SQL schemas unless tests require it.

## Implementation Tasks

- Add seed service interfaces and implementations for each currently seeded table.
- Add seed mappers only where the static source shape is not already domain-safe.
- Add `SeedStore` that checks whether a table is empty and writes seed data through DAOs.
- Update `DB.initialize()` so it creates tables first and delegates seed filling to the seed orchestration layer.
- Update class migration repopulation to use the new seed path.
- Remove or deprecate DAO `getLocalData()` only after equivalent seed coverage exists.

## Tests

- Empty database receives seed data.
- Non-empty database is not duplicated.
- Seed failures do not partially corrupt unrelated tables.
- DAO tests are updated so DAOs are no longer responsible for source data ownership.

## Acceptance Criteria

- DAOs no longer own static source data.
- `DB` remains infrastructure and lifecycle code, not source-data mapping code.
- Existing startup behavior still produces populated tables.

## Verification

```bash
npm run test -- --run
npm run build
```
