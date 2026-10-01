<script lang="ts">
	import RedesignedFullItem from "./RedesignedFullItem.svelte";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
	let { panelKey, currentItem, uiEventListener }: { panelKey: PanelKey; currentItem: any; uiEventListener: IUiEventListener } = $props();
</script>

<RedesignedFullItem {panelKey} {currentItem} {uiEventListener} />
