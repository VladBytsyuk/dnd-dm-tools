<script lang="ts">
	import { BaseEdge, EdgeReconnectAnchor, getStraightPath, type EdgeProps } from "@xyflow/svelte";
	import type { SceneFlowEdge } from "./sceneGraphFlow";
	import { sceneBoundaryPoint } from "./sceneGraphModel";
	let { id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, interactionWidth, style, selected, data }: EdgeProps<SceneFlowEdge> = $props();
	let label = $derived(data?.label ?? "Связь сцен");
	let start = $derived(sceneBoundaryPoint(sourceX, sourceY, sourcePosition));
	let end = $derived(sceneBoundaryPoint(targetX, targetY, targetPosition));
	let geometry = $derived.by(() => {
		const offset = data?.offset ?? 0;
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const length = Math.hypot(dx, dy) || 1;
		const control = offset ? { x: (start.x + end.x) / 2 - dy / length * offset, y: (start.y + end.y) / 2 + dx / length * offset } : start;
		const tangentX = end.x - control.x;
		const tangentY = end.y - control.y;
		const tangentLength = Math.hypot(tangentX, tangentY);
		const unitX = tangentX / (tangentLength || 1);
		const unitY = tangentY / (tangentLength || 1);
		const headLength = Math.min(selected ? 12.8 : 9.6, tangentLength / 2);
		const halfWidth = headLength * 3 / 8;
		const base = { x: end.x - unitX * headLength, y: end.y - unitY * headLength };
		const pathTo = (target: { x: number; y: number }) => offset
			? `M ${start.x},${start.y} Q ${control.x},${control.y} ${target.x},${target.y}`
			: getStraightPath({ sourceX: start.x, sourceY: start.y, targetX: target.x, targetY: target.y })[0];
		return {
			// End the shaft at the head's base so its stroke cannot protrude past the tip.
			shaft: pathTo(base),
			hitArea: pathTo(end),
			head: `M ${end.x},${end.y} L ${base.x - unitY * halfWidth},${base.y + unitX * halfWidth} L ${base.x + unitY * halfWidth},${base.y - unitX * halfWidth} Z`,
		};
	});
</script>

<BaseEdge {id} path={geometry.shaft} interactionWidth={0} style={selected ? `${style}; stroke: var(--scene-ink); stroke-width: 2` : style} />
<path class="scene-arrow-head" d={geometry.head} fill={selected ? "var(--scene-ink)" : data?.color ?? "#a3a3a3"} stroke="none" pointer-events="none" />
<path class="svelte-flow__edge-interaction" d={geometry.hitArea} fill="none" stroke="transparent" stroke-width={interactionWidth ?? 20} />
{#if selected}
	<EdgeReconnectAnchor type="source" position={start} size={18} class="scene-edge-anchor" aria-label={`Перенести начало стрелки: ${label}`} title="Перетащите начало стрелки к другой точке">
		<span class="anchor-dot"></span>
	</EdgeReconnectAnchor>
	<EdgeReconnectAnchor type="target" position={end} size={18} class="scene-edge-anchor" aria-label={`Перенести конец стрелки: ${label}`} title="Перетащите конец стрелки к другой точке">
		<span class="anchor-dot"></span>
	</EdgeReconnectAnchor>
{/if}

<style>
	:global(.scene-edge-anchor) { display: grid; place-items: center; cursor: grab; }
	:global(.scene-edge-anchor:active) { cursor: grabbing; }
	.anchor-dot { box-sizing: border-box; width: 8px; height: 8px; border: 1px solid var(--scene-ink); border-radius: 50%; background: var(--scene-toolbar-bg); }
</style>
