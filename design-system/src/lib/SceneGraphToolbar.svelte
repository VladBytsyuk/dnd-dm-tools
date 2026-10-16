<script lang="ts">
	import { Panel, useSvelteFlow } from "@xyflow/svelte";
	import Plus from "lucide-svelte/icons/plus";
	import Minus from "lucide-svelte/icons/minus";
	import Maximize from "lucide-svelte/icons/maximize";
	import Trash from "lucide-svelte/icons/trash-2";

	let { editable, showAddScene = true, canDelete, onAdd, onDelete }: { editable: boolean; showAddScene?: boolean; canDelete: boolean; onAdd: (anchor: HTMLButtonElement) => void; onDelete: () => void } = $props();
	const flow = useSvelteFlow();
	export function toFlowPosition(point: { x: number; y: number }) { return flow.screenToFlowPosition(point); }
	export function revealNode(id: string, bounds: { left: number; top: number; right: number; bottom: number }) {
		const node = flow.getNode(id);
		if (!node) return;
		const point = flow.flowToScreenPosition(node.position);
		const zoom = flow.getZoom();
		if (point.x >= bounds.left + 8 && point.x + 196 * zoom <= bounds.right - 8 && point.y >= bounds.top + 48 && point.y + 64 * zoom <= bounds.bottom - 40) return;
		void flow.setCenter(node.position.x + 98, node.position.y + 32, { zoom });
	}
</script>

{#if editable}
<Panel position="top-left">
	<div class="toolbar">
		{#if showAddScene}<button type="button" class="add-scene" onclick={(event) => onAdd(event.currentTarget)}><Plus size={14} aria-hidden={true} />Добавить сцену</button>{/if}
		<button type="button" aria-label="Удалить выделенное" title="Удалить выделенное" disabled={!canDelete} onclick={onDelete}><Trash size={14} aria-hidden={true} /></button>
	</div>
</Panel>
{/if}
<Panel position="bottom-left">
	<div class="toolbar">
		<button type="button" aria-label="Увеличить масштаб" title="Увеличить масштаб" onclick={() => flow.zoomIn()}><Plus size={14} aria-hidden={true} /></button>
		<button type="button" aria-label="Уменьшить масштаб" title="Уменьшить масштаб" onclick={() => flow.zoomOut()}><Minus size={14} aria-hidden={true} /></button>
		<button type="button" aria-label="Показать весь граф" title="Показать весь граф" onclick={() => flow.fitView({ padding: 0.2, maxZoom: 1 })}><Maximize size={14} aria-hidden={true} /></button>
	</div>
</Panel>

<style>
	.toolbar { display: flex; gap: 2px; padding: 3px; border-radius: 5px; background: var(--scene-toolbar-bg); color: var(--scene-ink); box-shadow: 0 2px 4px rgb(0 0 0 / 20%); }
	.toolbar button { all: unset; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 4px; min-width: 26px; height: 26px; padding: 4px; border-radius: 3px; font: 10px/12px "Golos Text", sans-serif; cursor: pointer; }
	.toolbar button:hover:not(:disabled) { background: rgb(127 127 127 / 25%); }
	.toolbar button:disabled { opacity: 0.4; cursor: default; }
	.toolbar button:focus-visible { outline: 2px solid currentcolor; outline-offset: 1px; }
</style>
