<script lang="ts">
	import { onMount } from "svelte";
	import { PluginNotice as Notice } from "src/ui/PluginNotice";
	import { Player } from "@dnd-dm-tools/design-system";
	import { X } from "lucide-svelte";
	import type { MediaPlaybackService } from "src/data/services/MediaPlaybackService";
	import { theme as appTheme, Theme } from "src/ui/theme";
	let { playback: service, onVolumeChange }: { playback: MediaPlaybackService; onVolumeChange: (volume: number) => Promise<void> } = $props();
	function initial() { return service.getSnapshot(); }
	let snapshot = $state(initial());
	const theme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	onMount(() => service.subscribe(() => { snapshot = service.getSnapshot(); }));
	async function action(work: () => void | Promise<void>) {
		try { await work(); } catch (error) { new Notice(error instanceof Error ? error.message : "Не удалось изменить воспроизведение."); snapshot = service.getSnapshot(); }
	}
</script>

<div class="global-player dnd-ui" aria-label="Общий плеер">
	{#if snapshot.trackId || snapshot.itemId}
		<button class="clear" type="button" aria-label="Очистить плеер" title="Очистить плеер" onclick={() => service.clear()}><X size={14} aria-hidden={true} /></button>
		<Player trackName={snapshot.title ?? "Трек"} playlistName={snapshot.playlistName ?? undefined} nextTrackName={snapshot.nextTrackName ?? undefined} hasPrevious={snapshot.hasPrevious}
			playing={snapshot.playing} combatMode={snapshot.combatMode} muted={snapshot.muted} volume={snapshot.volume} currentTime={snapshot.currentTime} duration={snapshot.duration} {theme}
			onPlayingChange={(playing) => action(() => playing ? service.resume() : service.pause())}
			onCombatModeChange={(value) => action(() => service.setManualCombat(value))}
			onMutedChange={(value) => service.setMuted(value)}
			onVolumeChange={(value) => { service.setVolume(value); void action(() => onVolumeChange(value)); }}
			onSeek={(time) => service.seek(time)} onPrevious={() => action(() => service.previous())} onNext={() => action(() => service.next())} onStop={() => service.stop()} />
	{:else}<div class="empty">Плеер · Ничего не выбрано</div>{/if}
</div>

<style>
	.global-player { position: relative; flex: 0 0 auto; min-width: 0; padding: 4px 6px; }
	.global-player :global(.player header) { padding-right: 22px; }
	.empty { padding: 5px 8px; color: var(--text-muted); font-size: 12px; border-radius: 6px; background: var(--background-secondary); }
	.clear { all: unset; position: absolute; z-index: 1; top: 10px; right: 12px; display: grid; place-items: center; width: 20px; height: 20px; cursor: pointer; color: var(--text-muted); }
	.clear:focus-visible { outline: 2px solid var(--interactive-accent); }
</style>
