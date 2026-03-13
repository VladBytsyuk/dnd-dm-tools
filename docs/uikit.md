# UIKit

The UIKit is the shared Svelte design system for DnD DM Tools. Its purpose is to reduce duplicated UI logic, keep list/detail behavior consistent across features, and centralize shared styling through semantic tokens.

See also [UI Layer](./ui-layer.md).

## Directory Structure

```
src/ui/layout/uikit/
├── atoms/
│   ├── UiCopyableText.svelte
│   └── UiSourceBadge.svelte
├── molecules/
│   ├── UiContentSection.svelte
│   ├── UiImageGallery.svelte
│   ├── UiItemMetaRow.svelte
│   └── UiPropertyGrid.svelte
├── organisms/
│   ├── UiDetailCard.svelte
│   ├── UiDetailHeader.svelte
│   ├── UiEmptyState.svelte
│   ├── UiItemCard.svelte
│   ├── UiItemGroup.svelte
│   └── UiSearchToolbar.svelte
├── AutocompleteInput.svelte
├── BaseSidePanelUi.svelte
├── FilterBlock.svelte
├── FiltersOverlay.svelte
├── HtmlBlock.svelte
└── IconButton.svelte
```

## Component Roles

### Atoms

Small reusable primitives with focused behavior and minimal layout responsibility.

- `UiCopyableText.svelte` renders copyable text with shared interaction behavior.
- `UiSourceBadge.svelte` renders source labels with shared styling.

### Molecules

Reusable composed sections that are still presentation-focused.

- `UiItemMetaRow.svelte` renders shared type/source metadata rows.
- `UiPropertyGrid.svelte` renders compact detail facts in a reusable grid.
- `UiContentSection.svelte` renders named body sections.
- `UiImageGallery.svelte` renders detail-view image browsing and expansion.

### Organisms

Reusable high-level UI blocks used directly by feature screens.

- `UiItemCard.svelte` is the standard small-item/list card.
- `UiItemGroup.svelte` renders grouped small items in collapsible sections.
- `UiSearchToolbar.svelte` renders the shared search/action row for side panels.
- `UiEmptyState.svelte` renders empty list and empty search states.
- `UiDetailHeader.svelte` renders shared detail-page title, source, metadata, links, and images.
- `UiDetailCard.svelte` renders the shared detail-page body container.

### Shared Shell and Utilities

- `BaseSidePanelUi.svelte` is the generic browser shell for most repository-backed side panels.
- `FiltersOverlay.svelte` and `FilterBlock.svelte` provide shared filter UI.
- `AutocompleteInput.svelte`, `HtmlBlock.svelte`, and `IconButton.svelte` are reusable support components used by multiple features.

## BaseSidePanelUi Contract

`BaseSidePanelUi.svelte` is the default side-panel browser implementation for most data-backed features.

It expects:

- `initialFullItem`
- `initialFilters`
- `uiEventListener`
- `repository`
- `filterConfig`
- `groupTitleBuilder`
- `FullItemSlot`
- `SmallItemSlot`
- optional `filterDisplayTransform`
- optional `filterApplyTransform`

It owns:

- search input and toolbar actions
- grouped list rendering
- empty search state
- filter overlay wiring
- switching between list and full-item views

Prefer this shell unless a feature has materially different browser behavior. `CharacterSheetSidePanelUi.svelte` and `DmScreenSidePanelUi.svelte` are current examples of justified custom side-panel implementations.

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
- `--dnd-ui-pattern-card-*`
- `--dnd-ui-pattern-badge-*`
- `--dnd-ui-pattern-input-*`
- `--dnd-ui-pattern-overlay-*`
- `--dnd-ui-pattern-modal-*`
- `--dnd-ui-pattern-table-*`

### Token Rules

- Prefer `--dnd-ui-*` tokens over raw Obsidian variables in component styles.
- Raw Obsidian variables should mostly stay inside token definitions.
- If a neutral spacing, radius, border, or surface value is reused, it should become a token instead of being copied into component-local CSS.

## Recommended Composition Patterns

For new or refactored UI:

- small entity list items should compose `UiItemCard`
- grouped side-panel lists should compose `UiItemGroup`
- standard repository-backed side panels should compose `BaseSidePanelUi.svelte`
- detail pages should compose `UiDetailHeader`, `UiDetailCard`, `UiPropertyGrid`, and `UiContentSection`
- rich HTML body fragments should use `HtmlBlock.svelte`

Feature-local Svelte components should mostly adapt data into shared UIKit components, not reimplement shared chrome.

## Guardrails

- Do not create proxy `.svelte` components that only forward props to another Svelte component.
- Do not introduce duplicated neutral colors, radii, spacing, or hover states when tokens already exist.
- Do not build a feature-local browser shell if `BaseSidePanelUi.svelte` can cover the behavior.
- Use feature-specific styling only for domain-specific visuals, not for generic list/detail chrome.
