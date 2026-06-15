<script lang="ts">
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import type { Snippet } from "svelte";
	import { getPanelTypeColor } from "./PanelTypeColor";

	let {
		panelKey,
		children,
	}: {
		panelKey: PanelKey;
		children?: Snippet;
	} = $props();

	const typeColor = $derived(getPanelTypeColor(panelKey));
</script>

<div
	class="panel-type-tint"
	style={`--panel-type-color: ${typeColor}`}
>
	{@render children?.()}
</div>

<style>
	.panel-type-tint {
		--panel-type-tint-strength: 8%;
		--panel-type-hover-strength: 14%;
		--panel-type-tint: color-mix(
			in srgb,
			var(--panel-type-color) var(--panel-type-tint-strength),
			transparent
		);
		--panel-type-hover-tint: color-mix(
			in srgb,
			var(--panel-type-color) var(--panel-type-hover-strength),
			transparent
		);
		--dnd-ui-pattern-list-item-bg: var(--panel-type-tint);
		--dnd-ui-pattern-list-item-hover-bg: var(--panel-type-hover-tint);
		--dnd-ui-pattern-list-item-border: color-mix(
			in srgb,
			var(--panel-type-color) 55%,
			var(--dnd-ui-border-subtle)
		);
		--dnd-ui-surface-panel-strong: var(--panel-type-tint);
		--dnd-ui-surface-panel-hover: var(--panel-type-hover-tint);

		height: 100%;
		overflow: hidden;
		border-left: 3px solid var(--panel-type-color);
		border-radius: var(--dnd-ui-radius-lg);
		background: var(--panel-type-tint);
	}

	:global(.theme-dark) .panel-type-tint {
		--panel-type-tint-strength: 12%;
		--panel-type-hover-strength: 20%;
	}

	.panel-type-tint :global(> *) {
		height: 100%;
		background: var(--panel-type-tint) !important;
	}

	.panel-type-tint :global(> *:hover),
	.panel-type-tint :global(> *:focus-visible) {
		background: var(--panel-type-hover-tint) !important;
	}
</style>
