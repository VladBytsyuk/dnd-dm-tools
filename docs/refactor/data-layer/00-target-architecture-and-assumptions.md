# Step 0: Target Architecture and Assumptions

## Goal

Define the shared architecture, assumptions, and behavior constraints for every later data-layer refactor step.

## Current Context

The current repositories mix orchestration, DAO access, transactions, TTG HTTP access, API response mapping, and cache invalidation. `BaseRepository` imports Obsidian `requestUrl`, receives `DB`, and directly reads/writes DAOs. Several repositories also override fetch or persistence behavior for feature-specific cases.

The real database folder is `src/data/database/`.

## Scope

- Establish the target responsibilities.
- Establish cache and failure behavior.
- Identify special cases that must be preserved.
- Define assumptions used by all later steps.

## Out of Scope

- No production code changes.
- No tests added in this step.
- No database schema changes.

## Target Responsibilities

- Repositories orchestrate use cases, cache-first reads, grouping, filters, and cache invalidation.
- Services fetch or import raw source data and return `ServiceResult`.
- Mappers convert source DTOs or import payloads into domain models.
- Projectors convert full domain models into small/list domain models.
- Stores own DAO access, SQL transactions, and persistence-specific rules.
- DAOs only adapt SQL tables to domain model reads/writes.
- `DB` owns SQL.js initialization, database file persistence, table creation, and transaction infrastructure.
- Factories assemble repositories from stores, services, mappers, and projectors.

## Cache Policy

- Reads are cache-first.
- On full-item cache hit, repositories return the stored domain model and do not call services.
- On cache miss, repositories call service, map the successful response, store the domain model, and return it.
- Explicit refresh operations are not part of this refactor.

## Failure Policy

- `ServiceResult` failure maps back to existing UI-facing repository behavior.
- Full-item read failures return `null`.
- Save and delete failures return `false`.
- Character sheet import may continue throwing validation errors because current import behavior is user-facing and exception-based.
- Failed service responses must not persist partial or invalid data.

## Special Cases To Preserve

- Races have nested subraces and parent-child persistence.
- Classes expose base classes separately from archetypes and fetch associated fragment HTML.
- Backgrounds fetch TTG JSON and associated HTML.
- DM screen items can exist in cache without a description; missing description is a partial cache miss.
- Character sheets are local-only and generate unique URLs during import.

## Assumptions

- The UI-facing `Repository<SmallItem, FullItem, Filter>` contract stays stable.
- Database schema stays unchanged unless a locked regression test proves a schema fix is required.
- Seed-flow extraction is delayed until after repositories, services, mappers, and stores are stable.
- TTG service extraction applies to TTG-backed entities only.
- Character sheet import remains local-only.

## Tests

No tests are required for this context-only step.

## Acceptance Criteria

- Later step docs reference these assumptions instead of redefining them.
- No implementation step contradicts the cache, failure, or special-case policies here.

## Verification

No command is required for this context-only step.
