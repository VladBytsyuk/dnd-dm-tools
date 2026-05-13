# Step 1: Characterization Tests

## Goal

Lock current behavior before refactoring the data layer, especially around cache misses, persistence, transactions, and feature-specific repository behavior.

## Current Context

Repository tests already exist under `test/data/repository/`, but much of the current behavior is tested through DAO-backed repositories rather than through explicit orchestration expectations. The refactor will change internals while preserving behavior, so these tests must catch accidental regressions.

## Scope

- Add tests that describe current externally visible repository behavior.
- Add tests for the special cases listed in Step 0.
- Prefer focused tests that will remain useful after dependencies are replaced with ports.

## Out of Scope

- Do not add production services, stores, mappers, or ports in this step.
- Do not edit repository production logic except for test-only compatibility if absolutely required.
- Do not change seed behavior.

## Implementation Tasks

- Add cache-hit tests proving full-item reads return cached items without remote fetch behavior.
- Add cache-miss tests proving remote fetch results are persisted and returned.
- Add failure tests proving failed remote fetches return `null` and do not persist.
- Add save tests proving user saves update both small and full records where the entity has separate DAOs.
- Add delete tests proving both small and full records are removed and repository small/filter caches are invalidated.
- Add transaction tests for multi-write operations.
- Lock race behavior for nested subraces, parent URLs, and hierarchy reads.
- Lock class behavior for base-class filtering, archetype reads, and fragment HTML URL construction.
- Lock background behavior for associated HTML.
- Lock DM screen behavior for missing-description refresh.
- Lock character sheet behavior for import validation and unique URL generation.

## Tests

Update or add tests under `test/data/repository/` and related DAO tests where existing behavior is only observable through SQL persistence.

## Acceptance Criteria

- Tests fail if a repository stops preserving current public behavior.
- Tests are behavior-oriented, not tied to the final service/store implementation.
- Special cases have explicit coverage before their repositories are rewritten.

## Verification

```bash
npm run test -- --run
```
