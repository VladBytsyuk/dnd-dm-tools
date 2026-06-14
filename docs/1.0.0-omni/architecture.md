# Помощник ДМа Architecture

## Components

### Workspace State

```ts
interface AssistantWorkspaceState {
  layout: "single" | "vertical-split";
  focusedTile: 0 | 1;
  tiles: [AssistantTileState, AssistantTileState];
}
```

The plugin persists this workspace directly through Obsidian's plugin data API. Loading removes
unknown and duplicate keys and repairs active tabs. Legacy Assistant workspaces retain their state.
Legacy standard-mode data resets to an empty workspace and requests one-time legacy-leaf cleanup.

### Panel Registry

`PanelHost` exposes feature metadata, Svelte mounting, search, and item resolution. Feature panels
do not register Obsidian views or ribbon buttons.

### Panel Manager

The manager registers the sole Assistant `ItemView`, adds its ribbon button, owns feature-tab
routing, coordinates global search, persists workspace state, and detaches legacy view IDs during
standard-mode migration.

### Search and Navigation

Search queries repositories in parallel with failure isolation. Item links and search results both
route through the manager, which activates the feature in the focused tile before mounting its
resolved full item.

## Compatibility

- The internal Assistant view ID remains `dnd-dm-tools-omni` so existing saved workspace layouts
  continue to resolve.
- Repository interfaces, database tables, command IDs, and markdown block identifiers do not change.
