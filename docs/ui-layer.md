# UI Layer

The UI layer encompasses all visual components and Obsidian integration points.

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
├── layout/                # Svelte components (~60 files)
│   ├── monster/           # Monster statblock components
│   ├── spell/             # Spell components
│   ├── weapon/            # Weapon components
│   ├── armor/             # Armor components
│   ├── tracker/           # Initiative tracker UI
│   ├── sidepanel/         # Side panel layout components
│   ├── race/              # Race components
│   └── uikit/             # Reusable UI kit components (includes FilterBlock, FiltersOverlay)
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
| `XxxHeaderUi.svelte` | Header section of a detail view | `RaceHeaderUi.svelte` |
| `XxxHeaderFullUi.svelte` | Extended header variant | `RaceHeaderFullUi.svelte` |
| `XxxUi.svelte` | General component | `TrackerUi.svelte` |

## Layout Component Structure

A typical entity's layout components follow this pattern:

```
src/ui/layout/race/
├── RaceSmallUi.svelte         # Compact list item
├── RaceFullUi.svelte          # Complete statblock
├── RaceHeaderUi.svelte        # Header section
└── RaceHeaderFullUi.svelte    # Extended header
```

- **SmallUi** renders in side panel lists — shows name and key attributes
- **FullUi** renders the complete statblock — used in both side panels and code block processors
- **HeaderUi** components provide the top section with name, source, and metadata

## Side Panel System

Side panels provide the primary browsing interface for each entity type.

### BaseSidePanel

Each side panel extends `BaseSidePanel` and:

1. Registers an Obsidian `ItemView` with a unique view type
2. Renders a Svelte component into the view container
3. Provides `open(fullItem)` to display a specific item's details

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

Each feature's side panel UI component (`*SidePanelUi.svelte`) defines a `filterConfig` array specifying:

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
