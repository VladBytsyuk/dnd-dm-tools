# Step 4: Plugin Integration

This step will guide you through integrating the new "races" feature into the main plugin file (`src/main.ts`), making it accessible within Obsidian.

**1. Import necessary modules in `src/main.ts`:**

```typescript
// src/main.ts
// ... other imports
import { RacesRepository } from './data/repositories/RacesRepository';
import { SmallRaceSqlTableDao } from './data/database/SmallRaceSqlTableDao';
import { FullRaceSqlTableDao } from './data/database/FullRaceSqlTableDao';
import RacesView from './ui/layout/race/RacesView.svelte';
import RaceView from './ui/layout/race/RaceView.svelte';
import { ViewType } from './domain/view_type';
import { t }d from './lang/helpers';
// You may need an icon, for example:
import RaceIcon from './ui/components/icons/RaceIcon.svelte';
```

**2. Initialize the repository in `DndStatblockPlugin` class:**

Inside the `DndStatblockPlugin` class in `src/main.ts`, declare the repository and initialize it in the `onload` method.

```typescript
// src/main.ts
export default class DndStatblockPlugin extends Plugin {
  // ... other properties
  private racesRepository: RacesRepository;

  async onload() {
    // ... other initializations
    this.racesRepository = new RacesRepository(
      this.app,
      new SmallRaceSqlTableDao(this.db),
      new FullRaceSqlTableDao(this.db)
    );
    await this.racesRepository.init();

    // ... rest of onload
  }
}
```

**3. Add a ribbon icon:**

In the `onload` method, add a ribbon icon to open the races view.

```typescript
// src/main.ts -> DndStatblockPlugin -> onload
this.addRibbonIcon('dice', t('Races'), () => {
  this.openView(ViewType.Races);
});
// Replace 'dice' with a more appropriate icon if you have one.
```

**4. Register the new view:**

You'll need a generic way to open views, or a specific method for each. Assuming a generic `openView` method and a factory for views, you need to register the new `RacesView` and `RaceView`.

Looking at `main.ts`, there is `initViews` method. Let's add the new view there.

```typescript
// src/main.ts -> DndStatblockPlugin -> initViews
this.registerView(ViewType.Races, (leaf) => {
  const view = new CustomView(leaf, {
    Component: RacesView,
    props: {
      racesRepository: this.racesRepository,
      openItem: this.openRace.bind(this),
    },
    icon: 'dice', // change icon
    title: 'Races',
  });
  return view;
});

this.registerView(ViewType.Race, (leaf, name) => {
  const view = new CustomView(leaf, {
    Component: RaceView,
    props: {
      raceName: name, // The name of the race to display
    },
    icon: 'dice', // change icon
    title: name,
  });
  return view;
});
```
You will also need to implement `openRace` method.

```typescript
// src/main.ts -> DndStatblockPlugin
private async openRace(name: string) {
  const race = await this.racesRepository.get(name);
  // Logic to open the race in a new leaf, similar to other items.
  // This likely involves activating a view of type ViewType.Race
}
```
You probably have a generic `openEntity` method. If so, `openRace` will use it. If not, you may need to implement it. Looking at similar projects, you probably have something like `this.app.workspace.getLeaf(true).open(new CustomView(...))`. Let's assume you have a method to open a view by type and name.

**5. Add a command:**

Add a command to open the races view from the command palette.

```typescript
// src/main.ts -> DndStatblockPlugin -> onload
this.addCommand({
  id: 'open-races',
  name: t('Open races'),
  callback: () => {
    this.openView(ViewType.Races);
  },
});
```

Make sure you have a `openView` method that can handle `ViewType.Races`. If not, you will need to implement it based on how other views are opened in the plugin. A common pattern is to use `this.app.workspace.getLeaf` and then set state or open a view.
From the existing code, it seems you have a `CustomView` and a way to register views. The above snippets should be close to what's needed.
You should check for `openView` method implementation in `main.ts` and adjust the code accordingly.
It seems there is a `SidePanel` class that is responsible for opening views. You should check it and add the new view to it.
Yes, looking at the file structure, there is a `sidepanel` directory. You will likely need to add the races view to the side panel.

Update `src/ui/layout/sidepanel/SidePanel.svelte` to include the new view.
You'll need to add a new `Tab` to the `Tabber` component.

This step requires careful integration with the existing navigation and view management system of the plugin.
