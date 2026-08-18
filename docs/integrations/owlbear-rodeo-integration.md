# Owlbear Rodeo Integration Guide

## Overview

Owlbear Rodeo extensions are hosted web assets, not Obsidian plugins loaded directly into Owlbear. Users install an extension by giving Owlbear a hosted `manifest.json`; Owlbear then loads configured extension pages as iframes.

The HTTP contract for those hosted files is documented in [owlbear-rodeo-openapi.json](./owlbear-rodeo-openapi.json). Runtime calls such as `OBR.action.open()` or `OBR.broadcast.sendMessage()` are JavaScript SDK calls inside the iframe, so they are not Swagger endpoints.

## Required Hosted Files

| File | Purpose |
| --- | --- |
| `/manifest.json` | Extension descriptor loaded by Owlbear Rodeo. |
| `/index.html` | Popover UI shown when the extension action is clicked. |
| `/background.html` | Background page that owns the persistent Obsidian WebSocket and Scene API calls. |
| `/assets/{assetPath}` | Icons, scripts, styles, and other static assets. |

Minimum manifest shape:

```json
{
  "name": "DnD DM Tools",
  "version": "0.1.0",
  "manifest_version": 1,
  "description": "DnD DM Tools integration for Owlbear Rodeo.",
  "icon": "/dnd-dm-tools/owlbear-extension/icon-v2.svg",
  "author": "dnd-dm-tools",
  "homepage_url": "https://example.com/owlbear",
  "action": {
    "title": "DnD DM Tools",
    "icon": "/dnd-dm-tools/owlbear-extension/icon-v2.svg",
    "popover": "/dnd-dm-tools/owlbear-extension/index.html",
    "width": 360,
    "height": 540
  }
}
```

## SDK Usage Notes

Use `@owlbear-rodeo/sdk` from the hosted popover or background page. Call `OBR.onReady(...)` before interacting with Owlbear. Check `OBR.isAvailable` when the same page can run outside Owlbear.

Relevant SDK areas for this project:

| SDK area | Use |
| --- | --- |
| `OBR.action` | Read or change action popover width, height, title, icon, badge, and open state. |
| `OBR.scene` | Check whether a scene is open and ready before scene-dependent behavior. |
| `OBR.tool` | Add toolbar tools, tool modes, and tool actions if future map interaction is needed. |
| `OBR.broadcast` | Send ephemeral room/player messages; payloads must be JSON serializable and small. |

## DnD DM Tools live sync

Obsidian remains the source of truth. GitHub Pages hosts the production manifest, popover, background page, scripts, and static UI icons at a stable origin. Development uses `http://localhost:5173/manifest.json`. The local Obsidian server owns the authenticated WebSocket, while a second asset-only server exposes token images, scene status icons, and previews through a session-scoped Cloudflare Quick Tunnel. The background page keeps one authenticated local WebSocket open, reconnects with bounded exponential backoff, requests the current snapshot after reconnect, and applies snapshots to the active Owlbear scene in order. The popover only edits pairing, sends commands, and displays diagnostics through a `BroadcastChannel`.

The WebSocket protocol is version 2. Only one snapshot is in flight at a time. A `snapshot.publish` is acknowledged with the same `snapshotId`; newer pending snapshots replace older pending ones. An unacknowledged snapshot times out after 30 seconds so later updates can continue.

Pairing is stored in browser `localStorage`. Manual disconnect suppresses automatic reconnect until the user connects again. After changing the Obsidian port, update only the pairing code; the production Install Link remains stable.

Starting a new Obsidian process intentionally replaces the persisted encounter with an empty session-reset snapshot. When the background page reconnects, that snapshot removes every token managed by the previous session, including its saved scene position. This is destructive by design: the user must explicitly send the encounter again for the new session.

