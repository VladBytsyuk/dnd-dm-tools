# Character Sheet Feature

## Overview

The Character Sheet feature provides a local character manager inside the plugin. It supports four main use cases:

- browsing stored character sheets in the side panel
- importing character sheets from JSON files
- editing full character sheets in a dedicated UI
- rendering character sheets from markdown code blocks

Unlike most other features in the plugin, character sheets are user-created data. The feature is therefore built around import, editing, local persistence, and compatibility handling instead of around static bundled content.

## Feature Composition

The current implementation is split across feature, persistence, controller, and UI layers.

### Entry Points

- `CharacterSheetFeature`
  Creates the repository, side panel, and markdown processor for the feature.
- `CharacterSheetSidePanel`
  Connects the plugin side panel host to the Svelte side-panel UI.
- `CharacterSheetMdCodeBlockProcessor`
  Renders a character sheet inline for the `charsheet` markdown code block.

### Persistence and Import

- `CharacterSheetRepository`
  Main application-facing gateway for listing, loading, saving, deleting, filtering, and importing character sheets.
- `CharacterSheetSqlTableDao`
  Reads and writes the `character_sheets` SQL table and maps rows into full and small character-sheet models.
- `CharacterSheetImportService`
  Parses imported JSON, validates it, applies compatibility defaults, allocates a unique URL, and returns a normalized sheet ready for persistence.

### UI Runtime

- `CharacterSheetSidePanelUi.svelte`
  Side-panel layout for browsing, searching, filtering, importing, and opening sheets.
- `CharacterSheetFullUi.svelte`
  Main full-sheet editor and renderer.
- `CharacterSheetSmallUi.svelte`
  Compact renderer used in smaller contexts.

### UI State Helpers

- `characterSheetBrowserController`
  Owns side-panel state such as search text, filters, grouping, current item, navigation stack, import status, and visible errors.
- `characterSheetEditorController`
  Owns the editable session for the full view, including draft state, migration-on-open, dirty tracking, save status, debounced persistence, and stale-save suppression.
- `characterSheetSelectors`
  Pure selectors and mapping helpers used by the full view to derive display-ready values from the current sheet draft.
- `characterSheetFilePicker`
  Small helper around browser file selection used by the import flow.

## Data Flow

### Import Flow

1. The user starts import from the side panel.
2. `characterSheetFilePicker` returns the selected file contents.
3. `characterSheetBrowserController` calls `CharacterSheetRepository.importCharacterSheet`.
4. `CharacterSheetRepository` delegates parsing and normalization to `CharacterSheetImportService`.
5. `CharacterSheetImportService` validates the JSON, applies defaults and compatibility normalization, computes metadata, and allocates a unique URL.
6. The repository persists the resulting full sheet through `CharacterSheetSqlTableDao`.
7. The browser controller refreshes the list and opens the imported item.

### Side Panel Flow

1. `CharacterSheetSidePanel` mounts `CharacterSheetSidePanelUi.svelte`.
2. The UI reads browser state from `characterSheetBrowserController`.
3. Search text and filters are routed through controller actions.
4. The controller asks `CharacterSheetRepository` for filtered/grouped summaries and for full sheet loading.
5. Opening an item updates controller state and switches the panel to the full-sheet view.

### Full Editor Flow

1. `CharacterSheetFullUi.svelte` receives the currently opened item.
2. `characterSheetEditorController` opens a session for that item and clones it into a draft.
3. On open, the controller applies legacy migrations needed for older sheet shapes.
4. UI blocks emit section updates into the controller.
5. The controller updates only the draft, marks the session dirty, and schedules a debounced save.
6. The controller persists through `CharacterSheetRepository`.
7. Save completion updates session state and suppresses stale save results when the viewed item changes mid-flight.

### Markdown Code Block Flow

1. `CharacterSheetMdCodeBlockProcessor` handles fenced code blocks named `charsheet`.
2. It resolves the referenced character sheet through the repository.
3. The processor renders the sheet using the character-sheet UI instead of raw markdown output.

## Persistence Model

Character sheets do not follow the standard plugin small/full dual-DAO storage pattern in the same way as static content features.

The feature uses a single SQL table, `character_sheets`, and a character-sheet-specific persistence path:

