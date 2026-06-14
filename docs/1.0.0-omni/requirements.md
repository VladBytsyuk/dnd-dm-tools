# Omni Mode Requirements

## Objectives

- Reduce ribbon and side-panel clutter without removing existing tools.
- Preserve the current independent-panel workflow for users who prefer it.
- Allow two feature panels to remain visible simultaneously in one Obsidian side panel.

## Functional Requirements

- FR-001: Settings shall expose Separate and Omni modes using Russian UI copy.
- FR-002: A mode change shall immediately reconcile plugin views and ribbon buttons.
- FR-003: Separate mode shall expose one toggle for every panel.
- FR-004: A disabled Separate panel shall remain reachable from an explicit item link.
- FR-005: Omni mode shall expose one ribbon button and one Obsidian view.
- FR-006: An empty Omni workspace shall offer a panel picker.
- FR-007: Users shall add, activate, close, reorder, and move feature tabs.
- FR-008: A feature shall have at most one Omni tab.
- FR-009: Omni shall support one tile and two equal vertically stacked tiles.
- FR-010: Switching to one tile shall append tile-two tabs to tile one without duplication.
- FR-011: Each tile shall track its own ordered tabs and active tab.
- FR-012: Global search shall query searchable repositories and group results by feature.
- FR-013: Selecting a result shall activate the feature in the focused tile and open its detail.
- FR-014: Layout, tabs, active tabs, and focused tile shall persist.
- FR-015: Item, filter, search, and navigation history shall not persist.
- FR-016: All 13 existing panels shall support both presentation modes.

## Non-Functional Requirements

- NFR-001: Existing repository and database contracts shall remain unchanged.
- NFR-002: Search failures in one repository shall not prevent results from other repositories.
- NFR-003: Stale asynchronous search responses shall not overwrite newer results.
- NFR-004: Tab and layout operations shall be keyboard accessible.
- NFR-005: Svelte checks, tests, coverage, and production build shall pass.
- NFR-006: Existing 0.9.0 users shall retain the current panel experience by default.

## Acceptance Criteria

- Fresh install: Omni, one empty tile, one Omni ribbon button.
- Upgrade: Separate, all panel toggles enabled, existing ribbon buttons visible.
- Separate toggle: ribbon button disappears; an explicit item link still opens the panel.
- Omni split: tabs can be moved between two rows and remain after restart.
- Global result: opens the correct full item in the correct feature tab.
- Mode switch: incompatible plugin leaves close and the selected mode becomes usable immediately.

## Scope Boundaries

In scope:

- Plugin settings, view/ribbon lifecycle, panel composition, Omni search, tabs, persistence, tests, and documentation.

Out of scope:

- Database schema changes, arbitrary resizable layouts, duplicate feature tabs, item-document tabs,
  persisted item history, and visual redesign of existing feature content.

## Assumptions

- The presence of `database.db` is sufficient to distinguish an upgrade from a fresh install.
- “Two tiles in a column” means two rows with equal height.
- Obsidian desktop and mobile use the same persisted settings model.

