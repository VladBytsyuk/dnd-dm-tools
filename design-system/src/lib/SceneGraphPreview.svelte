<script lang="ts">
	import type { ComponentProps } from "svelte";
	import SceneGraph from "./SceneGraph.svelte";
	let { nodes = $bindable([]), links = $bindable([]), ...props }: ComponentProps<typeof SceneGraph> = $props();
	let changeCount = $state(0);
</script>

<SceneGraph {...props} bind:nodes bind:links onChange={(graph) => { changeCount++; props.onChange?.(graph); }} />
<p class="summary" role="status">Сцен: {nodes.length} · Связей: {links.length} · Изменений: {changeCount}</p>

<style>
	.summary { margin: 6px 0 0; color: #888; font: 12px/16px sans-serif; }
</style>
