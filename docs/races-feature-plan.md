# Races Feature Development Plan

## Overview

This document outlines the implementation plan for the Races feature in DnD DM Tools plugin.

**Status:** Domain models and data assets are complete. Implementation of data layer, repository, and UI components is pending.

## Already Implemented

| Component | Location | Status |
|-----------|----------|--------|
| SmallRace model | `src/domain/models/race/SmallRace.ts` | Done |
| FullRace model | `src/domain/models/race/FullRace.ts` | Done |
| RaceFilters | `src/domain/models/race/RaceFilters.ts` | Done |
| AbilityBonus model | `src/domain/models/common/AbilityBonus.ts` | Done |
| Race data (JSON) | `data/races.json` | Done |
| Assets data | `src/assets/data/races.ts` | Done |

## Implementation Steps

### Step 1: Data Access Layer (DAOs)

Create two DAO classes for database operations.

**Files to create:**
- `src/data/databse/SmallRaceSqlTableDao.ts`
- `src/data/databse/FullRaceSqlTableDao.ts`

**SmallRaceSqlTableDao requirements:**
- Extend `SmallSqlTableDao<SmallRace, RaceFilters>`
- Define table schema with columns: id, rus_name, eng_name, url, abilities, type, source, image, group, **parent_url**
- Import `baseRaces` from `src/assets/data/races.ts` for initial data
- Implement `mapRowToItem()` to convert DB row to SmallRace (without children)
- Implement filter logic in `buildFilterWhere()` for abilities, types, sources

**Hierarchy Flattening Strategy:**

The `children` field in SmallRace creates a recursive structure. Instead of storing nested JSON, flatten the hierarchy using `parent_url`:

```
Table: small_races
┌─────────────────────────────────────────────────────────────┐
│ url          │ rus_name     │ parent_url   │ ...           │
├─────────────────────────────────────────────────────────────┤
│ /race/elf    │ Эльф         │ NULL         │ (top-level)   │
│ /race/high-elf│ Высший эльф │ /race/elf    │ (child)       │
│ /race/wood-elf│ Лесной эльф │ /race/elf    │ (child)       │
│ /race/human  │ Человек      │ NULL         │ (top-level)   │
└─────────────────────────────────────────────────────────────┘
```

**Implementation details:**

1. **Data insertion** - When inserting from `baseRaces`:
   - Insert each race with `parent_url = NULL` for top-level races
   - Recursively process `children` array, inserting each child with `parent_url` pointing to parent's url
   - Do NOT store the `children` field in the database

2. **Data retrieval** - When querying:
   - `mapRowToItem()` returns SmallRace with empty `children` array
   - Repository is responsible for reconstructing hierarchy if needed (see Step 3)

3. **Filtering** - Filters apply to all races (both parents and children):
   - Query returns flat list matching filters
   - UI or repository handles grouping/nesting for display

**Helper methods to implement:**

```typescript
// For flattening hierarchy during data insertion
private flattenRaces(races: SmallRace[], parentUrl: string | null = null): Array<{race: SmallRace, parentUrl: string | null}> {
  const result: Array<{race: SmallRace, parentUrl: string | null}> = [];
  for (const race of races) {
    result.push({ race, parentUrl });
    if (race.children && race.children.length > 0) {
      result.push(...this.flattenRaces(race.children, race.url));
    }
  }
  return result;
}

// For retrieving races with parent info (used by repository for hierarchy reconstruction)
public getAllWithParentUrl(): Array<{race: SmallRace, parentUrl: string | null}> {
  const sql = `SELECT * FROM ${this.tableName}`;
  const results = this.db.exec(sql);
  return results[0]?.values.map(row => ({
    race: this.mapRowToItem(row),
    parentUrl: row[PARENT_URL_INDEX] as string | null
  })) ?? [];
}
```

**FullRaceSqlTableDao requirements:**
- Extend `FullSqlTableDao<FullRace>`
- Define table schema with additional columns: description, size, speed, skills, subraces
- Implement `mapRowToItem()` to convert DB row to FullRace
- Handle JSON serialization for array fields (speed, skills, subraces)

**Reference:** Use `SmallFeatSqlTableDao.ts` and `FullFeatSqlTableDao.ts` as templates.

---

### Step 2: Repository Interface

Create the repository interface in the domain layer.

**File to create:**
- `src/domain/repositories/Races.ts`

**Requirements:**
- Define `RacesRepositoryInterface` extending `Repository<SmallRace, FullRace, RaceFilters>`

