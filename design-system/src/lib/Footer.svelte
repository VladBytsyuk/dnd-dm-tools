<script lang="ts">
	import "@fontsource/golos-text/400.css";

	type Props = {
		text?: string;
		editable?: boolean;
	};

	let { text = $bindable(""), editable = false }: Props = $props();
</script>

<footer>
	{#if editable}
		<input bind:value={text} aria-label="Текст подвала" />
	{:else}
		{text}
	{/if}
</footer>

<style>
	footer {
		width: 100%;
		min-width: 0;
		color: rgb(255 255 255 / 70%);
		font-family: "Golos Text", sans-serif;
		font-size: 8px;
		font-weight: 400;
		line-height: 10px;
		overflow-wrap: anywhere;
	}

	footer input {
		width: 100%;
		min-width: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		appearance: none;
		background: transparent;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		line-height: inherit;
		text-align: inherit;
	}

	footer input:focus-visible {
		outline: 1px solid currentcolor;
		outline-offset: 2px;
	}
</style>
