# Data Layer Refactor Plan

This folder splits the source-independent data layer refactor into sequential implementation steps. Run the steps in order; each file is intended to be enough context for a future implementation session.

## Target Architecture

- Repositories orchestrate use cases and keep the existing UI-facing `Repository<SmallItem, FullItem, Filter>` contract.
- Services fetch or import raw source data.
- Mappers convert source data into domain models.
- Projectors derive small/list models from full domain models.
- Stores persist and query domain models through DAOs.
- DAOs remain SQL table adapters.
- `DB` remains SQL infrastructure and persistence lifecycle code.

## Execution Order

1. [Target architecture and assumptions](00-target-architecture-and-assumptions.md)
2. [Characterization tests](01-characterization-tests.md)
3. [Ports and test doubles](02-ports-and-test-doubles.md)
4. [TTG services](03-ttg-services.md)
5. [Mappers and projectors](04-mappers-and-projectors.md)
6. [Generic SQL stores](05-generic-sql-stores.md)
7. [Specialized SQL stores](06-specialized-sql-stores.md)
8. [Refactor simple repositories](07-refactor-simple-repositories.md)
9. [Refactor special repositories](08-refactor-special-repositories.md)
10. [Seed flow refactor](09-seed-flow-refactor.md)
11. [Composition factories](10-composition-factories.md)
12. [Final cleanup and docs](11-final-cleanup-and-docs.md)

## Global Rules

- Preserve the current UI-facing repository API unless a step explicitly says otherwise.
- Keep database schema unchanged unless a regression test proves the current schema cannot support existing behavior.
- Do not mix seed-flow migration into repository/service/store extraction.
- Treat `src/data/database/` as the real database folder.
- Keep Obsidian UI behavior stable while changing the data layer underneath it.

## Standard Verification

Run these after each step when feasible, and always after the final step:

```bash
npm run test -- --run
npm run svelte-check
npm run build
```
