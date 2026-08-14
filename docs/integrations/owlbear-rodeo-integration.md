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
  "icon": "/icon.svg",
  "author": "dnd-dm-tools",
  "homepage_url": "https://example.com/owlbear",
  "action": {
    "title": "DnD DM Tools",
    "icon": "/icon.svg",
    "popover": "/index.html",
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

Obsidian remains the source of truth. The local Obsidian server hosts the manifest, popover, background page, and token-image cache. The background page keeps one authenticated WebSocket open, reconnects with bounded exponential backoff, requests the current snapshot after reconnect, and applies snapshots to the active Owlbear scene in order. The popover only edits pairing, sends commands, and displays diagnostics through a `BroadcastChannel`.

The WebSocket protocol is version 2. Only one snapshot is in flight at a time. A `snapshot.publish` is acknowledged with the same `snapshotId`; newer pending snapshots replace older pending ones. An unacknowledged snapshot times out after 30 seconds so later updates can continue.

Pairing is stored in browser `localStorage`. Manual disconnect suppresses automatic reconnect until the user connects again. After changing the Obsidian port, copy the new Install Link and pairing code and update the Owlbear extension.

Token images are content-addressed by SHA-256 of MIME and bytes and served from the local `/token-images/` route. The cache is capped at 250 MB with LRU cleanup; current and in-flight encounter assets are protected. Missing, invalid, or unavailable images become generated 512×512 SVG tokens with initials and a side/participant color. Fallback use is reported in diagnostics.

## Hosting And Security

- Publicly hosted extensions should use HTTPS. DnD DM Tools intentionally serves its paired extension over `http://localhost` because the assets and WebSocket stay on the Obsidian desktop host.
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
