<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Player from "./Player.svelte";

	let {
		trackName = $bindable(),
		playing = $bindable(false),
		currentTime = $bindable(0),
		nextTrackName = $bindable(),
		hasPrevious = $bindable(false),
		...props
	}: ComponentProps<typeof Player> = $props();
	const tracks = ["Подземный тоннель", "Пещера паука", "Забытый храм"];
	function initialIndex() { return nextTrackName ? Math.max(0, tracks.indexOf(nextTrackName) - 1) : tracks.length - 1; }
	let index = $state(initialIndex());

	function move(direction: number) {
		index = Math.max(0, Math.min(tracks.length - 1, index + direction));
		trackName = tracks[index];
		currentTime = 0;
		nextTrackName = tracks[index + 1];
		hasPrevious = index > 0;
	}
</script>

<Player {...props} {trackName} bind:playing bind:currentTime {nextTrackName} {hasPrevious} onPrevious={() => move(-1)} onNext={() => move(1)} />
