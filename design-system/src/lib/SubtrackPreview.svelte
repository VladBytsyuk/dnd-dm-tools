<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Subtrack from "./Subtrack.svelte";

	let {
		fileName = $bindable<string | undefined>(),
		playing = $bindable(false),
		currentTime = $bindable(0),
		...props
	}: ComponentProps<typeof Subtrack> = $props();

	function addFile() { fileName = "underdark_tunnel.mp3"; currentTime = 0; playing = false; }
	function removeFile() { fileName = undefined; currentTime = 0; playing = false; }
</script>

<div class="preview">
	<Subtrack {...props} {fileName} bind:playing bind:currentTime onAdd={addFile} onRemove={removeFile} />
</div>

<style>
	.preview { width: 455px; max-width: 100%; }
</style>
