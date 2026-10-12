<script lang="ts">
	import { layoutSceneGraph, type SceneGraphLink, type SceneGraphScene } from "./sceneGraphLayout";

	interface Props {
		scenes: SceneGraphScene[];
		links: SceneGraphLink[];
		activeSceneId?: string | null;
		onSelect?: (sceneId: string) => void;
	}

	let { scenes, links, activeSceneId = null, onSelect }: Props = $props();
	let layout = $derived(layoutSceneGraph(scenes, links));
</script>

<div class="scene-graph" role="region" aria-label="Граф сцен">
	{#if layout.nodes.length === 0}
		<p class="empty">Сцены пока не добавлены.</p>
	{:else}
		<div class="canvas" style:width={`${layout.width}px`} style:height={`${layout.height}px`}>
			<svg class="edges" width={layout.width} height={layout.height} aria-hidden="true">
				{#each layout.edges as edge}
					<path d={edge.path} />
					<polygon points={edge.arrowPoints} />
				{/each}
			</svg>
			{#each layout.nodes as node (node.id)}
				{#if onSelect}
					<button
					type="button"
						class:active={node.id === activeSceneId}
						class:missing={node.missing}
						style:left={`${node.x}px`}
						style:top={`${node.y}px`}
						aria-pressed={node.id === activeSceneId}
						aria-label={`${node.label}${node.missing ? ", файл отсутствует" : ""}`}
						title={node.path}
						onclick={() => onSelect?.(node.id)}
					>{node.label}</button>
				{:else}
					<div
						class="node"
						class:active={node.id === activeSceneId}
						class:missing={node.missing}
						style:left={`${node.x}px`}
						style:top={`${node.y}px`}
						title={node.path}
					>{node.label}</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.scene-graph {
		max-width: 100%;
		overflow: auto;
		border: 1px solid var(--background-modifier-border);
		border-radius: 8px;
		background: var(--background-primary);
	}
	.empty {
		margin: 0;
		padding: 16px;
		color: var(--text-muted);
	}
	.canvas {
		position: relative;
	}
	.edges {
		position: absolute;
		inset: 0;
		overflow: visible;
		pointer-events: none;
	}
	.edges path {
		fill: none;
		stroke: var(--text-muted);
		stroke-width: 1.5;
	}
	.edges polygon {
		fill: var(--text-muted);
	}
	button, .node {
		position: absolute;
		box-sizing: border-box;
		width: 148px;
		height: 58px;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--background-modifier-border);
		border-radius: 8px;
		background: var(--background-secondary);
		color: var(--text-normal);
		font: inherit;
		text-align: center;
		word-break: break-word;
		overflow: hidden;
	}
	button { cursor: pointer; }
	button:hover { border-color: var(--interactive-accent); }
	button:focus-visible { outline: 2px solid var(--interactive-accent); outline-offset: 2px; }
	.active { border-color: var(--interactive-accent); background: var(--background-modifier-hover); }
	.missing { border-style: dashed; color: var(--text-error); }
</style>
