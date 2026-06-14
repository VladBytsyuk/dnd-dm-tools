# Помощник ДМа UI and UX

## Entry Point

The plugin exposes one ribbon icon and side-panel title: `Помощник ДМа`. It does not register a
plugin settings tab.

## Header

- Global search input
- Panel picker
- One-tile/two-tile layout toggle

Search results show feature and item names. Selecting a result opens it in the focused tile.

## Tiles and Tabs

Each tile owns an ordered tab list and one active tab. Users can close, reorder, drag, or move tabs
between tiles. Buttons provide keyboard-accessible alternatives to drag-and-drop. The initial empty
state prompts the user to select a panel.

The split layout uses two equal-height rows with independently scrolling content. Collapsing the
layout appends tile-two tabs to tile one without duplication.
