# Step 3: UI Components

In this step, you will create the Svelte components to display the races in the Obsidian UI.

**1. Create a new directory for race components:**

*   `src/ui/layout/race/`

**2. Create the Svelte components:**

*   `src/ui/layout/race/RacesView.svelte`: This component will display the list of all races.
*   `src/ui/layout/race/RaceView.svelte`: This component will show the detailed information for a selected race.

Use the `feat` components (`src/ui/layout/feat/FeatsView.svelte` and `src/ui/layout/feat/FeatView.svelte`) as a reference.

**`src/ui/layout/race/RacesView.svelte`:**

This component will render a list of races, with a search bar for filtering.

```html
<!-- src/ui/layout/race/RacesView.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { SmallRace } from '../../../domain/models/race';
  import type { Races } from '../../../domain/repositories/Races';
  import { Debouncer } from '../../debouncer';
  import SearchInput from '../../components/uikit/SearchInput.svelte';
  import { t } from '../../../lang/helpers';
  import ListItem from '../../components/uikit/ListItem.svelte';
  import { ViewType } from '../../../domain/view_type';

  export let racesRepository: Races;
  export let openItem: (name: string) => void;

  let races: SmallRace[] = [];
  let filteredRaces: SmallRace[] = [];
  let searchText = '';

  const debouncer = new Debouncer();

  onMount(async () => {
    races = await racesRepository.getAll();
    filteredRaces = races;
  });

  function onSearch(e: CustomEvent<string>) {
    debouncer.debounce(() => {
      searchText = e.detail;
      if (!searchText) {
        filteredRaces = races;
        return;
      }
      filteredRaces = races.filter((race) =>
        race.name.rus.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }
</script>

<div class="container">
  <SearchInput on:search={onSearch} />
  {#each filteredRaces as race}
    <ListItem
      name={race.name.rus}
      secondaryInfo={race.source.shortName}
      viewType={ViewType.Race}
      on:click={() => openItem(race.name.rus)}
    />
  {/each}
</div>

<style>
  .container {
    padding: 4px;
  }
</style>
```

**`src/ui/layout/race/RaceView.svelte`:**

This component will display the full details of a single race.

```html
<!-- src/ui/layout/race/RaceView.svelte -->
<script lang="ts">
  import type { Race } from '../../../domain/models/race';
  import Statblock from '../../components/uikit/Statblock.svelte';

  export let race: Race;
</script>

<div class="statblock-container">
  <Statblock title={race.name.rus}
             source={race.source.name}
             description={race.description} />
  <!-- Add more details as needed, like abilities, skills, etc. -->
</div>

<style>
  .statblock-container {
    padding: 8px;
  }
</style>
```

**3. Create an icon (Optional):**

You can add an icon for the races feature. For example, create `src/ui/components/icons/RaceIcon.svelte`. You can find free icons from a library like `lucide-svelte` or create your own SVG icon. For now, you can reuse an existing icon.

**4. Update ViewType:**

Add `Race` to the `ViewType` enum in `src/domain/view_type.ts`.

```typescript
// src/domain/view_type.ts
export enum ViewType {
  // ... existing view types
  Race = 'race-view',
}
```
