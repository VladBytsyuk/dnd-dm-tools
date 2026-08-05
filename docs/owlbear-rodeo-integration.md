# Owlbear Rodeo Integration Guide

## Overview

Owlbear Rodeo extensions are hosted web assets, not Obsidian plugins loaded directly into Owlbear. Users install an extension by giving Owlbear a hosted `manifest.json`; Owlbear then loads configured extension pages as iframes.

The HTTP contract for those hosted files is documented in [owlbear-rodeo-openapi.json](./owlbear-rodeo-openapi.json). Runtime calls such as `OBR.action.open()` or `OBR.broadcast.sendMessage()` are JavaScript SDK calls inside the iframe, so they are not Swagger endpoints.

## Required Hosted Files

| File | Purpose |
| --- | --- |
| `/manifest.json` | Extension descriptor loaded by Owlbear Rodeo. |
| `/popover.html` | UI shown when the extension action is clicked. |
| `/background.html` | Optional background page for persistent listeners. |
| `/assets/{assetPath}` | Icons, scripts, styles, and other static assets. |

Minimum manifest shape:

```json
{
  "name": "DnD DM Tools",
  "version": "0.1.0",
  "manifest_version": 1,
  "description": "DnD DM Tools integration for Owlbear Rodeo.",
  "icon": "/assets/icon.svg",
  "author": "dnd-dm-tools",
  "homepage_url": "https://example.com/owlbear",
  "action": {
    "title": "DnD DM Tools",
    "icon": "/assets/icon.svg",
    "popover": "/popover.html",
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

## Integration Direction

For dnd-dm-tools, keep the Owlbear extension separate from the Obsidian plugin runtime. The extension can expose a small popover UI and, if needed later, communicate with a plugin-facing service chosen specifically for Obsidian-to-browser integration.

Do not model SDK methods as REST endpoints. If the project later needs a bridge between Owlbear and Obsidian, define that bridge as its own API with explicit auth, pairing, message schema, and failure handling.

## Hosting And Security

- Host the extension files over HTTPS.
- Keep asset URLs stable because users install the extension through the manifest URL.
- Request iframe permissions only when required and include a concrete reason in the manifest.
- Avoid storing secrets in the extension page. Treat the iframe as browser code visible to users.
- Use a background page only when persistent room-level behavior is required.

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
