<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title: string;
		color: string;
		isOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		headerActions?: Snippet;
		children: Snippet;
	}

	let { title, color, isOpen = $bindable(true), onOpenChange, headerActions, children }: Props = $props();

	function toggleGroup(event: MouseEvent) {
		event.preventDefault();
		isOpen = !isOpen;
		onOpenChange?.(isOpen);
	}
</script>

<div class="item-group" style={`--item-group-color: ${color}; --item-group-hover-color: color-mix(in srgb, ${color} 85%, white)`}>
	<details open={isOpen}>
		<summary class="item-group__title" onclick={toggleGroup}>{title}{@render headerActions?.()}</summary>
		{@render children()}
	</details>
</div>

<style>
	.item-group {
		margin: 0;
		min-width: 0;
	}

	.item-group details {
		user-select: none;
		border-radius: var(--dnd-ui-radius-lg);
		transition: all var(--dnd-ui-duration-base) var(--dnd-ui-ease-standard);
		overflow: hidden;
		marker: none;
		border: 1px solid var(--dnd-ui-pattern-list-item-border);
		background: var(--dnd-ui-pattern-group-bg);
	}

	.item-group details:hover,
	.item-group details[open] {
		border-color: var(--item-group-color);
	}

	.item-group__title {
		display: block;
		box-sizing: border-box;
		appearance: none;
		font-size: 1.2rem;
		font-weight: var(--dnd-ui-font-weight-bold);
		width: 100%;
		padding: var(--dnd-ui-space-6) var(--dnd-ui-space-8) var(--dnd-ui-space-6) var(--dnd-ui-space-24);
		margin: 0;
		background: var(--item-group-color) !important;
		border-bottom: 2px solid var(--item-group-color) !important;
		cursor: pointer;
		transition: all var(--dnd-ui-duration-base) var(--dnd-ui-ease-standard);
		position: relative;
		color: var(--dnd-ui-text-inverse);
		list-style: none;
		overflow-wrap: anywhere;
	}

	.item-group__title::-webkit-details-marker {
		display: none;
	}

	.item-group__title::before {
		content: "▶";
		position: absolute;
		left: var(--dnd-ui-space-8);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--dnd-ui-font-size-sm);
		transition: transform var(--dnd-ui-duration-base) var(--dnd-ui-ease-standard);
	}

	.item-group__title:hover {
		background: var(--item-group-hover-color) !important;
		color: var(--dnd-ui-text-inverse);
	}

	.item-group details[open] .item-group__title {
		background: var(--item-group-color) !important;
		border-bottom-color: var(--item-group-color) !important;
		color: var(--dnd-ui-text-inverse);
	}

	.item-group details[open] .item-group__title:hover {
		background: var(--item-group-hover-color) !important;
	}

	.item-group details[open] .item-group__title::before {
		transform: translateY(-50%) rotate(90deg);
	}

	.item-group__title:focus-visible { outline: 2px solid currentcolor; outline-offset: -3px; }
</style>
