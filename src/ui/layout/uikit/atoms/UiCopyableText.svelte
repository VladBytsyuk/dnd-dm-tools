<script lang="ts">
	import { onkeydown } from "src/domain/utils/utils";

	interface Props {
		text: string;
		onClick: () => void;
		className?: string;
		ariaLabel?: string;
		showClipboard?: boolean;
	}

	let {
		text,
		onClick,
		className = "",
		ariaLabel = "Скопировать в буфер обмена",
		showClipboard = true,
	}: Props = $props();
</script>

<div
	class={`copyable-text ${className}`.trim()}
	role="button"
	tabindex="0"
	aria-label={ariaLabel}
	onclick={onClick}
	onkeydown={onkeydown(() => onClick())}
>
	<span>{text}</span>
	{#if showClipboard}<span class="copyable-text__icon">📋</span>{/if}
</div>

<style>
	.copyable-text {
		display: inline-flex;
		align-items: center;
		gap: var(--dnd-ui-space-4);
		cursor: pointer;
	}

	.copyable-text__icon {
		font-size: 0.9em;
	}
</style>
