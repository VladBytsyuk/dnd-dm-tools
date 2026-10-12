<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import Play from "lucide-svelte/icons/play";
	import Pause from "lucide-svelte/icons/pause";
	import Square from "lucide-svelte/icons/square";
	import SkipBack from "lucide-svelte/icons/skip-back";
	import SkipForward from "lucide-svelte/icons/skip-forward";
	import Sword from "lucide-svelte/icons/sword";
	import Volume2 from "lucide-svelte/icons/volume-2";
	import VolumeX from "lucide-svelte/icons/volume-x";
	import Chip from "./Chip.svelte";
	import ProgressBar from "./ProgressBar.svelte";

	type Props = {
		trackName: string;
		playlistName?: string;
		nextTrackName?: string;
		hasPrevious?: boolean;
		playing?: boolean;
		combatMode?: boolean;
		muted?: boolean;
		/** Remembered volume from 0 to 1, preserved while muted. */
		volume?: number;
		/** Playback position and duration in seconds. */
		currentTime?: number;
		duration?: number;
		disabled?: boolean;
		theme?: "dark" | "light";
		onPlayingChange?: (playing: boolean) => void;
		onCombatModeChange?: (combatMode: boolean) => void;
		onMutedChange?: (muted: boolean) => void;
		onVolumeChange?: (volume: number) => void;
		onSeek?: (time: number) => void;
		onPrevious?: () => void;
		onNext?: () => void;
		onStop?: () => void;
	};

	let {
		trackName,
		playlistName,
		nextTrackName,
		hasPrevious = true,
		playing = $bindable(false),
		combatMode = $bindable(false),
		muted = $bindable(false),
		volume = $bindable(0.5),
		currentTime = $bindable(0),
		duration = 0,
		disabled = false,
		theme = "dark",
		onPlayingChange,
		onCombatModeChange,
		onMutedChange,
		onVolumeChange,
		onSeek,
		onPrevious,
		onNext,
		onStop,
	}: Props = $props();

	let total = $derived(Number.isFinite(duration) ? Math.max(0, duration) : 0);
	let elapsed = $derived(Number.isFinite(currentTime) ? Math.max(0, Math.min(total, currentTime)) : 0);
	let progress = $derived(total > 0 ? elapsed / total * 100 : 0);
	let volumeProgress = $derived(Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) * 100 : 0);

	function formatTime(seconds: number) {
		return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
	}

	function togglePlayback() { playing = !playing; onPlayingChange?.(playing); }
	function toggleCombat() { combatMode = !combatMode; onCombatModeChange?.(combatMode); }
	function toggleMute() { muted = !muted; onMutedChange?.(muted); }
	function changeVolume(value: number) { volume = value / 100; onVolumeChange?.(volume); }
	function seek(value: number) { currentTime = total * value / 100; onSeek?.(currentTime); }
	function stop() { playing = false; currentTime = 0; onStop?.(); }
</script>

