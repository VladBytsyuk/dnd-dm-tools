<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Track, { type TrackVariant } from "./Track.svelte";

	let {
		normal = $bindable(),
		combat = $bindable(),
		playingVariant = $bindable(),
		...props
	}: ComponentProps<typeof Track> = $props();

	function addFile(variant: TrackVariant) {
		const audio = { fileName: variant === "normal" ? "underdark_tunnel.mp3" : "underdark_tunnel_fight.mp3", currentTime: 0, duration: 221 };
		if (variant === "normal") normal = audio;
		else combat = audio;
	}

	function removeFile(variant: TrackVariant) {
		if (variant === "normal") normal = undefined;
		else combat = undefined;
	}
</script>

<Track {...props} bind:normal bind:combat bind:playingVariant onAddFile={addFile} onRemoveFile={removeFile} />
