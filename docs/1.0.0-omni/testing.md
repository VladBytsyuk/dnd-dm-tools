# Помощник ДМа Test Strategy

## Automated Coverage

- Missing data produces an empty Assistant workspace.
- Legacy Assistant data preserves layout and tabs.
- Legacy standard data resets and requests legacy-view cleanup.
- Malformed, unknown, and duplicate tabs normalize safely.
- Only the Assistant view and ribbon entry are registered.
- Panel/item routing always creates or activates Assistant tabs.
- Search failures are isolated and stale requests do not replace current results.
- Tab add, close, reorder, cross-tile movement, split, collapse, and persistence remain valid.

## Manual Acceptance

1. Upgrade a saved Assistant workspace and verify state restoration.
2. Upgrade a standard-mode workspace and verify legacy leaves close and the Assistant opens empty.
3. Open all panel types, use cross-feature links, and select global search results.
4. Restart after moving tabs between two tiles and verify restoration.
5. Repeat tab operations with keyboard controls.

## Release Gates

- Warning-free Svelte check.
- Full tests and coverage command pass.
- Production build and diff check pass.
- No independent panel view or plugin settings code remains.
