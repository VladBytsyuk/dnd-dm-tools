# UIKit

The UIKit is the plugin-local collection of existing Svelte components. Its purpose is to reduce duplicated UI logic, keep list/detail behavior consistent across features, and centralize shared styling through semantic tokens.

The `design-system` workspace provides the shared visual components. Plugin adapters in `src/ui/design-system/` connect those components to domain models and Obsidian services. This is the only supported design; the former interface toggle and its alternate components have been removed.

See also [UI Layer](./ui-layer.md).

## Directory Structure

```
src/ui/layout/uikit/
├── organisms/
│   ├── UiCollapsibleGroup.svelte
│   ├── UiEmptyState.svelte
│   ├── UiItemGroup.svelte
│   └── UiSearchToolbar.svelte
├── AutocompleteInput.svelte
├── BaseSidePanelUi.svelte
├── FilterBlock.svelte
├── FiltersOverlay.svelte
├── HtmlBlock.svelte
├── PanelTypeColor.ts
└── PanelTypeTint.svelte
```

## Component Roles

### Organisms

Entity cards are rendered by `RedesignedSmallItem` and `RedesignedFullItem`, using the design-system components.

Reusable high-level UI blocks used directly by feature screens.

- `UiItemGroup.svelte` renders grouped small items in collapsible sections.
- `UiSearchToolbar.svelte` renders the shared search/action row for feature panels.
- `UiEmptyState.svelte` renders empty list and empty search states.

### Shared Shell and Utilities

- `BaseSidePanelUi.svelte` is the generic browser shell for most repository-backed Assistant panels.
- `FiltersOverlay.svelte` and `FilterBlock.svelte` provide shared filter UI.
- `AutocompleteInput.svelte`, `HtmlBlock.svelte`, and `PanelTypeTint.svelte` are reusable support components used by multiple features.

## BaseSidePanelUi Contract

`BaseSidePanelUi.svelte` is the default Assistant panel browser implementation for most data-backed features.

It expects:

- `panelKey`
- `initialFullItem`
- `initialFilters`
- `uiEventListener`
- `repository`
- `filterConfig`
- `groupTitleBuilder`
- optional `filterDisplayTransform`
- optional `filterApplyTransform`

It owns:

- search input and toolbar actions
- grouped list rendering
- empty search state
- filter overlay wiring
- switching between list and full-item views

Prefer this shell unless a feature has materially different browser behavior. `CharacterSheetSidePanelUi.svelte` and `DmScreenSidePanelUi.svelte` are current examples of justified custom panel implementations.

### Svelte 5 State Contract

Shared UIKit components are reused broadly, so Svelte warnings in this folder quickly multiply across the dev build.

When writing or refactoring UIKit components:

- Use `$derived(...)` for values calculated from props, such as active filters, computed labels, class names, image counts, and item metadata.
- Use helper functions for intentional initial state derived from props, such as initial filter state or initial navigation stacks.
- Use `$effect.pre(...)` to sync editable local inputs from changing props.
- Create prop-dependent listeners, managers, and controllers through closures or lifecycle callbacks.
- Keep `npm run svelte-check` at `0 errors and 0 warnings` after UIKit edits.

## Design Tokens

Shared visual styling is defined in `styles.css` through `--dnd-ui-*` CSS custom properties.

### Foundation Tokens

Foundation tokens provide semantic primitives for styling:

- text: `--dnd-ui-text-*`
- surfaces: `--dnd-ui-surface-*`
- borders: `--dnd-ui-border-*`
- spacing: `--dnd-ui-space-*`
- radii: `--dnd-ui-radius-*`
- typography: `--dnd-ui-font-size-*`, `--dnd-ui-font-weight-*`, `--dnd-ui-line-height-*`
- motion and shadow: `--dnd-ui-duration-*`, `--dnd-ui-shadow-*`

### Pattern Tokens

Pattern tokens define shared UI structures built on top of the foundation tokens:

- `--dnd-ui-pattern-list-item-*`
- `--dnd-ui-pattern-group-*`
- `--dnd-ui-pattern-input-*`
- `--dnd-ui-pattern-modal-*`
- `--dnd-ui-pattern-table-*`

### Token Rules

- Prefer `--dnd-ui-*` tokens over raw Obsidian variables in component styles.
- Raw Obsidian variables should mostly stay inside token definitions.
- If a neutral spacing, radius, border, or surface value is reused, it should become a token instead of being copied into component-local CSS.

## Recommended Composition Patterns

For new or refactored UI:

- small entity list items use `RedesignedSmallItem`
- grouped feature-panel lists should compose `UiItemGroup`
- standard repository-backed Assistant panels should compose `BaseSidePanelUi.svelte`
- entity detail pages use `RedesignedFullItem`
- rich HTML body fragments should use `HtmlBlock.svelte`

Feature-local Svelte components should mostly adapt data into shared UIKit components, not reimplement shared chrome.

## Guardrails

- Do not create proxy `.svelte` components that only forward props to another Svelte component.
- Do not introduce duplicated neutral colors, radii, spacing, or hover states when tokens already exist.
- Do not build a feature-local browser shell if `BaseSidePanelUi.svelte` can cover the behavior.
- Use feature-specific styling only for domain-specific visuals, not for generic list/detail chrome.
- Do not capture props into top-level constants or `$state(...)` initializers in a way that triggers Svelte 5 `state_referenced_locally` warnings.

## Settings Compatibility

Previously saved `redesignEnabled` values are ignored and omitted from the next settings write. Settings schema version 6 and media migrations are unchanged. Classes remain hidden in the Assistant, while `dnd-class` Markdown cards and the specialized character-sheet interface remain supported.
