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
		margin-left: 8px;
		padding: 0 6px;
		font-size: 10px;
		line-height: 1.5;
		color: var(--text-color);
		border: 1px solid var(--text-color);
		border-radius: 999px;
	}

	.source-badge-official {
		background: #00000040;
	}

	.source-badge-homebrew {
		background: #00800040;
	}
</style>
