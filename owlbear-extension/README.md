# DnD DM Tools Owlbear Extension

This package builds the Owlbear Rodeo side of the DnD DM Tools encounter sync.

## Commands

Run from the repository root:

```bash
npm run owlbear:check
npm run owlbear:build
npm run owlbear:dev
```

The production root build also runs `npm run owlbear:build`.

## Usage

1. Open the Obsidian initiative tracker.
2. Use the Owlbear snapshot copy button in the tracker toolbar.
3. Open the Owlbear extension popover.
4. Click `Импорт` to import the copied snapshot.
5. Click `В сцену` to create or update tokens in the active scene.
6. Use `Связать` after reloads or scene changes to reconnect tokens by metadata.

## V1 Limits

- Obsidian is the source of truth.
- Sync is snapshot-based, not live bidirectional sync.
- New tokens are placed near the current Owlbear viewport center.
- Repeated pushes update linked tokens instead of creating duplicates.
- Stale scene tokens are reported but not deleted.
