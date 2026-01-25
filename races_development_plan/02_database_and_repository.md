# Step 2: Database and Repository

This step involves setting up the database tables, data access objects (DAOs), and the repository for managing race data.

**1. Create data loader:**

*   Create `src/assets/data/races.ts` to handle the loading of the races data from `data/races.json`.

```typescript
// src/assets/data/races.ts
import data from '../../../../data/races.json';
import type { SmallRace } from '../../../domain/models/race/Race';

export const getRaces = () => data as SmallRace[];
```

**2. Create Database DAOs:**

*   Create `src/data/database/SmallRaceSqlTableDao.ts`. This will manage the `races` table with small race info.
*   Create `src/data/database/FullRaceSqlTableDao.ts`. This will manage the `races_full` table with full race details.

You can use `SmallFeatSqlTableDao.ts` and `FullFeatSqlTableDao.ts` as a reference.

**`src/data/database/SmallRaceSqlTableDao.ts`:**
```typescript
// src/data/database/SmallRaceSqlTableDao.ts
import type { Database } from 'sql.js';
import type { SmallRace } from '../../domain/models/race';
import { BaseSqlTableDao } from './base/BaseSqlTableDao';
import type { SqlTableDao } from './base/SqlTableDao';

export class SmallRaceSqlTableDao extends BaseSqlTableDao<SmallRace> implements SqlTableDao<SmallRace> {
  constructor(db: Database) {
    super(db, 'races');
  }

  protected getTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        name TEXT PRIMARY KEY,
        url TEXT,
        abilities TEXT,
        type TEXT,
        source TEXT,
        image TEXT
      );
    `;
  }

  protected itemToRow(item: SmallRace): (string | number | null)[] {
    return [
      item.name.rus,
      item.url,
      JSON.stringify(item.abilities),
      item.type,
      JSON.stringify(item.source),
      item.image || null,
    ];
  }
}
```

**`src/data/database/FullRaceSqlTableDao.ts`:**
```typescript
// src/data/database/FullRaceSqlTableDao.ts
import type { Database } from 'sql.js';
import type { Race } from '../../domain/models/race';
import { BaseSqlTableDao } from './base/BaseSqlTableDao';
import type { SqlTableDao } from './base/SqlTableDao';

export class FullRaceSqlTableDao extends BaseSqlTableDao<Race> implements SqlTableDao<Race> {
  constructor(db: Database) {
    super(db, 'races_full');
  }

  protected getTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        name TEXT PRIMARY KEY,
        description TEXT,
        size TEXT,
        speed TEXT,
        skills TEXT,
        subraces TEXT,
        abilities TEXT,
        type TEXT,
        source TEXT,
        image TEXT
      );
    `;
  }

  protected itemToRow(item: Race): (string | number | null)[] {
    return [
      item.name.rus,
      item.description,
      item.size,
      JSON.stringify(item.speed),
      JSON.stringify(item.skills),
      JSON.stringify(item.subraces || []),
      JSON.stringify(item.abilities),
      item.type,
      JSON.stringify(item.source),
      item.image || null,
    ];
  }
}
```

**3. Create Repository:**

*   Create `src/domain/repositories/Races.ts` (interface).
*   Create `src/data/repositories/RacesRepository.ts` (implementation).

**`src/domain/repositories/Races.ts`:**
```typescript
// src/domain/repositories/Races.ts
import type { Race, SmallRace } from '../models/race';
import type { Repository } from './Repository';

export interface Races extends Repository<SmallRace, Race> {}
```

**`src/data/repositories/RacesRepository.ts`:**
```typescript
// src/data/repositories/RacesRepository.ts
import type { App } from 'obsidian';
import { getRaces } from '../../assets/data/races';
import type { Race, SmallRace } from '../../domain/models/race';
import type { Races } from '../../domain/repositories/Races';
import type { FullRaceSqlTableDao } from '../database/FullRaceSqlTableDao';
import type { SmallRaceSqlTableDao } from '../database/SmallRaceSqlTableDao';
import { BaseRepository } from './BaseRepository';

export class RacesRepository extends BaseRepository<SmallRace, Race> implements Races {
  constructor(
    app: App,
    smallRaceDao: SmallRaceSqlTableDao,
    fullRaceDao: FullRaceSqlTableDao,
  ) {
    super(app, smallRaceDao, fullRaceDao, 'races', getRaces());
  }

  protected override async getRemoteItems(): Promise<Race[]> {
    // For races, we can use a local example file instead of fetching from a remote URL.
    const raceExample = await import('../../../../data/race_example.json');
    return [raceExample.default as Race];
  }
}
```

**4. Testing:**
*   Create test files for the new DAOs:
    *   `test/data/database/SmallRaceSqlTableDao.test.ts`
    *   `test/data/database/FullRaceSqlTableDao.test.ts`

You can copy and adapt `test/data/database/SmallFeatSqlTableDao.test.ts` and `test/data/database/FullFeatSqlTableDao.test.ts`. You'll also need a mock race object in `test/__mocks__/data.ts`.
