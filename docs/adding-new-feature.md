# Adding a New Feature

This guide walks through adding a new entity type to the plugin.

## Files to Create

### 1. Domain Models

Create `src/domain/models/newtype/`:

| File | Purpose |
|------|---------|
| `SmallNewType.ts` | List item model extending `BaseItem` |
| `FullNewType.ts` | Complete model extending `SmallNewType` |
| `NewTypeFilters.ts` | Filter interface for list queries |

### 2. JSON Data

Create `data/newtype.json` with the initial dataset. This data is loaded into the database on first run.

### 3. DAOs

Create in `src/data/databse/`:

| File | Purpose |
|------|---------|
| `SmallNewTypeSqlTableDao.ts` | Extends `Dao<SmallNewType, NewTypeFilters>`. Defines the list-view table schema, creates items, maps SQL rows to `SmallNewType`. |
| `FullNewTypeSqlTableDao.ts` | Extends `Dao<FullNewType, NewTypeFilters>`. Defines the detail table schema (or reads from the same table with more columns), maps SQL rows to `FullNewType`. |

Each DAO must implement:
- `getTableName()` — SQL table name
- `createTable()` — CREATE TABLE statement
- `createItem()` — INSERT statement
- `updateItem()` — UPDATE statement
- `mapSqlValues()` — row-to-object mapping
- `getLocalData()` — return parsed JSON data for initial fill (SmallDao only, typically)

### 4. Repository

Create `src/data/repositories/NewTypeRepository.ts`:

- Implements `Repository<SmallNewType, FullNewType, NewTypeFilters>`
- Constructor takes `DB` and extracts the relevant DAOs
- Delegates all interface methods to the DAOs

### 5. UI Components

Create Svelte components in `src/ui/layout/newtype/`:

| File | Purpose |
|------|---------|
| `NewTypeSmallUi.svelte` | List item component |
| `NewTypeFullUi.svelte` | Full statblock/detail component |
| `NewTypeHeaderUi.svelte` | Header area (optional) |

### 6. Side Panel

Create `src/ui/components/sidepanel/NewTypeSidePanel.ts`:

- Extends `BaseSidePanel`
- Specifies the Svelte component to render
- Defines the view type identifier

### 7. Code Block Processor

Create `src/ui/components/processor/NewTypeMdCodeBlockProcessor.ts`:

- Extends `BaseMdCodeBlockProcessor`
- Defines the fenced code block language (e.g., `dnd-newtype`)

### 8. Feature Class

Create `src/ui/components/feature/NewTypeFeature.ts`:

```typescript
export class NewTypeFeature extends BaseFeature<SmallNewType, FullNewType, NewTypeFilters> {

    createRepository(database: DB) {
        return new NewTypeRepository(database);
    }

    createSidePanel(plugin, repository, uiEventListener) {
        return new NewTypeSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor() {
        return new NewTypeMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return []; // Add editor commands if needed
    }
}
```

## Registration

### In `src/data/databse/DB.ts`

1. Add DAO fields:
   ```typescript
   public smallNewTypeDao: SmallNewTypeSqlTableDao;
   public fullNewTypeDao: FullNewTypeSqlTableDao;
   ```

2. Initialize them in `initDaos()`:
   ```typescript
   this.smallNewTypeDao = new SmallNewTypeSqlTableDao(database, this.app, this.manifest);
   this.fullNewTypeDao = new FullNewTypeSqlTableDao(database);
   ```

3. Add both to `getDaos()` return array.

### In `src/main.ts`

1. Add a field:
   ```typescript
   newTypeFeature: NewTypeFeature;
   ```

2. Instantiate in `#initialize()`:
   ```typescript
   this.newTypeFeature = new NewTypeFeature(this, this.#database, this.#uiEventListener);
   ```

3. Add to the `features` array.

4. Add a lazy getter in `UiEventListener` constructor if cross-feature navigation is needed.

### In `src/domain/listeners/html_link_listener.ts` — Link Listener

