# Architecture Overview

DnD DM Tools follows a layered architecture with domain models and repository interfaces at the center, SQL.js persistence behind the data layer, and Obsidian/Svelte UI at the edge.

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│                  UI Layer                   │
│  Assistant workspace, panel hosts, Svelte   │
│  components, processors, commands           │
├─────────────────────────────────────────────┤
│               Domain Layer                  │
│  Models, repository interfaces, filters,    │
│  listener interfaces, domain utilities      │
├─────────────────────────────────────────────┤
│                Data Layer                   │
│  Repositories, stores, services, mappers,   │
│  projectors, SQL.js DB manager, DAOs        │
└─────────────────────────────────────────────┘
```

**Dependency rule:** UI depends on Domain and Data. Data depends on Domain. Domain does not depend on UI or Data implementation details.

## Directory Mapping

| Layer | Directory | Contents |
|-------|-----------|----------|
| Domain | `src/domain/` | Models, repository interfaces, listener interfaces, utilities |
| Data | `src/data/` | Repository implementations, stores, services, mappers, projectors, DB manager, DAOs |
| UI | `src/ui/` | Assistant workspace, Svelte components, feature classes, panel hosts, processors, modals, commands |

Within the UI layer, `src/ui/layout/uikit/` is the shared design-system and browser-shell layer. See [UI Layer](./ui-layer.md) and [UIKit](./uikit.md).

## Key Abstractions

### Repository Interface

`src/domain/repositories/Repository.ts` defines the domain-facing data access contract:

- `getAllSmallItems()` / `getFilteredSmallItems()` for list queries.
- `getFullItemByUrl()` / `getFullItemByName()` / `getFullItemBySmallItem()` for detail queries.
- `getAllFilters()` and `groupItems()` for panel browsing.
- `putItem()` / `deleteItem()` for mutations.
- `createEmptyFullItem()` for editor flows.

### Repository Implementations

`src/data/repositories/` implements repository orchestration. Repositories depend on stores, services, mappers, and projectors instead of `DB`, DAOs, or Obsidian HTTP APIs.

`SimpleRepository` handles the common cached-read, remote-fetch, map, persist, project, and cache-invalidation flow. Specialized repositories add feature-specific orchestration for classes, races, backgrounds, DM screen items, and character sheets.

### Stores

Stores in `src/data/stores/` own persistence behavior and DAO access. Generic stores handle the common small/full table pattern; specialized stores handle race hierarchy, class archetypes, DM screen expansion, and character sheet storage.

### Services

Services in `src/data/services/` fetch or import raw data and return `ServiceResult`. Obsidian `requestUrl` is isolated to TTG service adapters, not repositories.

### Mappers and Projectors

Mappers convert source DTOs and import payloads into domain models. Projectors derive small/list models from full models for persistence.

### DAO

`src/domain/Dao.ts` is the base class for SQL table adapters in `src/data/database/`. DAOs own SQL schema, CRUD statements, filters, and row mapping only. Legacy DAO seed hooks are deprecated; seed loading is handled by seed services and `SeedStore`.

### Feature

`src/ui/components/feature/BaseFeature.ts` wires a repository, Assistant panel host, code block processor, and Obsidian commands for one feature.

### Assistant Workspace

`PanelManager` registers the plugin's single Obsidian `ItemView`, **Помощник ДМа**, and one ribbon entry. Feature `BaseSidePanel` implementations are `PanelHost` adapters mounted inside Assistant tabs; they do not register independent Obsidian views.

The manager owns global search, item routing, panel session mounting, and persisted one- or two-tile workspace state.

## Database

The plugin uses SQL.js:

- WASM binary: `sql-wasm.wasm`
- Database file: `database.db` in the plugin directory
- Manager: `src/data/database/DB.ts`
- Transactions: `DB.transaction()` with rollback on error and persistence after commit

`DB` initializes concrete DAOs and database lifecycle. Repository factories use that composition root to build repository dependencies.

## Plugin Entry Point

`src/main.ts` loads the persisted Assistant workspace, initializes `DB`, creates the `UiEventListener`, constructs and initializes all features, then registers their panel hosts with `PanelManager`. Feature initialization registers markdown processors and commands.

## Cross-Feature Communication

`src/data/ui_event_listener.ts` implements `IUiEventListener` and lets UI components open items across feature boundaries.
