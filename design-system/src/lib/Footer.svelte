<script lang="ts">
	import "@fontsource/golos-text/400.css";

	type Props = {
		text?: string;
	};

	let { text = "" }: Props = $props();
</script>

<footer>{text}</footer>

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
</style>
