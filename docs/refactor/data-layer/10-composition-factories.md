# Step 10: Composition Factories

## Goal

Centralize repository dependency assembly so feature classes do not manually wire data-layer internals.

## Current Context

Feature classes currently construct repositories with `DB`, and repositories pull concrete DAOs from `DB`. After stores, services, mappers, and projectors exist, construction needs a single composition layer.

## Scope

- Add repository factories.
- Update feature construction to use factories.
- Add wiring tests.

## Out of Scope

- Do not change feature UI behavior.
- Do not introduce new repository public methods.
- Do not change seed flow.

## Implementation Tasks

- Add repository factory functions or classes for each feature.
- Each factory assembles the correct store, service, mapper, and projector dependencies.
- Prefer sharing common service instances where appropriate.
- Update feature classes to receive repositories from factories or factory-produced dependencies.
- Keep plugin startup behavior stable.

## Tests

- Factory tests prove each feature uses the intended store/service/mapper/projector combination.
- Startup-oriented tests or existing feature tests prove construction still works.

## Acceptance Criteria

- Feature classes no longer require repositories to know about `DB` internals.
- Dependency wiring is centralized and test-covered.
- Existing features initialize successfully.

## Verification

```bash
npm run test -- --run
npm run svelte-check
npm run build
```
