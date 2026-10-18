<script lang="ts">
	import { Panel, useSvelteFlow } from "@xyflow/svelte";
	import Plus from "lucide-svelte/icons/plus";
	import Minus from "lucide-svelte/icons/minus";
	import Maximize from "lucide-svelte/icons/maximize";
	import Trash from "lucide-svelte/icons/trash-2";
	import { SCENE_WIDTH, SCENE_HEIGHT } from "./sceneGraphModel";

	let { editable, showAddScene = true, canDelete, onAdd, onDelete }: { editable: boolean; showAddScene?: boolean; canDelete: boolean; onAdd: (anchor: HTMLButtonElement) => void; onDelete: () => void } = $props();
	const flow = useSvelteFlow();
	export function toFlowPosition(point: { x: number; y: number }) { return flow.screenToFlowPosition(point); }
	export function revealNode(id: string, bounds: { left: number; top: number; right: number; bottom: number }) {
		const node = flow.getNode(id);
		if (!node) return;
		const point = flow.flowToScreenPosition(node.position);
		const zoom = flow.getZoom();
		if (point.x >= bounds.left + 12 && point.x + SCENE_WIDTH * zoom <= bounds.right - 12 && point.y >= bounds.top + 72 && point.y + SCENE_HEIGHT * zoom <= bounds.bottom - 60) return;
		void flow.setCenter(node.position.x + SCENE_WIDTH / 2, node.position.y + SCENE_HEIGHT / 2, { zoom });
	}
</script>

{#if editable}
<Panel position="top-left">
	<div class="toolbar">
		{#if showAddScene}<button type="button" class="add-scene" onclick={(event) => onAdd(event.currentTarget)}><Plus size={14} style="width: calc(14 * var(--ds-media-unit, 1px)); height: calc(14 * var(--ds-media-unit, 1px))" aria-hidden={true} />Добавить сцену</button>{/if}
		<button type="button" aria-label="Удалить выделенное" title="Удалить выделенное" disabled={!canDelete} onclick={onDelete}><Trash size={14} style="width: calc(14 * var(--ds-media-unit, 1px)); height: calc(14 * var(--ds-media-unit, 1px))" aria-hidden={true} /></button>
	</div>
</Panel>
{/if}
<Panel position="bottom-left">
	<div class="toolbar">
		<button type="button" aria-label="Увеличить масштаб" title="Увеличить масштаб" onclick={() => flow.zoomIn()}><Plus size={14} style="width: calc(14 * var(--ds-media-unit, 1px)); height: calc(14 * var(--ds-media-unit, 1px))" aria-hidden={true} /></button>
		<button type="button" aria-label="Уменьшить масштаб" title="Уменьшить масштаб" onclick={() => flow.zoomOut()}><Minus size={14} style="width: calc(14 * var(--ds-media-unit, 1px)); height: calc(14 * var(--ds-media-unit, 1px))" aria-hidden={true} /></button>
		<button type="button" aria-label="Показать весь граф" title="Показать весь граф" onclick={() => flow.fitView({ padding: 0.2, maxZoom: 1 })}><Maximize size={14} style="width: calc(14 * var(--ds-media-unit, 1px)); height: calc(14 * var(--ds-media-unit, 1px))" aria-hidden={true} /></button>
	</div>
</Panel>

<style>
	.toolbar { display: flex; gap: calc(2 * var(--ds-media-unit, 1px)); padding: calc(3 * var(--ds-media-unit, 1px)); border-radius: calc(5 * var(--ds-media-unit, 1px)); background: var(--scene-toolbar-bg); color: var(--scene-ink); box-shadow: 0 calc(2 * var(--ds-media-unit, 1px)) calc(4 * var(--ds-media-unit, 1px)) rgb(0 0 0 / 20%); }
	.toolbar button { all: unset; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: calc(4 * var(--ds-media-unit, 1px)); min-width: calc(26 * var(--ds-media-unit, 1px)); height: calc(26 * var(--ds-media-unit, 1px)); padding: calc(4 * var(--ds-media-unit, 1px)); border-radius: calc(3 * var(--ds-media-unit, 1px)); font: calc(10 * var(--ds-media-unit, 1px))/calc(12 * var(--ds-media-unit, 1px)) "Golos Text", sans-serif; cursor: pointer; }
	.toolbar button:hover:not(:disabled) { background: rgb(127 127 127 / 25%); }
	.toolbar button:disabled { opacity: 0.4; cursor: default; }
	.toolbar button:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(1 * var(--ds-media-unit, 1px)); }
</style>
