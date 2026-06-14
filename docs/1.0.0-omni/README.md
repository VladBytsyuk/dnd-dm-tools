# Version 1.0.0: Omni Mode

Status: implemented on `feature/omni`

## Goal

Version 1.0.0 introduces two presentation modes for all 13 plugin side panels:

- **Separate** keeps independent Obsidian views and lets users hide individual ribbon buttons.
- **Omni** replaces those entry points with one parent view containing feature tabs, global search, and one- or two-tile layouts.

The data layer, markdown processors, commands, and feature repositories remain available in both modes.

## Confirmed Decisions

- Existing 0.9.0 installations start in Separate mode.
- Fresh installations start in Omni mode.
- Mode changes apply immediately without reloading the plugin.
- Omni starts with one empty tile and prompts the user to open a panel.
- The split layout contains two equal-height, vertically stacked tiles.
- Each feature can appear once in Omni and may be reordered or moved between tiles.
- Omni persists layout, tab order, focused tile, and active tabs only.
- Global search searches entity records and opens the selected record in its feature tab.
- Separate-mode panel toggles hide normal entry points but explicit links may open a disabled panel temporarily.

## Panel Inventory

Bestiary, Spellbook, DM Screen, Arsenal, Armory, Equipment, Artifactory, Backgrounds,
Feats, Races, Classes, Character Sheets, and Initiative Tracker.

## Documents

- [Requirements](./requirements.md)
- [Architecture](./architecture.md)
- [UI and UX](./ui-ux.md)
- [Implementation Plan](./implementation-plan.md)
- [Testing](./testing.md)
- [Risks](./risks.md)

## Milestones

1. Settings and panel registry
2. Unified open routing and Separate mode
3. Omni shell, tabs, and layout persistence
4. Global search and cross-feature navigation
5. Migration, regression validation, and 1.0.0 release preparation
