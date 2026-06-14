# Omni Mode UI and UX

## Settings

Add a `DnD DM Tools` settings tab with Russian labels.

- `Режим панелей`: `Раздельный` / `Омни`
- Separate-only section `Панели`: one toggle for every panel
- Omni-only explanatory text for global search, tabs, and layouts

Changes save immediately. A mode change closes incompatible plugin views and opens Omni when selected.

## Omni Header

- Global search input
- Layout button: one tile or two vertical tiles
- `Открыть панель` action

Search results display feature icon/title, Russian item name, and English name when available.
Results are grouped by feature and support arrow-key navigation, Enter, and Escape.

## Empty Workspace

The initial state contains:

- title `Откройте панель`
- short explanation
- primary action `Выбрать панель`

The panel picker excludes features already present in either tile.

## Tile

Each tile contains:

- an ordered tab strip;
- an active panel content region;
- an empty state when it has no tabs.

Click activates a tab. A close button removes it. Dragging reorders within a strip or moves the tab
to the other tile. A tab context/menu action provides `Переместить вверх/вниз` or
`Переместить в другую область` as a keyboard-accessible alternative.

The focused tile receives a visible focus treatment and is the target for panel picker and search results.

## Layout Behavior

- Single: tile one occupies the view.
- Vertical split: two equal-height rows separated by a visual divider.
- Split creation leaves tile two empty.
- Collapsing merges tile-two tabs after tile-one tabs and keeps tile one's active tab when possible.

## Accessibility and Responsive Rules

- Use buttons for tab and toolbar actions.
- Tab strips expose tab semantics and keyboard activation.
- Focus returns to a predictable tab or picker action after closing a tab.
- Drag operations have menu/button alternatives.
- Tab strips scroll horizontally rather than compressing labels beyond recognition.
- At narrow heights, each split tile keeps an independently scrollable content area.

