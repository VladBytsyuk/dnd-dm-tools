<script lang="ts">
	import type { ComponentType } from "svelte";

	let {
		icon,
		hint = "",
		onClick = () => {},
		size = 12
	} = $props<{
		icon: ComponentType;
		hint?: string;
		onClick?: () => void;
		size?: number;
	}>();

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick();
		}
	};
</script>

<div
	class="icon-button"
	role="button"
	tabindex="0"
	aria-label={hint}
	onclick={onClick}
	onkeydown={handleKeydown}
>
	<!-- svelte-ignore svelte_component_deprecated -->
	<svelte:component this={icon} size={size} />
</div>

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: var(--dnd-ui-radius-md);
		color: var(--dnd-ui-text-secondary);
	}

	.icon-button:hover {
		background: var(--button-bg, var(--dnd-ui-surface-hover));
	}

	.icon-button:focus-visible {
		outline: 2px solid var(--dnd-ui-accent-primary);
		outline-offset: var(--dnd-ui-space-2);
	}
</style>
