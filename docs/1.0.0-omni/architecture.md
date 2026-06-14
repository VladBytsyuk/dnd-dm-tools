# Omni Mode Architecture

## Current State

`BaseFeature` constructs a repository and a `BaseSidePanel`. Every panel registers its own
`ItemView` and ribbon button. The initiative tracker uses a separate registration function.
Cross-feature links call `BaseFeature.onItemClick`, which opens that feature's independent view.
No plugin settings system currently exists.

## Target Components

### Settings Store

Loads, normalizes, and saves a versioned `PluginSettings` payload. It owns defaults and upgrade
detection but contains no view logic.

### Panel Registry

A stable `PanelKey` identifies each panel. A `PanelDescriptor` supplies title, icon, search support,
and a mount function. Existing side-panel classes provide descriptors so their Svelte content can
be hosted by either presentation mode.

### Panel Router

All explicit panel and item opens pass through one router:

```ts
openPanel(panelKey: PanelKey): Promise<void>
openItem(panelKey: PanelKey, url: string): Promise<void>
```

In Separate mode it opens the independent view. In Omni mode it adds or moves the tab into the
focused tile, activates it, and passes the resolved full item to the mounted panel.

### Separate Mode Manager

Registers independent views for compatibility and owns mode-specific ribbon buttons. Panel settings
control ordinary ribbon visibility, not feature availability.

### Omni Mode Manager

Registers one `ItemView`, owns the Omni ribbon button, exposes workspace mutations, coordinates
search, and saves normalized workspace state.

## Settings Model

```ts
type PluginMode = "separate" | "omni";
type OmniLayout = "single" | "vertical-split";

interface PluginSettings {
  schemaVersion: 1;
  mode: PluginMode;
  separatePanels: Record<PanelKey, boolean>;
  omniWorkspace: {
    layout: OmniLayout;
    focusedTile: 0 | 1;
    tiles: [
      { tabs: PanelKey[]; activeTab: PanelKey | null },
      { tabs: PanelKey[]; activeTab: PanelKey | null },
    ];
  };
}
```

Normalization removes unknown and duplicate keys, repairs active tabs, and forces focused tile zero
for a single layout.

## Search Flow

1. Debounce non-empty query input.
2. Query every descriptor with a repository using `getFilteredSmallItems(query, null)`.
3. Convert records to `{ panelKey, url, title, subtitle }`.
4. Use `Promise.allSettled` so one repository failure is isolated.
5. Ignore a response when its request sequence is stale.
6. On selection, route the item into the focused tile.

The initiative tracker is not searchable because it has no repository records.

## View Lifecycle

All view types remain registered for the plugin lifetime. Mode changes:

- remove mode-specific ribbon elements;
- detach incompatible plugin leaves;
- rebuild the selected mode's ribbon controls;
- open/reveal Omni when switching to Omni;
- preserve the last active feature when returning to Separate when possible.

Svelte mounts are explicitly unmounted when an Obsidian view or Omni tab is destroyed.

## Compatibility

- Existing view IDs remain stable.
- Repository interfaces and database tables do not change.
- Existing markdown processors and command IDs remain stable.
- Cross-feature links change only at the routing boundary.

