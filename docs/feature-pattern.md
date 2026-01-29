# Feature Pattern Guide

Every entity type in the plugin follows a consistent feature pattern. This document explains each component and how they fit together.

## Feature Anatomy

A feature consists of five parts:

```
Feature
├── Repository (data access)
│   ├── SmallDao (list queries)
│   └── FullDao (detail queries)
├── SidePanel (browsing UI)
├── CodeBlockProcessor (markdown rendering)
└── Commands (editor commands)
```

## BaseFeature

All features extend `BaseFeature<ST, FT, F>` (`src/ui/components/feature/BaseFeature.ts`) where:

- `ST extends BaseItem` — the small (list) model type
- `FT extends ST` — the full (detail) model type
- `F extends Filters` — the filter type

The base class constructor calls factory methods that subclasses override:

```typescript
export abstract class BaseFeature<ST, FT, F> implements Initializable {
    public repository: Repository<ST, FT, F> | null = null;
    public sidePanel: BaseSidePanel<ST, FT, F> | null = null;
    public codeBlockProcessor: BaseMdCodeBlockProcessor<ST, FT, F> | null = null;

    // Override these in subclasses:
    createRepository(database: DB): Repository<ST, FT, F> | null { return null; }
    createSidePanel(...): BaseSidePanel<ST, FT, F> | null { return null; }
    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<ST, FT, F> | null { return null; }
    getCommands(): FeatureCommand[] { return []; }
}
```

### Initialization Flow

When `initialize()` is called on a feature:

1. `repository.initialize()` — prepares data access
2. `sidePanel.register()` — registers the Obsidian view
3. `codeBlockProcessor.register()` — registers the markdown processor
4. Commands are registered with Obsidian's command palette

## Concrete Example: RaceFeature

`src/ui/components/feature/RaceFeature.ts`:

```typescript
export class RaceFeature extends BaseFeature<SmallRace, FullRace, RaceFilters> {

    createRepository(database: DB): Repository<SmallRace, FullRace, RaceFilters> {
        return new RacesRepository(database);
    }

    createSidePanel(plugin, repository, uiEventListener): BaseSidePanel<...> {
        return new RaceSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<...> {
        return new RaceMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return [];
    }
}
```

## Small/Full Model Pattern

Each entity has two representations:

- **SmallXxx** — Minimal data for list views (name, URL, key attributes). Used in side panel lists and search results.
- **FullXxx** — Complete entity with all details. Used in statblock rendering and detail views.

`FullXxx extends SmallXxx`, so a full item can be used wherever a small item is expected.

Both extend `BaseItem` which provides the `url` field used as a unique identifier.

### Model Locations

Models live in `src/domain/models/<type>/`:

```
src/domain/models/race/
├── SmallRace.ts
├── FullRace.ts
└── RaceFilters.ts
```

## Filter Pattern

Each entity type defines a `XxxFilters` interface in `src/domain/models/<type>/`. Filters represent the available criteria for narrowing list results (e.g., by source book, challenge rating, school of magic).

The repository's `getFilteredSmallItems(name, filter)` method applies both text search and structured filters. The DAO's `filterByFilters()` method translates filters into SQL WHERE clauses.

## Code Block Processor Pattern

Code block processors let users embed entity statblocks in markdown notes using fenced code blocks. Each processor:

1. Extends `BaseMdCodeBlockProcessor`
2. Registers a code block language identifier (e.g., `dnd-race`)
3. Parses the code block content (typically a URL or name)
4. Fetches the full item from the repository
5. Renders a Svelte component into the markdown preview

## Feature Registration

Features are registered in `src/main.ts` in the `#initialize()` method:

1. Feature is instantiated with `plugin`, `database`, and `uiEventListener`
2. Feature is added to the `features` array
3. `feature.initialize()` is called on all features

See [Adding a New Feature](./adding-new-feature.md) for the full registration checklist.
