# Step 1: Data Models

Create the necessary data models for the "races" feature. These models will define the structure of the race data used throughout the plugin.

**1. Create a new directory:**

*   `src/domain/models/race/`

**2. Create the following files inside the new directory:**

*   `src/domain/models/race/index.ts`
*   `src/domain/models/race/Race.ts`

**3. `src/domain/models/race/Race.ts`:**

This file will contain the main interfaces for `Race`, `Subrace`, and related types. Based on the provided `data/races.json` and `data/race_example.json` files, define the following interfaces. You can look at `src/domain/models/feat/Feat.ts` for an example of `Name`, `Ability`, `Skill`, and `Source`.

```typescript
import type { Ability } from '../common/Ability';
import type { Name } from '../common/Name';
import type { Skill } from '../common/Skill';
import type { Source } from '../common/Source';

export interface SmallRace {
  name: Name;
  url: string;
  abilities: Ability[];
  type: string;
  source: Source;
  image?: string;
  subraces?: SmallRace[];
}

export interface Race extends Omit<SmallRace, 'subraces'> {
  description: string;
  size: string;
  speed: { value: number }[];
  skills: Skill[];
  subraces?: Race[];
}
```

**4. `src/domain/models/race/index.ts`:**

Export the new models.

```typescript
export * from './Race';
```

**5. Update `src/domain/models/common/index.ts`:**

You may need to add exports for `Ability`, `Name`, `Skill`, and `Source` if they are not already exported from there. Check `src/domain/models/common/` to see if these types already exist, and if so, reuse them. If they don't exist, create them in `src/domain/models/common/` and then export them.
From a quick look, it seems these common models already exist.
