<script lang="ts">
	interface Props {
		title: string;
		message: string;
	}

	let { title, message }: Props = $props();
</script>

<div class="empty-state">
	<h2>{title}</h2>
	<div>{message}</div>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		gap: var(--dnd-ui-space-8);
		padding-top: var(--dnd-ui-space-4);
	}

	.empty-state h2 {
		margin: 0 0 0.5em 0;
		font-size: var(--dnd-ui-font-size-xl);
	}
</style>
