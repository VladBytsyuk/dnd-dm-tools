# Step 4: Mappers and Projectors

## Goal

Move source DTO conversion and full-to-small projection out of repositories.

## Current Context

Generic repositories currently cast API responses to full domain models. Race mapping has custom shape handling in `RacesRepository`. User saves in `BaseRepository` derive small items by spreading full items and normalizing `type`, which is unsafe as a general projection strategy.

## Scope

- Add source-specific full-item mappers.
- Add full-to-small projectors.
- Add character sheet import mapping separate from persistence.

## Out of Scope

- Do not rewrite repository persistence flow yet.
- Do not remove old repository mapping helpers until repository migration steps.
- Do not change static seed data.

## Implementation Tasks

- Add mappers for simple TTG entities whose response shape already mostly matches domain shape.
- Add a race mapper that handles name objects/strings, source defaults, URL fallback, and nested subraces.
- Add a class mapper that keeps requested URL, associated fragment URL, and associated HTML behavior.
- Add a background mapper that keeps requested URL and associated URL/HTML behavior.
- Add a DM screen mapper for description refresh responses.
- Add a character sheet import mapper that parses JSON and returns a domain sheet without writing to DB.
- Add projectors for every saved editable entity that needs a small item persisted beside its full item.

## Tests

- Mapper tests for URL normalization and missing optional fields.
- Race mapper tests for nested subraces.
- Class/background mapper tests for associated URL and HTML fields.
- Character sheet mapper tests for invalid JSON, invalid `jsonType`, missing name, and successful import data.
- Projector tests proving output matches small DAO expectations.

## Acceptance Criteria

- Mappers do not fetch data.
- Mappers do not write to DB.
- Projectors replace planned full-to-small casts in future repository code.

## Verification

```bash
npm run test -- --run
npm run build
```