The `HtmlLinkListener` interface defines click handlers for cross-feature navigation. When a user clicks a link inside rendered HTML content (e.g., a reference to another entity), the link listener intercepts it and opens the target item in its side panel.

To add support for the new entity type:

1. Add a handler method to the `HtmlLinkListener` interface:
   ```typescript
   onNewTypeClick: (url: string) => Promise<void>;
   ```

2. Add a `LinkListener` entry in `registerHtmlLinkListener()` mapping the URL prefix to the handler:
   ```typescript
   LinkListener('/newtypes/', htmlLinkListener.onNewTypeClick),
   ```
   **Note:** Place more specific prefixes before less specific ones (e.g., `/items/magic/` before `/items/`).

3. Implement the handler in `src/data/ui_event_listener.ts`:
   ```typescript
   // Add a provider parameter to the constructor:
   private newTypeFeatureProvider: () => NewTypeFeature,

   // Add the handler method:
   async onNewTypeClick(url: string): Promise<void> {
       this.onClick(this.newTypeFeatureProvider, url);
   }

   // Bind it in the constructor:
   this.onNewTypeClick = this.onNewTypeClick.bind(this);
   ```

4. Pass the feature provider in `src/main.ts` when constructing `UiEventListener`:
   ```typescript
   () => this.newTypeFeature,
   ```

### In `src/data/clipboard.ts` — Clipboard Support

The clipboard module provides copy/paste of entities as YAML-serialized markdown code blocks. Each entity type has a dedicated `copyXxxToClipboard()` function.

To add clipboard support for the new entity type:

1. Import the full model type:
   ```typescript
   import type { FullNewType } from "../domain/models/newtype/FullNewType";
   ```

2. Add a copy function:
   ```typescript
   export function copyNewTypeToClipboard(newType: FullNewType) {
       copyToClipboard(newType, newType.name.rus, "newtype");
   }
   ```
   The third argument (`"newtype"`) is the code block language identifier used for serialization.

3. (Optional) Add a read function if paste support is needed:
   ```typescript
   export async function getNewTypeFromClipboard(): Promise<FullNewType | undefined> {
       const item = await getFromClipboard<FullNewType>("newtype");
       if (!item) new Notice("Не удалось прочитать данные из буфера обмена");
       return item;
   }
   ```

4. Use the copy function in your Svelte header component (e.g., `NewTypeHeaderFullUi.svelte`):
   ```svelte
   <script lang="ts">
       import { copyTextToClipboard } from '../../../data/clipboard';
   </script>

   <div role="button" tabindex="0"
       onclick={() => copyTextToClipboard(name.rus)}
       onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') copyTextToClipboard(name.rus); }}
       aria-label="Скопировать в буфер обмена"
   >
       <span>{name.rus}</span> <span class="clipboard-icon">📋</span>
   </div>
   ```

## Checklist

- [ ] Domain models created (`SmallNewType`, `FullNewType`, `NewTypeFilters`)
- [ ] JSON data file created in `data/`
- [ ] SmallDao and FullDao created in `src/data/databse/`
- [ ] Repository created in `src/data/repositories/`
- [ ] Svelte UI components created in `src/ui/layout/newtype/`
- [ ] SidePanel created in `src/ui/components/sidepanel/`
- [ ] CodeBlockProcessor created in `src/ui/components/processor/`
- [ ] Feature class created in `src/ui/components/feature/`
- [ ] DAOs registered in `DB.ts` (`initDaos()` and `getDaos()`)
- [ ] Feature registered in `main.ts` (`#initialize()` and `features` array)
- [ ] Link listener extended (`HtmlLinkListener` interface, `registerHtmlLinkListener()`, `UiEventListener`)
- [ ] Clipboard support added (`copyNewTypeToClipboard()` in `src/data/clipboard.ts`)
- [ ] Clipboard copy wired in header Svelte component
- [ ] Tests added in `test/`
