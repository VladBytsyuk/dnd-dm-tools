# Помощник ДМа Requirements

## Functional Requirements

- FR-001: The plugin shall expose one Obsidian view and ribbon entry named `Помощник ДМа`.
- FR-002: The empty workspace shall offer a panel picker.
- FR-003: Users shall add, activate, close, reorder, and move feature tabs.
- FR-004: A feature shall have at most one tab.
- FR-005: The workspace shall support one tile and two equal vertically stacked tiles.
- FR-006: Collapsing to one tile shall merge both tab lists without duplication.
- FR-007: Global search shall query searchable repositories and group results by feature.
- FR-008: Selecting a result or following a cross-feature link shall open the target tab and item.
- FR-009: Layout, tab order, focused tile, and active tabs shall persist.
- FR-010: All 13 existing tools shall be available in the Assistant.
- FR-011: Legacy standard-mode leaves shall close during migration.

## Non-Functional Requirements

- Existing repository, database, command, and markdown processor contracts remain unchanged.
- One failed search provider shall not prevent other results.
- Tab and layout operations remain keyboard accessible.
- Svelte checks, tests, coverage, and production build shall pass.

## Scope Boundaries

Out of scope: independent feature views, per-panel ribbon buttons, plugin settings, duplicate feature
tabs, arbitrary resizable layouts, and persisted item/search history.
