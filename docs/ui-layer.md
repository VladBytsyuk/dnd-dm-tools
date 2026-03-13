# UI Layer

The UI layer encompasses all visual components and Obsidian integration points.

For the shared design system and reusable Svelte primitives, see [UIKit](./uikit.md).

## Directory Structure

```
src/ui/
├── components/
│   ├── feature/           # Feature orchestrators (BaseFeature + implementations)
│   ├── sidepanel/         # Side panel classes (BaseSidePanel + implementations)
│   ├── processor/         # Markdown code block processors
│   ├── modals/            # Obsidian modal dialogs (editing, confirmation)
│   ├── command/           # Editor commands
│   └── suggest/           # Autocomplete/suggest components
├── layout/                # Svelte components
│   ├── monster/           # Monster statblock components
│   ├── spell/             # Spell components
│   ├── weapon/            # Weapon components
│   ├── armor/             # Armor components
│   ├── tracker/           # Initiative tracker UI
│   ├── sidepanel/         # Side panel layout components
│   ├── race/              # Race components
│   └── uikit/             # Shared UI kit and browser shell
│       ├── atoms/         # Small reusable visual primitives
│       ├── molecules/     # Composed reusable sections
│       └── organisms/     # Shared high-level UI blocks
└── theme.ts               # Theme change listener
```

## Svelte 5 Conventions

The project uses **Svelte 5** with runes syntax:

- **Runes:** `$state`, `$derived`, `$effect` instead of Svelte 4 reactive declarations
- **Components:** Use `.svelte` extension
- **Icons:** `lucide-svelte` for icon components

### Naming Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `XxxSmallUi.svelte` | List item component | `RaceSmallUi.svelte` |
| `XxxFullUi.svelte` | Full detail/statblock component | `RaceFullUi.svelte` |
| `XxxHeaderFullUi.svelte` | Extended header variant | `RaceHeaderFullUi.svelte` |
| `XxxUi.svelte` | General component | `TrackerUi.svelte` |

Feature folders still use `XxxSmallUi.svelte` and `XxxFullUi.svelte`, but shared header/list/detail chrome should default to UIKit components instead of feature-local wrappers.

## UIKit Structure

The current shared UI system lives in `src/ui/layout/uikit/`:

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
├── BaseSidePanelUi.svelte
├── FiltersOverlay.svelte
├── FilterBlock.svelte
├── HtmlBlock.svelte
├── AutocompleteInput.svelte
└── IconButton.svelte
```

The shared browser/detail composition now looks like this:

- `UiItemCard` renders the reusable small-item/list card.
- `UiItemGroup` renders grouped lists in collapsible sections.
- `UiSearchToolbar` renders the shared side-panel search/action row.
- `UiDetailHeader` renders the shared detail header, copy actions, source row, and image gallery.
- `UiDetailCard`, `UiPropertyGrid`, and `UiContentSection` render the standard detail-body structure.
- `BaseSidePanelUi` is the generic browser shell used by most data-backed entity side panels.

## Side Panel System

Side panels provide the primary browsing interface for each entity type.

### BaseSidePanel

Each side panel extends `BaseSidePanel` and:

1. Registers an Obsidian `ItemView` with a unique view type
2. Renders a Svelte component into the view container
3. Provides `open(fullItem)` to display a specific item's details

### Shared Browser Shell

Most feature side panels now use `src/ui/layout/uikit/BaseSidePanelUi.svelte` as the shared browser shell instead of maintaining a fully custom side-panel Svelte implementation.

`BaseSidePanelUi` owns:

- the search toolbar
- grouped list rendering
- empty search state
- filter overlay wiring
- full-item navigation within the panel

Features provide the domain-specific parts through props:

- repository
- filter configuration
- group-title builder
- small-item slot
- full-item slot
- optional filter display/apply transforms

`CharacterSheetSidePanelUi.svelte` remains a custom browser implementation because it has feature-specific controller-driven behavior. `DmScreenSidePanelUi.svelte` also remains feature-specific.

### Registration

Side panels are created by the feature class's `createSidePanel()` method and registered during `feature.initialize()`.

## Code Block Processors

Code block processors render entity statblocks inline in markdown notes.

### Usage in Markdown

Users add fenced code blocks with a specific language identifier:

````markdown
```dnd-race
url-of-the-race
```
````

### BaseMdCodeBlockProcessor

Each processor extends `BaseMdCodeBlockProcessor` and:

1. Defines a code block language identifier
2. Registers with Obsidian's `registerMarkdownCodeBlockProcessor()`
3. Parses code block content (URL or name)
4. Fetches the full item via the repository
5. Mounts a Svelte component to render the statblock

## Modals

Modal dialogs (`src/ui/components/modals/`) extend Obsidian's `Modal` class for:

- Item editing forms
- Confirmation dialogs
- Encounter creation

## Filter Overlays

Filters are implemented as Svelte overlay components within side panels rather than modal dialogs:

### FiltersOverlay Component

`src/ui/layout/uikit/FiltersOverlay.svelte` is a generic overlay component that:

- Renders as a fixed-position overlay within the side panel
- Accepts `filterConfig` defining which filters to display
- Supports optional transformation functions for UI display (e.g., translating technical keys to readable names)
- Provides visual feedback for selected filters and changes

### FilterBlock Component

`src/ui/layout/uikit/FilterBlock.svelte` renders individual filter categories with toggle buttons.

### Filter Configuration

Features that use `BaseSidePanelUi` pass a `filterConfig` array into the shared shell. Feature-specific side panels may still define their own filter configuration locally.

Each filter config entry specifies:

- Filter keys from the filter type
- Display labels

Optional `filterDisplayTransform` and `filterApplyTransform` functions can translate between internal data representation and UI display values.

## Commands

Editor commands (`src/ui/components/command/`) are registered with Obsidian's command palette. Features can define commands via the `getCommands()` method, returning `FeatureCommand` objects with:

- `id` — unique command identifier
- `name` — display name in the command palette
- `editorCallback` — function receiving the `Editor` instance

## Suggest Components

Suggest components (`src/ui/components/suggest/`) provide autocomplete functionality, typically for item name input fields. They extend Obsidian's suggest classes.

## Theme Support

`src/ui/theme.ts` exports `registerThemeChangeListener()` which detects Obsidian theme changes and applies appropriate CSS adjustments.

Shared styling is now centralized in `styles.css` through semantic `--dnd-ui-*` design tokens and shared pattern tokens. New shared UI should consume these tokens instead of introducing duplicated neutral colors, spacing, or radii.
