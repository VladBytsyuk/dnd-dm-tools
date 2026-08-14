# DnD DM Tools Owlbear Extension

This package builds the Owlbear Rodeo side of the DnD DM Tools encounter integration.

## Commands

Run from the repository root:

```bash
npm ci
npm run owlbear:check
npm run owlbear:build
npm run owlbear:dev
```

The production root build also creates both Owlbear entry points and copies them into the plugin release bundle.

## Usage

1. Enable Owlbear integration in the Obsidian desktop plugin settings.
2. Copy the Install Link and pairing code from the settings tab.
3. Install or update the extension in Owlbear using the Install Link.
4. Open the extension action once and enter the pairing code.
5. Open an initiative tracker in Obsidian and send the encounter to Owlbear.
6. Keep editing the encounter in Obsidian; the background page keeps the Owlbear scene synchronized after the popover is closed.
7. Use the extension popover to reconnect a scene or inspect diagnostics.

## Synchronization model

- Obsidian is the source of truth.
- Synchronization is snapshot-based and ordered; only the latest pending snapshot is retained.
- The Owlbear background page owns the persistent WebSocket connection.
- Managed stale tokens from the current encounter are removed automatically.
- New tokens are placed near the current Owlbear viewport center.
- Every applied snapshot is acknowledged by `snapshotId`.

## Images and fallback tokens

Images are stored in a content-addressed local cache under the plugin data directory. The cache is deduplicated and limited to 250 MB with LRU cleanup. The current and in-flight encounter assets are protected from eviction.

If an image is missing, invalid, or unavailable, synchronization continues with a generated 512×512 SVG token containing the participant's initials and side/participant color.

## Development and release

- Production builds use only the extension bundle installed next to the Obsidian plugin.
- Development builds use only the configured `developmentExtensionPath` pointing to `owlbear-extension/dist`.
- A missing or incomplete development bundle is reported as an error instead of silently falling back to a release bundle.

After changing the configured port, copy the new Install Link and pairing code and update the installed Owlbear extension.
