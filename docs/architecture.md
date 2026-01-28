# Architecture Overview

DnD DM Tools follows a three-layer architecture with clear separation of concerns.

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│                  UI Layer                   │
│  (Svelte components, side panels, modals,   │
│   code block processors, commands)          │
├─────────────────────────────────────────────┤
│               Domain Layer                  │
│  (Models, Repository interfaces, Filters,   │
│   Listener interfaces, utilities)           │
├─────────────────────────────────────────────┤
│                Data Layer                   │
│  (DB manager, DAOs, Repository impls,       │
│   SQL.js/WASM database)                     │
└─────────────────────────────────────────────┘
```

**Dependency rule:** Each layer only depends on layers below it. The UI layer depends on Domain and Data. The Data layer depends on Domain. The Domain layer has no internal dependencies on other layers.

## Directory Mapping

| Layer | Directory | Contents |
|-------|-----------|----------|
| Domain | `src/domain/` | Models, repository interfaces, listener interfaces, utilities |
| Data | `src/data/` | DB manager, DAO implementations, repository implementations |
| UI | `src/ui/` | Svelte components, feature classes, side panels, processors, modals, commands |

## Key Abstractions

### Repository (`src/domain/repositories/Repository.ts`)

The central data access interface. Generic over `SmallItem`, `FullItem`, and `Filter` types. Provides:

- `getAllSmallItems()` / `getFilteredSmallItems()` — list queries
- `getFullItemByUrl()` / `getFullItemByName()` / `getFullItemBySmallItem()` — detail queries
- `getAllFilters()` — available filter values
- `groupItems()` — grouped list results
- `putItem()` / `deleteItem()` — mutations
- `createEmptyFullItem()` — factory for new items

### DAO (`src/domain/Dao.ts`)

Abstract base class for database table access. Each DAO manages one SQL table and provides:

- Table lifecycle: `createTable()`, `fillTableWithData()`, `dropTable()`
- CRUD: `createItem()`, `readAllItems()`, `readItem()`, `updateItem()`, `deleteItem()`
- Filtering: `filterByName()`, `filterByFilters()`
- Mapping: `mapSqlValues()` to convert SQL rows to domain objects

### Feature (`src/ui/components/feature/BaseFeature.ts`)

Orchestrates a complete feature. Each feature brings together:

- A **Repository** for data access
- A **SidePanel** for the browsing UI
- A **CodeBlockProcessor** for rendering items in markdown
- **Commands** registered with Obsidian's command palette

### SidePanel (`src/ui/components/sidepanel/BaseSidePanel.ts`)

Registers an Obsidian view that renders a Svelte component for browsing and viewing items.

### CodeBlockProcessor (`src/ui/components/processor/BaseMdCodeBlockProcessor.ts`)

Processes fenced code blocks in markdown notes to render item statblocks inline.

## Database

The plugin uses **SQL.js** (SQLite compiled to WebAssembly) for all data storage:

- **WASM binary:** `sql-wasm.wasm` bundled with the plugin
- **Database file:** `database.db` in the plugin directory
- **Initialization:** Loads WASM, opens or creates the database, creates tables, fills with initial JSON data
- **Transactions:** Supported via `DB.transaction()` with automatic rollback on error
- **Persistence:** Database is saved to disk after each transaction

The `DB` class (`src/data/databse/DB.ts`) is the central database manager. It initializes all DAOs and manages the database lifecycle.

## Plugin Entry Point

`src/main.ts` defines `DndStatblockPlugin` which:

1. Creates and initializes the `DB` instance
2. Creates the `UiEventListener` (cross-feature communication)
3. Instantiates all feature classes
4. Calls `initialize()` on each feature
5. Registers the initiative tracker side panel, encounter code block processor, and encounter command

## Cross-Feature Communication

The `UiEventListener` (`src/data/ui_event_listener.ts`) implements `IUiEventListener` (`src/domain/listeners/ui_event_listener.ts`) and provides a way for UI components to trigger actions across features (e.g., opening an item from a different feature's context).
