# Adding a New Feature

This guide covers adding a new repository-backed entity type to the plugin. Follow the existing feature patterns and keep domain models, data access, and UI concerns separated.

## Files to Create

### 1. Domain Models

Create `src/domain/models/newtype/`:

| File | Purpose |
|------|---------|
| `SmallNewType.ts` | List item model extending `BaseItem` |
| `FullNewType.ts` | Complete model extending `SmallNewType` |
| `NewTypeFilters.ts` | Filter interface for list queries |

Add or extend the matching domain repository interface under `src/domain/repositories/` when the feature needs more than the generic `Repository` contract.

### 2. Data

Add initial static data in `data/` only when the feature ships bundled content. Expose it through `src/assets/data` and a seed service in `src/data/services/seedServices.ts`.

Do not load seed JSON from a DAO. DAO `getLocalData()` is deprecated.

### 3. DAOs

Create SQL table adapters in `src/data/database/`:

| File | Purpose |
|------|---------|
| `SmallNewTypeSqlTableDao.ts` | List-view table schema, SQL writes, SQL reads, filters, and row mapping |
| `FullNewTypeSqlTableDao.ts` | Detail table schema or detail-table access, SQL writes, SQL reads, and row mapping |

Each DAO must implement:

- `getTableName()` for the SQL table name.
- `createTable()` for the `CREATE TABLE` statement.
- `createItem()` and `updateItem()` for SQL writes.
- `mapSqlValues()` for row-to-domain mapping.
- `filterByName()` / `filterByFilters()` when list filtering needs SQL clauses.

DAOs are SQL table adapters only. They should not fetch TTG data, import JSON data, or contain repository orchestration.

### 4. Store, Service, Mapper, Projector

For standard small/full entities, use the generic stores through `createSimpleRepositoryDependencies()`.

Add these pieces as needed:

- A source mapper in `src/data/mappers/sourceMappers.ts` to convert TTG DTOs into `FullNewType`.
- A small item projector in `src/data/projectors/smallItemProjectors.ts`.
- A seed service and seed mapper if bundled data requires normalization.
- A specialized store in `src/data/stores/` only when generic small/full persistence is not enough.
- A specialized service wrapper only when the TTG request differs from the default `TtgService.getFullItem()` flow.

### 5. Repository

Create `src/data/repositories/NewTypeRepository.ts`.

Prefer extending `SimpleRepository`:

```typescript
export class NewTypeRepository
	extends SimpleRepository<SmallNewType, FullNewType, NewTypeFilters>
	implements Repository<SmallNewType, FullNewType, NewTypeFilters> {

	constructor(
		dependencies: SimpleRepositoryDependencies<SmallNewType, FullNewType, NewTypeFilters>,
	) {
		super(dependencies);
	}
}
```

Repositories should depend on store/service/mapper/projector dependencies. Put production assembly in `src/data/repositories/factories.ts`; do not import `DB`, concrete SQL DAOs, or Obsidian `requestUrl` into the repository implementation.

### 6. UI Components

Create Svelte components in `src/ui/layout/newtype/`:

| File | Purpose |
|------|---------|
| `NewTypeSmallUi.svelte` | List item adapter, usually composed from `UiItemCard` |
| `NewTypeFullUi.svelte` | Full statblock/detail component, preferably composed from shared UIKit detail components |
| `NewTypeHeaderUi.svelte` | Optional only if `UiDetailHeader` cannot cover the feature's needs |

Use the shared UIKit by default:

- `UiItemCard` for list items.
- `UiDetailHeader`, `UiDetailCard`, `UiPropertyGrid`, and `UiContentSection` for detail pages.
- `BaseSidePanelUi.svelte` for standard repository-backed browse/search side panels.

### 7. Side Panel

Create `src/ui/components/sidepanel/NewTypeSidePanel.ts`:

- Extends `BaseSidePanel`.
- Usually mounts `src/ui/layout/uikit/BaseSidePanelUi.svelte` with feature-specific slots and config.
- Defines the Obsidian view type identifier.

### 8. Code Block Processor

Create `src/ui/components/processor/NewTypeMdCodeBlockProcessor.ts`:

- Extends `BaseMdCodeBlockProcessor`.
- Defines the fenced code block language, for example `dnd-newtype`.

### 9. Feature Class

Create `src/ui/components/feature/NewTypeFeature.ts`:

```typescript
export class NewTypeFeature extends BaseFeature<SmallNewType, FullNewType, NewTypeFilters> {
	createRepository(database: DB) {
		return createNewTypeRepository(database);
	}

	createSidePanel(plugin, repository, uiEventListener) {
		return new NewTypeSidePanel(plugin, repository, uiEventListener);
	}

	createCodeBlockProcessor() {
		return new NewTypeMdCodeBlockProcessor();
	}

	getCommands(): FeatureCommand[] {
		return [];
	}
}
```

Feature classes may receive `DB` because they call repository factories. Keep direct DAO wiring inside `src/data/repositories/factories.ts`.

## Registration

### In `src/data/database/DB.ts`

1. Add DAO fields.
2. Initialize them in `initDaos()`.
3. Add them to `getDaos()`.
4. Add seed orchestration only if the feature has bundled seed data.

### In `src/data/repositories/factories.ts`

Add `createNewTypeRepository(database: DB, options?: RepositoryFactoryServices)` and assemble:

- Generic or specialized stores.
- TTG or feature-specific service.
- Mapper.
- Small item projector.

### In `src/main.ts`

1. Add a feature field.
2. Instantiate the feature in initialization.
3. Add it to the `features` array.
4. Add a lazy getter in `UiEventListener` construction if cross-feature navigation is needed.

### Link Listener

When rendered HTML should open the new feature from links:

1. Add a handler to `src/domain/listeners/html_link_listener.ts`.
2. Add a `LinkListener` entry in `registerHtmlLinkListener()`.
3. Implement the handler in `src/data/ui_event_listener.ts`.
4. Pass the feature provider from `src/main.ts`.

Place more specific URL prefixes before less specific ones.

### Clipboard Support

Add copy/paste helpers in `src/data/clipboard.ts` only when the feature needs clipboard integration.

## Checklist

- [ ] Domain models and repository interface updated.
- [ ] Static data and seed service added, if needed.
- [ ] SQL DAOs added in `src/data/database/`.
- [ ] Mapper and small item projector added.
- [ ] Repository implemented with dependency ports.
- [ ] Repository factory added.
- [ ] Svelte UI components added using shared UIKit where possible.
- [ ] Side panel added.
- [ ] Code block processor added.
- [ ] Feature class added.
- [ ] DAOs registered in `DB.ts`.
- [ ] Feature registered in `main.ts`.
- [ ] Link listener extended, if needed.
- [ ] Clipboard support added, if needed.
- [ ] Tests added or updated.
- [ ] `npm run svelte-check`, `npm run test -- --run`, and `npm run build` pass.
