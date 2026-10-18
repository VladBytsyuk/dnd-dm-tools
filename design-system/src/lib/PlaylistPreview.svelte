<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Playlist from "./Playlist.svelte";

	let { tracks = $bindable([]), ...props }: ComponentProps<typeof Playlist> = $props();
	let nextId = $state(0);

	function addTrack() {
		nextId += 1;
		tracks = [...tracks, { id: `added-${nextId}`, title: `Новый трек ${nextId}`, atmosphere: "Спокойное", source: "PHB" }];
	}
</script>

<Playlist {...props} bind:tracks onAddTrack={addTrack} />
