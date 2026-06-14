# Version 1.0.0: Помощник ДМа

Status: implemented on `feature/omni`

## Goal

Version 1.0.0 replaces the plugin's independent side panels with one Obsidian view named
**Помощник ДМа**. It provides global search, feature tabs, and one- or two-tile layouts for all
13 existing tools.

## Confirmed Behavior

- The plugin registers one view and one ribbon button.
- New workspaces start with one empty tile and prompt the user to open a panel.
- The split layout contains two equal-height, vertically stacked tiles.
- Each feature can appear once and may be reordered or moved between tiles.
- Layout, tab order, focused tile, and active tabs persist.
- Global search opens records in their matching feature tab.
- Existing Assistant workspace data is preserved.
- Legacy standard-mode data migrates to an empty Assistant workspace and legacy leaves close.

## Documents

- [Requirements](./requirements.md)
- [Architecture](./architecture.md)
- [UI and UX](./ui-ux.md)
- [Implementation Plan](./implementation-plan.md)
- [Testing](./testing.md)
- [Risks](./risks.md)
