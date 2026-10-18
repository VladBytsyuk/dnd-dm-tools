<script lang="ts">
	import { Handle, Position, useConnection, type NodeProps } from "@xyflow/svelte";
	import SmallScene from "./SmallScene.svelte";
	import type { SceneFlowNode } from "./sceneGraphFlow";
	import { SCENE_WIDTH, SCENE_HEIGHT, SCENE_HANDLE_SIZE } from "./sceneGraphModel";
	let { data }: NodeProps<SceneFlowNode> = $props();
	const connection = useConnection();
	const sides = [
		{ position: Position.Top, label: "Сверху" },
		{ position: Position.Right, label: "Справа" },
		{ position: Position.Bottom, label: "Снизу" },
		{ position: Position.Left, label: "Слева" },
	];
</script>

<div class="scene-block" class:editable={data.editable} class:connecting={connection.current.inProgress} data-theme={data.theme} style:width={`${SCENE_WIDTH}px`} style:height={`${SCENE_HEIGHT}px`} style:--scene-handle-size={`${SCENE_HANDLE_SIZE}px`}>
	<SmallScene {...data.note} theme={data.theme} />
	{#each sides as side (side.position)}
		<Handle type="source" id={side.position} position={side.position} isConnectable={data.editable} aria-hidden={!data.editable} aria-label={`${side.label}: связь сцены ${data.note.title}`} title="Перетащите к точке другой сцены" />
	{/each}
</div>

<style>
	.scene-block { position: relative; border-radius: 12px; }
	.scene-block :global(.svelte-flow__handle) { box-sizing: border-box; width: var(--scene-handle-size); height: var(--scene-handle-size); min-width: 0; min-height: 0; border: 1.5px solid #d4d4d4; background: #525252; opacity: 0; cursor: crosshair; transition: opacity 120ms, background 120ms, box-shadow 120ms; }
	.scene-block.editable:hover :global(.svelte-flow__handle), .scene-block.editable.connecting :global(.svelte-flow__handle), :global(.svelte-flow__node-scene:focus-visible) .scene-block.editable :global(.svelte-flow__handle) { opacity: 1; }
	.scene-block :global(.svelte-flow__handle::after) { content: ""; position: absolute; inset: -9px; border-radius: 50%; }
	.scene-block[data-theme="light"] :global(.svelte-flow__handle) { border-color: #525252; background: #fff; }
	.scene-block :global(.svelte-flow__handle:hover), .scene-block :global(.svelte-flow__handle.connectingfrom) { box-shadow: 0 0 0 4.5px rgb(125 211 252 / 50%); }
	.scene-block :global(.svelte-flow__handle.valid) { background: #22c55e; box-shadow: 0 0 0 6px rgb(34 197 94 / 35%); }
</style>
