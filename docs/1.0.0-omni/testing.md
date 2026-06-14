# Omni Mode Test Strategy

## Automated Coverage

### Settings

- Fresh install receives Omni and an empty single workspace.
- Existing database with no settings receives Separate and all panels enabled.
- Partial, malformed, duplicate, and unknown workspace values normalize safely.
- Settings changes persist and trigger presentation reconciliation.

### Panel Registry and Router

- All 13 keys are unique and registered.
- Separate routing opens the expected view even when its ribbon is disabled.
- Omni routing creates or moves a single tab and opens the requested item.
- Missing item URLs fail without corrupting workspace state.

### Omni State

- Add, close, activate, reorder, and move tabs.
- Prevent duplicate feature tabs.
- Split starts with an empty second tile.
- Collapse merges tabs deterministically.
- Active tabs and focused tile remain valid after every mutation.
- Persisted state restores after reload.

### Search

- Empty query returns no results.
- Results are grouped by panel and include Russian/English labels.
- One rejected repository does not reject the full search.
- A stale request cannot overwrite a newer request.
- Selecting a result routes to the correct full item.

### UI Components

- Empty state and panel picker.
- Search keyboard navigation.
- Tab close focus behavior.
- Keyboard alternatives for reorder and cross-tile movement.
- Single and split render states.

## Regression Matrix

| Area | Risk | Validation |
| --- | --- | --- |
| Markdown processors | Cross-links bypass new routing | Existing processor tests plus routed link tests |
| Feature repositories | Global search changes filters | Repository tests and null-filter search tests |
| Character sheets | Custom controller mount lifecycle | Component/manual edit-save test |
| DM Screen | Custom hierarchy and remote detail load | Search/open hierarchy test |
| Initiative tracker | State lost on tab movement | Manual encounter edit and tab move |
| Obsidian workspace | Leaves/ribbons leak across modes | Mock integration and manual mode cycling |

## Manual Acceptance

1. Upgrade a vault containing 0.9.0 `database.db`.
2. Confirm Separate mode and all ribbon buttons.
3. Disable panels, follow an explicit entity link, and verify temporary opening.
4. Switch to Omni and verify one empty view.
5. Add all panel types, edit supported records, and use cross-feature links.
6. Split, move/reorder tabs, restart Obsidian, and verify restoration.
7. Search Russian and English names and open results.
8. Repeat using keyboard-only controls and a narrow mobile-sized panel.

## Release Gates

- No failing required checks.
- Warning-free `svelte-check`.
- No Critical or High defects.
- Upgrade and fresh-install paths manually validated.
- No database migration or data loss.
- Mode switching leaves exactly the expected plugin views and ribbons.

