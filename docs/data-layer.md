# Data Layer

The data layer owns persistence, TTG data access, source-to-domain mapping, and repository implementations for the domain layer. Repositories orchestrate through stores, services, mappers, and projectors; they do not import Obsidian `requestUrl`, concrete SQL DAO classes, or `DB` directly.

## Directory Structure

```
src/data/
├── database/                   # SQL.js database manager and SQL table adapters
│   ├── DB.ts                   # Database lifecycle, persistence, transactions, DAO construction
│   ├── SmallMonsterSqlTableDao.ts
│   ├── FullMonsterSqlTableDao.ts
│   └── ...                     # One Small + Full DAO pair per repository-backed entity
├── stores/                     # DAO-backed persistence ports and transactional rules
├── services/                   # TTG HTTP services and seed-data services
├── mappers/                    # Source DTO/import payload to domain model conversion
├── projectors/                 # Full item to small item projection
├── ports/                      # Store/service/mapper/projector interfaces
├── repositories/               # Domain repository implementations and factories
└── ui_event_listener.ts        # Cross-feature event handling
```

## DB.ts

`src/data/database/DB.ts` is the central database manager. It:

1. Loads the `sql-wasm.wasm` binary.
2. Opens or creates `database.db`.
3. Constructs DAO instances.
4. Creates missing SQL tables in a transaction.
5. Runs `DatabaseSeedOrchestrator` to seed empty tables.
6. Provides `transaction(callback)` and saves the database after successful commits.

`DB` may know concrete DAO classes because it is the composition root for SQL table adapters. Repository factories read DAO instances from `DB` and assemble repositories with stores, services, mappers, and projectors.

## DAOs

DAOs extend `Dao<T, F>` from `src/domain/Dao.ts` and are SQL table adapters only. A DAO owns:

- SQL table name and schema creation.
- SQL inserts, updates, deletes, and reads.
- SQL filter clause construction.
- SQL row to domain object mapping.

DAOs do not fetch remote data and should not load static JSON seed data. The legacy `getLocalData()` and `fillTableWithData()` hooks are formally deprecated and retained only for compatibility while callers finish moving to the seed flow.

## Stores

Stores in `src/data/stores/` wrap DAO access behind repository-facing ports:

- `GenericSqlItemReadStore` and `GenericSqlItemWriteStore` cover common small/full item reads and writes.
- `RaceStore`, `ClassStore`, `DmScreenStore`, and `CharacterSheetStore` contain feature-specific persistence rules.
- `SeedStore` writes initial seed data into empty tables through DAO methods.
- `DbTransactionalStore` adapts `DB.transaction()` to the store port.

Stores are the place for transaction boundaries and persistence-specific behavior.

## Services

Services in `src/data/services/` fetch or import raw source data and return `ServiceResult` values.

- `TtgApiService` and `TtgHtmlService` are the only data-layer modules that import Obsidian `requestUrl`.
- `TtgService` composes API and HTML calls for full-item retrieval.
- Seed services read static data imported from `src/assets/data`.

Repositories consume service ports; they do not call Obsidian HTTP APIs directly.

## Mappers and Projectors

Mappers convert TTG responses, seed payloads, and import payloads into domain models. Projectors convert full domain models back to their small/list representation for user saves.

This keeps remote response shape handling and projection rules out of repositories and DAOs.

## Repositories

Repositories in `src/data/repositories/` implement `Repository<SmallItem, FullItem, Filter>`.

The common flow is implemented by `SimpleRepository`:

1. Read cached small/full items from an `ItemReadStore`.
2. Fetch uncached full items through a `FullItemReadService`.
3. Map service results into full domain models.
4. Persist fetched or user-saved items through an `ItemWriteStore`.
5. Project full items to small items when updating list tables.

Special repositories compose the same ports with feature stores for behavior such as class HTML, race subrace trees, DM screen descriptions, and character sheet import/save rules.

Use `src/data/repositories/factories.ts` to assemble production repositories from `DB`, stores, services, mappers, and projectors.

## Seed Data

Initial D&D data is stored in `data/` and imported through `src/assets/data`. Seed services read that data, seed mappers normalize feature-specific shapes, and `DatabaseSeedOrchestrator` writes it through `SeedStore` only when a table exists and is empty.

Do not add new DAO `getLocalData()` overrides for seed loading.

## Transactions

All persistence mutations go through the transactional store backed by `DB.transaction()`:

1. `BEGIN TRANSACTION`
2. Execute the async callback.
3. `COMMIT`
4. Save `database.db`.
5. On error, `ROLLBACK` and rethrow.
