# Step 1: Data Models

Create the necessary data models for the "races" feature. These models will define the structure of the race data used throughout the plugin.

**1. Create a new directory:**

*   `src/domain/models/race/`

**2. Create the following files inside the new directory:**

*   `src/domain/models/race/SmallRace.ts`
*   `src/domain/models/race/FullRace.ts`
*   `src/domain/models/race/RaceFilters.ts`

**3. `src/domain/models/race/SmallRace.ts`:**

This file will contain the main interface for `SmallRace`. Based on the provided `data/races.json` file, define the following interface. You can look at files in `src/domain/models/` for an example. Specify aevery type, do not use any. Prefer existing types from `/src/domain/models/common`.


**4. `src/domain/models/race/FullRace.ts`:**

This file will contain the main interface for `FullRace` and some helper functions. Based on the provided `data/race_example.json` file, define the following interface. You can look at files in `src/domain/models/` for an example. Specify aevery type, do not use any. Prefer existing types from `/src/domain/models/common`.


**5. `src/domain/models/race/RaceFilters.ts`:**

This file will contain the main interface for `RaceFilters`. It should have fileds: `abilities`, `types`, `sources`. You can look at files in `src/domain/models/` for an example. Specify aevery type, do not use any. Prefer existing types from `/src/domain/models/common`.

**6. Cover new files with tests if needed.**

**7. Check `/src/assets/data/races.ts`**

This file should compile successfully after creation of all domain models.
