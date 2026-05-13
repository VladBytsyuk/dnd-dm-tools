# Step 5: Generic SQL Stores

## Goal

Add generic DAO-backed stores that isolate SQL DAO access and transactions from repositories.

## Current Context

`BaseRepository` currently reads from small/full DAOs and calls `database.transaction` directly for fetched full saves, user upserts, and deletes. This keeps repositories tied to `DB` and concrete DAO behavior.

## Scope

- Add generic SQL read/write store adapters for normal small/full DAO pairs.
- Move transaction handling for generic write flows into stores.
- Persist only domain models.

## Out of Scope

- Do not handle races, classes, DM screen, character sheets, or seed flow in this generic store step.
- Do not fully rewrite repositories yet.
- Do not change SQL schemas.

## Implementation Tasks

- Add a generic read store wrapping small and full DAOs.
- Add a generic write store wrapping small and full DAOs plus a transaction dependency.
- Implement reads for all small items, small names, small by name, full by name, and full by URL.
- Implement `saveFetchedFull`.
- Implement `upsertUserItem` using explicit full and projected small items.
- Implement `deleteByUrl` for both full and small records.
- Ensure store methods own transaction boundaries for multi-write operations.

## Tests

- Store reads call the expected DAO methods.
- `saveFetchedFull` writes only full records.
- `upsertUserItem` creates or updates both small and full records.
- `deleteByUrl` removes both records.
- Transaction tests prove commit on success and rollback propagation on error.

## Acceptance Criteria

- Generic stores hide direct DAO access from future simple repositories.
- Stores do not know about TTG DTOs or services.
- No repository behavior changes are required yet.

## Verification

```bash
npm run test -- --run
npm run build
```