Token images are content-addressed by SHA-256 of MIME and bytes. The transport copy of a snapshot receives an ephemeral HTTPS `assetBaseUrl`; persisted snapshots never store the Quick Tunnel host. Shared Owlbear items use `/assets/{session-secret}/token-images/{hash}/{mime}` and `/assets/{session-secret}/status-icons/{known-icon}.svg`. The public server returns 404 for the manifest, WebSocket, HTML, scripts, unknown icons, and incorrect session secrets. The cache is capped at 250 MB with LRU cleanup; current and in-flight encounter assets are protected. Missing, invalid, or unavailable images become generated 512×512 SVG tokens with initials and a side/participant color. Fallback use is reported in diagnostics.

## Image preview

When the integration is enabled, the context menu for PNG, JPEG, WebP, GIF, and SVG files in the vault contains **«Отправить в Owlbear»**. The same action is available for a rendered HTTPS image in Reading or Live Preview. Images are limited to 8 MB and external URLs use the same public-host, redirect, and timeout safeguards as token images.

The extension adds a locked image and a dimmed backdrop on the `POPOVER` scene layer. They are centered in the GM's current viewport and the image is fitted into 90% of it. This is a shared scene overlay, not a modal: it does not move a player's camera. Enable Owlbear Sync View when players should see it at approximately full-screen size.

Only one preview is active. Sending another image replaces it. The **«Убрать из Owlbear»** button, closing the preview tab, disabling the integration, and a disconnected Obsidian session remove managed preview items. The current preview exists only for the current Obsidian session; a later connection clears stale preview objects.

When the user enables Owlbear integration on desktop, the plugin downloads a pinned official `cloudflared` artifact for the current supported platform, enforces a size limit, verifies its SHA-256, and installs it atomically. macOS archives are extracted with an allowlist containing only the expected regular file. The install manifest and binary checksum are verified again when the integration is enabled again. Mobile and unsupported architectures do not download anything.

Quick Tunnel runs only while Owlbear integration is enabled. Its public health endpoint must respond before snapshots can be published. If `cloudflared` exits, the plugin removes the public URL immediately, stops new synchronization, retries with exponential backoff capped at 30 seconds, and republishes the latest snapshot after a new tunnel passes health verification. There is deliberately no localhost or Data URL fallback for shared scene items.

## Hosting And Security

- The production Install Link and extension pages use `https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/`; development uses `http://localhost:5173`. The authenticated WebSocket remains on `http://localhost` and is required only by the GM browser.
- Token images, scene marker icons, and previews use the temporary HTTPS Quick Tunnel so remote players can fetch them. The tunnel never hosts the extension manifest, HTML, or JavaScript.
- The public asset path contains a random session secret but is not an authorization boundary. Do not use the integration for sensitive images.
- The preview image URL uses the same temporary public asset path. Removing a preview hides it from the Owlbear scene but cannot prevent a player from retaining a URL or a copy that they already received.
- Quick Tunnel has no availability guarantee; the integration is fail-closed while it is unavailable.
- Keep asset URLs stable because users install the extension through the manifest URL.
- Request iframe permissions only when required and include a concrete reason in the manifest.
- Avoid storing secrets in the extension page. Treat the iframe as browser code visible to users.
- Keep all scene and WebSocket state in the background page so closing the popover does not interrupt live sync.

## Sources

- [Getting Started](https://docs.owlbear.rodeo/extensions/getting-started/)
- [Manifest Reference](https://docs.owlbear.rodeo/extensions/reference/manifest/)
- [SDK API Overview](https://docs.owlbear.rodeo/extensions/apis/)
- [Action API](https://docs.owlbear.rodeo/extensions/apis/action/)
- [Broadcast API](https://docs.owlbear.rodeo/extensions/apis/broadcast/)
- [Scene API](https://docs.owlbear.rodeo/extensions/apis/scene/)
- [Tool API](https://docs.owlbear.rodeo/extensions/apis/tool/)
- [Owlbear Rodeo SDK](https://github.com/owlbear-rodeo/sdk)

## Validation Checklist

- `manifest.json` is valid JSON and reachable from Owlbear.
- `action.popover` resolves to a reachable HTML page.
- Icon and asset paths resolve from the hosted origin.
- Popover code waits for `OBR.onReady`.
- Scene-dependent code checks `OBR.scene.isReady()`.
- No SDK calls are represented as Swagger HTTP endpoints.
