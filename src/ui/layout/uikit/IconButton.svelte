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
	title={hint}
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
		border-radius: 6px;
		color: var(--text-color);
	}

	.icon-button:hover {
		background: var(--button-bg);
	}

	.icon-button:focus-visible {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}
</style>
