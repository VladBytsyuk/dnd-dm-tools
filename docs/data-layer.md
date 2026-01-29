# Data Layer

The data layer handles all database operations and provides repository implementations for the domain layer.

## Directory Structure

```
src/data/
├── database/                   # Database manager and DAOs
│   ├── DB.ts                   # Central database manager
│   ├── SmallMonsterSqlTableDao.ts
│   ├── FullMonsterSqlTableDao.ts
│   ├── SmallSpellSqlTableDao.ts
│   ├── ...                     # One Small + Full DAO pair per entity type
│   └── DmScreenGroupSqlTableDao.ts
├── repositories/               # Repository implementations
│   ├── BestiaryRepository.ts
│   ├── SpellbookRepository.ts
│   ├── ...
│   └── RacesRepository.ts
└── ui_event_listener.ts        # Cross-feature event handling
```

## DB.ts — Database Manager

`src/data/database/DB.ts` is the central database manager. It:

1. Loads the `sql-wasm.wasm` binary (tries Obsidian vault adapter first, falls back to Node.js `fs`)
2. Opens or creates the SQLite database from `database.db`
3. Initializes all DAO instances via `initDaos()`
4. Runs table creation in a transaction
5. Fills empty tables with initial JSON data in a transaction

### Key Methods

| Method | Description |
|--------|-------------|
| `initialize()` | Full startup sequence: load WASM, open DB, create tables, fill data |
| `dispose()` | Disposes all DAOs and closes the database |
| `transaction(callback)` | Wraps callback in BEGIN/COMMIT with ROLLBACK on error, saves DB after commit |

### Database Lifecycle

```
initialize()
  ├── Load sql-wasm.wasm
  ├── Open/create database.db
  ├── initDaos(database)
  ├── Transaction: create all tables
  └── Transaction: fill empty tables with JSON data

transaction(callback)
  ├── BEGIN TRANSACTION
  ├── Execute callback
  ├── COMMIT
  ├── saveDatabase() → write to disk
  └── On error: ROLLBACK

dispose()
  ├── Dispose all DAOs
  └── Close database
```

## DAO Pattern

Each entity type has two DAOs, both extending the abstract `Dao<T, F>` class (`src/domain/Dao.ts`).

### SmallDao

- Table contains the columns needed for list views
- Constructor receives `database`, `app`, and `manifest` (for loading JSON data files)
- `getLocalData()` returns parsed JSON data for initial table fill
- `filterByName()` and `filterByFilters()` build WHERE clauses for search

### FullDao

- Table contains all columns for complete entity details
- Constructor receives only `database` (no JSON loading needed — data comes from SmallDao's table or a related table)
- `mapSqlValues()` constructs the full domain object from a SQL row

### Dao Base Class

The abstract `Dao` class provides:

- **Table management:** `createTable()`, `fillTableWithData()`, `dropTable()`, `isTableExists()`, `isTableEmpty()`
- **CRUD:** `createItem()`, `readAllItems()`, `readItem()`, `readItemByUrl()`, `readItemByName()`, `updateItem()`, `deleteItem()`, `deleteItemByUrl()`, `deleteItemByName()`
- **Filtering:** `filterByName()`, `filterByFilters()` returning `WhereClauseData` (arrays of WHERE clauses and parameters)
- **Mapping:** `mapSqlValues()` converts a `SqlValue[]` row into a domain object

### WhereClauseData

A helper type for building composable SQL WHERE clauses:

```typescript
interface WhereClauseData {
    whereClauses: string[];  // e.g., ["challenge_rating = ?", "source = ?"]
    params: SqlValue[];      // e.g., [5, "PHB"]
}
```

Multiple `WhereClauseData` results are combined with AND.

## Repository Implementations

Repositories live in `src/data/repositories/` and implement `Repository<SmallItem, FullItem, Filter>`.

Each repository:

1. Takes `DB` in its constructor and extracts the relevant DAO pair
2. Delegates list queries to the SmallDao
3. Delegates detail queries to the FullDao
4. Uses `DB.transaction()` for mutations (`putItem`, `deleteItem`)

## JSON Data Loading

Initial data is stored as JSON files in the `data/` directory at the project root. Each SmallDao's `getLocalData()` method imports and parses the corresponding JSON file. Data is loaded into the database only when a table is empty (first run or after reset).

## Transaction Support

All mutations go through `DB.transaction()`:

1. Executes `BEGIN TRANSACTION`
2. Runs the async callback
3. On success: `COMMIT` then saves database to disk
4. On error: `ROLLBACK` and rethrows the error

The database is persisted to `database.db` after every successful transaction.
