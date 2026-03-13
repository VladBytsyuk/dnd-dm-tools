<script lang="ts">
	import type { Source } from "src/domain/models/common/Source";

	interface Props {
		source: Source;
		className?: string;
	}

	let { source, className = "" }: Props = $props();
</script>

<div class={`source-badge ${source.homebrew ? "source-badge-homebrew" : "source-badge-official"} ${className}`.trim()}>
	{source.shortName}{source.group.shortName !== "Basic" ? "*" : ""}
</div>

<style>
	.source-badge {
		display: inline-flex;
		align-items: center;
		margin-left: var(--dnd-ui-space-8);
		padding: 0 var(--dnd-ui-space-6);
		font-size: var(--dnd-ui-font-size-xs);
		line-height: 1.5;
		color: var(--dnd-ui-text-secondary);
		border: 1px solid var(--dnd-ui-text-secondary);
		border-radius: var(--dnd-ui-radius-pill);
	}

	.source-badge-official {
		background: var(--dnd-ui-pattern-badge-bg);
	}

	.source-badge-homebrew {
		background: var(--dnd-ui-pattern-badge-homebrew-bg);
	}
</style>