---

### Step 3: Repository Implementation

Create the repository that connects DAOs to the feature.

**File to create:**
- `src/data/repositories/RacesRepository.ts`

**Requirements:**
- Extend `BaseRepository<SmallRace, FullRace, RaceFilters>`
- Implement `collectFiltersFromAllItems()`:
  - Aggregate unique abilities from all races (including subraces)
  - Aggregate unique types (race types)
  - Aggregate unique sources
- Implement `groupItems()`:
  - Group races by type or alphabetically
  - Return `GroupedItems<SmallRace>[]`

**Hierarchy Reconstruction (if needed for UI):**

Since SmallRaceSqlTableDao stores flattened data, the repository can reconstruct the hierarchy:

```typescript
private reconstructHierarchy(flatRaces: SmallRace[]): SmallRace[] {
  // Get all races with their parent_url from DAO
  const racesWithParent = this.smallDao.getAllWithParentUrl();

  // Build a map of url -> race
  const raceMap = new Map<string, SmallRace>();
  for (const item of racesWithParent) {
    raceMap.set(item.race.url, { ...item.race, children: [] });
  }

  // Build hierarchy
  const topLevel: SmallRace[] = [];
  for (const item of racesWithParent) {
    const race = raceMap.get(item.race.url)!;
    if (item.parentUrl) {
      const parent = raceMap.get(item.parentUrl);
      if (parent) {
        parent.children.push(race);
      }
    } else {
      topLevel.push(race);
    }
  }

  return topLevel;
}
```

**Display options:**
1. **Flat list** - Show all races (parents and children) as a flat list with indentation or badges indicating subraces
2. **Hierarchical** - Show only top-level races, with children nested or expandable
3. **Grouped by parent** - Group subraces under their parent race name

**Reference:** Use `FeatsRepository.ts` or `BackgroundsRepository.ts` as template.

---

### Step 4: Register DAOs in Database

Update the database manager to include race DAOs.

**File to modify:**
- `src/data/databse/DB.ts`

**Changes:**
1. Import `SmallRaceSqlTableDao` and `FullRaceSqlTableDao`
2. Add public properties:
   ```typescript
   public smallRaceDao: SmallRaceSqlTableDao;
   public fullRaceDao: FullRaceSqlTableDao;
   ```
3. Initialize in `initDaos()` method
4. Add both DAOs to `getDaos()` return array

---

### Step 5: Filters Modal

Create the modal for filtering races.

**File to create:**
- `src/ui/components/modals/RaceFiltersModal.ts`

**Requirements:**
- Extend `BaseFiltersModal<RaceFilters>`
- Implement `addBlocks()` with filter blocks for:
  - Abilities (multi-select)
  - Types (multi-select)
  - Sources (multi-select)

**Reference:** Use `FeatFiltersModal.ts` as template.

---

### Step 6: Side Panel

Create the side panel class for race browsing.

**File to create:**
- `src/ui/components/sidepanel/RaceSidePanel.ts`

**Requirements:**
- Extend `BaseSidePanel`
- Implement:
  - `getKey()` → `"races"`
  - `getRibbonIconName()` → `"users"` (or appropriate icon)
  - `getTitle()` → `"Расы"`
  - `mountSvelteComponent()` → mount `RaceSidePanelUi` with `RaceFiltersModal`

**Reference:** Use `FeatsSidePanel.ts` as template.

---

### Step 7: Markdown Code Block Processor

Create the processor for rendering races in markdown.

**File to create:**
- `src/ui/components/processor/RaceMdCodeBlockProcessor.ts`

**Requirements:**
- Extend `BaseMdCodeBlockProcessor`
- Implement:
  - `getCodeBlockName()` → `'race'`
  - `getUi()` → `RaceFullUi` component

**Reference:** Use `BackgroundMdCodeBlockProcessor.ts` as template.

---

### Step 8: Feature Class

Create the main feature class that ties everything together.

**File to create:**
- `src/ui/components/feature/RaceFeature.ts`

**Requirements:**
- Extend `BaseFeature<SmallRace, FullRace, RaceFilters>`
- Implement:
  - `createRepository()` → return new `RacesRepository`
  - `createSidePanel()` → return new `RaceSidePanel`
  - `createCodeBlockProcessor()` → return new `RaceMdCodeBlockProcessor`
  - `getCommands()` → return `[]` (no editor commands needed)

**Reference:** Use `FeatFeature.ts` as template.

---

### Step 9: UI Layout Components

Create Svelte components for displaying races.