<section class="player" data-theme={theme} aria-label="Плеер">
	<header>
		<span class="track-name" title={trackName}>{trackName}</span>
		{#if playlistName}<span class="playlist-name" title={playlistName}>{playlistName}</span>{/if}
	</header>
	<div class="controls">
		<div class="playback">
			<button class="icon-button transport" type="button" aria-label="Предыдущий трек" title="Предыдущий трек" disabled={disabled || !hasPrevious || !onPrevious} onclick={onPrevious}><SkipBack size={20} strokeWidth={2} aria-hidden={true} /></button>
			<button class="icon-button transport" type="button" aria-label={playing ? "Пауза" : "Воспроизвести"} title={playing ? "Пауза" : "Воспроизвести"} {disabled} onclick={togglePlayback}>
				{#if playing}<Pause size={20} strokeWidth={2} aria-hidden={true} />{:else}<Play size={20} strokeWidth={2} aria-hidden={true} />{/if}
			</button>
			<button class="icon-button transport" type="button" aria-label="Остановить" title="Остановить" {disabled} onclick={stop}><Square size={20} strokeWidth={2} aria-hidden={true} /></button>
			<button class="icon-button transport" type="button" aria-label="Следующий трек" title="Следующий трек" disabled={disabled || !nextTrackName || !onNext} onclick={onNext}><SkipForward size={20} strokeWidth={2} aria-hidden={true} /></button>
		</div>
		{#if nextTrackName}
			<div class="next-track" title={`Следующий трек: ${nextTrackName}`}><Chip text={nextTrackName} {theme} /></div>
		{/if}
		<div class="spacer"></div>
		<div class="sound-controls">
			<button class="icon-button combat" class:active={combatMode} type="button" aria-label="Боевой режим" aria-pressed={combatMode} title={combatMode ? "Выключить боевой режим" : "Включить боевой режим"} {disabled} onclick={toggleCombat}><Sword size={24} strokeWidth={2} aria-hidden={true} /></button>
			<div class="volume">
				<button class="icon-button" type="button" aria-label="Звук" aria-pressed={!muted} title={muted ? "Включить звук" : "Выключить звук"} {disabled} onclick={toggleMute}>
					{#if muted}<VolumeX size={24} strokeWidth={2} aria-hidden={true} />{:else}<Volume2 size={24} strokeWidth={2} aria-hidden={true} />{/if}
				</button>
				<div class="volume-bar"><ProgressBar value={volumeProgress} onValueChange={changeVolume} ariaLabel="Громкость" {disabled} {theme} /></div>
			</div>
		</div>
	</div>
	<div class="timeline">
		<span class="time">{formatTime(elapsed)}</span>
		<div class="progress"><ProgressBar value={progress} onValueChange={seek} disabled={disabled || total === 0} ariaLabel="Позиция воспроизведения" {theme} /></div>
		<span class="time">{formatTime(total)}</span>
	</div>
</section>

<style>
	.player {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		min-width: 0;
		padding: 6px;
		border-radius: 12px;
		background: rgb(48 48 48 / 40%);
		box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
		font-size: 14px;
		font-weight: 400;
		line-height: 17px;
	}

	.player[data-theme="light"] { background: rgb(48 48 48 / 8%); color: #1f2937; }
	header { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; min-height: 17px; }
	.track-name { flex: 1; min-width: 0; }
	.playlist-name { flex: 0 1 auto; max-width: 50%; opacity: 0.7; text-align: right; }
	.track-name, .playlist-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; }
	.playback, .sound-controls, .volume { display: flex; flex: 0 0 auto; align-items: center; gap: 6px; }
	.spacer { flex: 1; }
	.next-track { flex: 0 1 auto; min-width: 0; max-width: 100%; }
	.next-track :global(.chip) { box-sizing: border-box; font-size: 10px; line-height: 10px; opacity: 0.7; }
	.next-track :global(.text) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.volume-bar { display: flex; align-items: center; width: 64px; min-width: 0; }
	.player button.icon-button { all: unset; box-sizing: border-box; display: grid; flex: 0 0 24px; width: 24px; height: 24px; place-items: center; border-radius: 2px; color: inherit; cursor: pointer; }
	.player button.transport { flex-basis: 20px; width: 20px; height: 20px; }
	.player button.icon-button:hover:not(:disabled) { background: rgb(255 255 255 / 10%); }
	.player[data-theme="light"] button.icon-button:hover:not(:disabled) { background: rgb(15 23 42 / 8%); }
	.player button.icon-button:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	.player button.icon-button:disabled { opacity: 0.4; cursor: default; }
	.player button.combat.active { color: #b91c1c; }
	.timeline { display: flex; align-items: center; gap: 2px; min-width: 0; min-height: 17px; }
	.progress { display: flex; flex: 1; align-items: center; height: 4px; min-width: 0; }
	.time { flex: 0 0 auto; white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>