- `CharacterSheetSqlTableDao` is responsible for both summary-style reads and full-sheet reads.
- `CharacterSheetRepository` uses explicit save and delete logic for character sheets instead of relying on the generic `BaseRepository.putItem()` dual-DAO behavior used elsewhere in the codebase.
- Summary data such as name, class, level, and race is derived from the full sheet and stored in the same table so side-panel lists and filters can be queried directly.

This design exists because character sheets are edited and imported user data, not pre-seeded reference content.

## Session and Browser State

### Browser State

`characterSheetBrowserController` owns the state required by the side panel:

- current list or group view
- search text
- selected filters
- navigation stack
- currently opened sheet
- import progress
- import/load errors

The controller isolates side-panel behavior from the Svelte component so list refresh, navigation, and import behavior can be tested without mounting the full UI.

### Editor Session State

`characterSheetEditorController` owns the editing session for the full sheet:

- current source item
- editable draft
- dirty state
- save state
- save error state
- pending debounce timer
- save sequence tracking for stale-save suppression

The editor controller is the only layer that should decide when persistence happens. Child UI blocks should emit edit intent, not write directly to the repository.

### Feature-Local Types

The feature-local contracts live in `characterSheetTypes.ts`. Important runtime types include:

- `CharacterSheetGateway`
  Persistence-facing interface used by controllers to load, save, delete, filter, and import sheets.
- `CharacterSheetSessionState`
  Session state shape used by the editor controller.
- `CharacterSheetBrowserState`
  Side-panel state shape used by the browser controller.
- `CharacterEditorTextSection`
  Identifies editable free-text sections in the sheet.
- `CharacterSubInfoField`
  Identifies secondary header fields used by editor actions and selectors.

## Compatibility and Migrations

The feature must keep older or externally generated character JSON usable.

Current compatibility handling includes:

- legacy single-class data migrated into the current multi-class structure
- legacy `attunementsList` moved into the modern equipment representation
- legacy proficiencies text migrated into the current text-section layout
- imported payload defaults for optional sections that may be missing
- unique URL allocation during import when multiple files normalize to the same slug

There are two places where compatibility logic is applied:

- `CharacterSheetImportService` handles imported JSON normalization before persistence
- `characterSheetEditorController` applies open-time migrations needed for already stored older sheets

The goal is to keep persisted data usable without requiring a destructive storage migration.

## UI Notes

`CharacterSheetFullUi.svelte` is now primarily a composition layer. It wires the current item into the editor controller, reads derived values from selectors, and renders the large character-sheet blocks.

The largest child blocks still represent major editing domains:

- character identity and header information
- vitality and combat values
- proficiencies and abilities
- equipment and currency
- spellbook
- roleplay and notes text sections

`CharacterSheetSidePanelUi.svelte` is responsible for presenting browser state and invoking browser-controller actions. It should not own long-lived navigation or import orchestration logic.

## Testing

Current automated coverage is strongest in the feature's TypeScript runtime layers:

- import parsing and normalization: `CharacterSheetImportService`
- repository behavior: `CharacterSheetRepository`
- DAO row mapping and filtering: `CharacterSheetSqlTableDao`
- browser state handling: `characterSheetBrowserController`
- editor session behavior: `characterSheetEditorController`
- derived view data: `characterSheetSelectors`
- file-picker helper behavior: `characterSheetFilePicker`
- domain normalization logic in the character model layer

This coverage protects the architectural seams added during the refactor, including:

- duplicate-name imports
- unique URL allocation
- mounted-sheet switching at the controller level
- debounce and stale-save handling
- compatibility migrations
- repository save/delete delegation
- DAO filtering and mapping

### Current Gap

The main remaining gap is mounted Svelte integration coverage:

- `CharacterSheetFullUi.svelte`
- `CharacterSheetSidePanelUi.svelte`
- large child blocks such as vitality, equipment, combat, and spellbook

The Vitest coverage configuration includes feature TypeScript files, but `.svelte` files remain excluded. As a result, helper and controller behavior is better protected than full UI wiring.

## Known Constraints

- Character-sheet Svelte files are still major integration boundaries even after controller extraction.
- Coverage is meaningful for TypeScript runtime modules, but `.svelte` files are still excluded from coverage reporting.
- Browser file-selection behavior depends on the UI environment and must be abstracted through helpers for testability.
- Codecov and local coverage configuration must stay aligned with the actual coverage output paths.
- The feature intentionally preserves backward compatibility for stored and imported character sheets, so compatibility code should be treated as part of the supported runtime, not as temporary migration scaffolding.
