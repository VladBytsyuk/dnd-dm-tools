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
	.empty-state h2 {
		margin: 0 0 0.5em 0;
		font-size: 1.2em;
	}
</style>