**Directory to create:**
- `src/ui/layout/race/`

**Files to create:**

#### 9.1 `RaceSmallUi.svelte`
List item component showing:
- Race name (rus_name)
- Type badge
- Ability bonuses (formatted)
- Source badge

**Reference:** Use `FeatSmallUi.svelte` as template.

#### 9.2 `RaceFullUi.svelte`
Full detail component showing:
- Race name (rus_name, eng_name)
- Type and source
- Ability bonuses (all bonuses formatted)
- Size
- Speed (base, climb, fly, swim, burrow)
- Skills (if any)
- Description (rendered markdown)
- Subraces (if any, rendered recursively or as expandable sections)

**Reference:** Use `FeatFullUi.svelte` and `BackgroundFullUi.svelte` as templates.

#### 9.3 `RaceSidePanelUi.svelte`
Side panel wrapper using `BaseSidePanelUi` with:
- `RaceFullUi` slot for details
- `RaceSmallUi` slot for list items
- Empty filters configuration
- Group title builder function

**Reference:** Use `FeatsSidePanelUi.svelte` as template.

---

### Step 10: Register Feature in Plugin

Update the main plugin file to include the races feature.

**File to modify:**
- `src/main.ts`

**Changes:**
1. Import `RaceFeature`
2. Add property: `raceFeature: RaceFeature`
3. Instantiate in `#initialize()`:
   ```typescript
   this.raceFeature = new RaceFeature(this, this.db);
   ```
4. Add to `features` array for initialization loop

---

### Step 11: UI Event Listener (Optional)

If cross-feature linking is needed (e.g., clicking race name in other views).

**File to modify:**
- `src/data/ui_event_listener.ts`

**Changes:**
1. Add `raceFeatureProvider` parameter to constructor
2. Add `onRaceClick()` method
3. Bind the click handler

---

## File Summary

### New Files (13 total)
| File | Type |
|------|------|
| `src/data/databse/SmallRaceSqlTableDao.ts` | DAO |
| `src/data/databse/FullRaceSqlTableDao.ts` | DAO |
| `src/domain/repositories/Races.ts` | Interface |
| `src/data/repositories/RacesRepository.ts` | Repository |
| `src/ui/components/modals/RaceFiltersModal.ts` | Modal |
| `src/ui/components/sidepanel/RaceSidePanel.ts` | Side Panel |
| `src/ui/components/processor/RaceMdCodeBlockProcessor.ts` | Processor |
| `src/ui/components/feature/RaceFeature.ts` | Feature |
| `src/ui/layout/race/RaceSmallUi.svelte` | UI Component |
| `src/ui/layout/race/RaceFullUi.svelte` | UI Component |
| `src/ui/layout/sidepanel/RaceSidePanelUi.svelte` | UI Component |

### Modified Files (2-3 total)
| File | Changes |
|------|---------|
| `src/data/databse/DB.ts` | Register race DAOs |
| `src/main.ts` | Register RaceFeature |
| `src/data/ui_event_listener.ts` | Optional: add race click handler |

---

## Testing

After implementation, create tests for:

1. **DAO tests** - `test/data/databse/SmallRaceSqlTableDao.test.ts`
   - Test table creation
   - Test CRUD operations
   - Test filter queries
   - **Test hierarchy flattening on insert** - verify children are stored with correct `parent_url`
   - **Test `getAllWithParentUrl()`** - verify parent_url is correctly returned

2. **Repository tests** - `test/data/repositories/RacesRepository.test.ts`
   - Test filter collection
   - Test item grouping
   - **Test hierarchy reconstruction** - verify flat data is correctly rebuilt into nested structure

---

## Dependencies

- All domain models: Done
- Data files: Done
- Existing patterns: Follow Feat/Background feature implementations

---

## Notes

1. **Subraces handling**:
   - **Storage**: SmallRace children are flattened in the database using `parent_url` column
   - **Retrieval**: DAO returns flat list; repository can reconstruct hierarchy if needed
   - **Display**: Consider flat list with badges, hierarchical tree, or grouped by parent

2. **Ability bonuses display**: Use AbilityBonus model formatting. Consider creating a reusable component if needed.

3. **Speed display**: Speed is an array with different movement types. Display all non-zero speeds.

4. **Code block syntax**: After implementation, users can embed races using:
   ```
   ```race
   url-of-the-race
   ```
   ```

5. **Icon selection**: Choose appropriate Lucide icon for ribbon (suggestions: `users`, `user`, `person-standing`).
