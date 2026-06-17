<script lang="ts">
	import { onMount } from "svelte";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

	let {
		panelKey,
		mountPanel,
	}: {
		panelKey: PanelKey;
		mountPanel: (key: PanelKey, element: Element) => Promise<() => void>;
	} = $props();

	let host: HTMLDivElement;

	onMount(() => {
		let cleanup: (() => void) | undefined;
		let disposed = false;
		mountPanel(panelKey, host).then((value) => {
			if (disposed) value();
			else cleanup = value;
		});
		return () => {
			disposed = true;
			cleanup?.();
		};
	});
</script>

<div class="omni-panel-content" bind:this={host}></div>

<style>
	.omni-panel-content {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		overflow: visible;
		width: 100%;
	}
</style>
