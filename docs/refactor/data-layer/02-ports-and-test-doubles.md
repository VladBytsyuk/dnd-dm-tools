# Step 2: Ports and Test Doubles

## Goal

Introduce stable interfaces and test doubles for the future service, mapper, projector, and store layers without changing production behavior.

## Current Context

Current repositories depend directly on `DB`, concrete DAOs, and Obsidian `requestUrl`. The new architecture needs ports that allow repositories to be tested as orchestration units.

## Scope

- Add `src/data/ports/`.
- Add shared data-layer interfaces.
- Add reusable test doubles for future repository orchestration tests.

## Out of Scope

- Do not rewrite repositories in this step.
- Do not move `requestUrl` usage yet.
- Do not change database initialization or seed flow.

## Implementation Tasks

- Add `ServiceResult<T>`:

```ts
export type ServiceResult<T> =
	| { ok: true; value: T }
	| { ok: false; reason: "not-found" | "network" | "invalid-response"; error?: unknown };
```

- Add service ports for full-item reads, HTML reads, seed reads, and imports.
- Add `FullItemMapper<TResponse, TFull>`.
- Add `SmallItemProjector<TFull, TSmall>`.
- Add `SeedMapper<TSeed, TSmall>`.
- Add `ItemReadStore<TSmall, TFull, TFilter>`.
- Add `ItemWriteStore<TSmall, TFull>`.
- Add `TransactionalStore`.
- Add test doubles for services, mappers, stores, projectors, and transaction spying.

## Tests

- Add small compile-oriented tests for the test doubles if useful.
- Existing tests must continue passing unchanged.

## Acceptance Criteria

- Ports compile under current TypeScript settings.
- No production behavior changes.
- Test doubles can control service success/failure and observe mapper/store call order.

## Verification

```bash
npm run test -- --run
npm run build
```
