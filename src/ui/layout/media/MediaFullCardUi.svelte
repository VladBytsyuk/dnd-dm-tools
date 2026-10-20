<script lang="ts">
	import { onMount } from "svelte";
	import { PluginNotice as Notice } from "src/ui/PluginNotice";
	import { Track, Playlist as PlaylistCard, FullAdventure, FullScene, type FullSceneEntity } from "@dnd-dm-tools/design-system";
	import type DndStatblockPlugin from "src/main";
	import { mediaCampaignName, type MediaItem } from "src/domain/models/media/MediaLibrary";
	import type { Adventure, MediaScene, MediaState, MediaTrack, Playlist } from "src/domain/models/media/MediaState";
	import { cloneDesignData } from "src/ui/design-system/adapters";
	import NoteEncountersUi from "./NoteEncountersUi.svelte";

	let { plugin, item, media, entities = [], encounters = [], theme, onOpenMedia, onSceneOpen, playbackSourceId = null }: {
		plugin: DndStatblockPlugin; item: MediaItem; media: MediaState; entities?: FullSceneEntity[]; encounters?: string[]; theme: "dark" | "light";
		onOpenMedia?: (url: string) => void | Promise<void>; onSceneOpen?: (id: string) => void;
		playbackSourceId?: string | null;
	} = $props();
	function initialPlayback() { return plugin.getMediaPlayback().getSnapshot(); }
	let playback = $state(initialPlayback());
	let fileVersion = $state(0);
	onMount(() => {
		const unsubscribe = plugin.getMediaPlayback().subscribe(() => { playback = plugin.getMediaPlayback().getSnapshot(); });
		const refresh = () => { fileVersion++; };
		const refs = [plugin.app.vault.on("create", refresh), plugin.app.vault.on("delete", refresh), plugin.app.vault.on("rename", refresh)];
		return () => { unsubscribe(); refs.forEach((ref) => plugin.app.vault.offref(ref)); };
	});
	function fileExists(path: string) { void fileVersion; return !!plugin.app.vault.getFileByPath(path); }
	const displayed = $derived(cloneDesignData(item.record));
	const track = $derived(displayed as MediaTrack);
	const playlist = $derived(displayed as Playlist);
	const adventure = $derived(displayed as Adventure);
	const scene = $derived(displayed as MediaScene);
	const activeTrack = $derived(playback.sourceId === playbackSourceId && playback.trackId === track.id);
	const trackOptions = $derived(media.tracks.map((value) => ({ id: value.id, title: value.name, atmosphere: value.atmosphere, source: value.source?.shortName, hasCombat: !!value.combatAudioId })));
	const playlistOptions = $derived(media.playlists.map((value) => ({ id: value.id, title: value.name, atmosphere: value.atmosphere, source: value.source?.shortName, trackCount: value.items.length })));
	async function action(work: () => void | Promise<void>) { try { await work(); } catch (error) { new Notice(error instanceof Error ? error.message : String(error)); } }
	function openMedia(url: string) { return action(() => onOpenMedia ? onOpenMedia(url) : plugin.openMediaUrl(url)); }
	function openTrack(id: string) { const value = media.tracks.find((value) => value.id === id); if (value) void openMedia(value.url); }
	function openPlaylist(id: string) { const value = media.playlists.find((value) => value.id === id); if (value) void openMedia(value.url); }
	function openScene(id: string) {
		if (onSceneOpen) { onSceneOpen(id); return; }
		const value = media.scenes.find((value) => value.id === id); if (value) void openMedia(value.url);
	}
	function openEntity(url: string) { return action(async () => { const entity = await plugin.panelManager.resolveEntity(url); if (entity) await plugin.panelManager.openItem(entity.panelKey, entity.item); }); }
	function audioView(id: string | null, variant: "normal" | "combat") {
		const file = media.audioFiles.find((file) => file.id === id); if (!file) return undefined;
		const active = activeTrack && playback.playingVariant === variant;
		return { fileName: file.path, currentTime: active ? playback.currentTime : 0, duration: active ? playback.duration : 0 };
	}
</script>

{#if item.mediaRoute.kind === "track"}
	<Track russianName={track.name} entityLink={track.url} atmosphere={track.atmosphere} source={track.source} loop={track.loop} {theme}
		normal={audioView(track.normalAudioId, "normal")} combat={audioView(track.combatAudioId, "combat")} playingVariant={activeTrack && playback.playing ? playback.playingVariant : null}
		onPlayingVariantChange={(variant) => action(() => !variant ? plugin.getMediaPlayback().stop() : playbackSourceId
			? plugin.getMediaPlayback().playTrackSnapshot(track, media.audioFiles, playbackSourceId, variant)
			: plugin.getMediaPlayback().playTrack(track.id, variant))}
		onSeek={(variant, time) => { if (activeTrack && playback.playingVariant === variant) plugin.getMediaPlayback().seek(time); }} />
	{#each [track.normalAudioId, track.combatAudioId] as id}
		{@const file = media.audioFiles.find((file) => file.id === id)}
		{#if file && !fileExists(file.path)}<p class="error">Аудиофайл отсутствует: {file.path}</p>{/if}
	{/each}
{:else if item.mediaRoute.kind === "playlist"}
	<PlaylistCard russianName={playlist.name} entityLink={playlist.url} atmosphere={playlist.atmosphere} source={playlist.source} {theme}
		tracks={playlist.items.flatMap((entry) => { const value = trackOptions.find((track) => track.id === entry.trackId); return value ? [{ ...value, id: entry.id }] : []; })}
		onTrackClick={(id) => { const entry = playlist.items.find((entry) => entry.id === id); if (entry) openTrack(entry.trackId); }} />
{:else if item.mediaRoute.kind === "adventure"}
	<FullAdventure russianName={adventure.name} entityLink={adventure.url} campaignName={adventure.campaignName} source={adventure.source} notePath={adventure.notePath}
		playlist={playlistOptions.find((value) => value.id === adventure.playlistId) ?? null} {theme} {entities} afterContent={encounters.length ? encounterContent : undefined}
		nodes={adventure.scenes.flatMap((reference) => {
			const value = media.scenes.find((scene) => scene.id === reference.id);
			return value ? [{ id: value.id, position: reference.position, note: { path: value.notePath ?? undefined, title: value.name, source: value.source?.shortName, adventureName: adventure.name, info: value.campaignName, musicName: media.tracks.find((track) => track.id === value.trackId)?.name } }] : [];
		})}
		links={adventure.links} onSceneOpen={openScene} onOpenNote={(path) => action(() => plugin.openMediaNote(path))} onPlaylistClick={openPlaylist} onEntityClick={openEntity} />
{:else}
	<FullScene russianName={scene.name} entityLink={scene.url} source={scene.source} notePath={scene.notePath}
		campaignName={mediaCampaignName(item)}
		adventures={item.adventures?.map((value) => ({ id: value.id, title: value.name })) ?? []} track={trackOptions.find((value) => value.id === scene.trackId) ?? null}
		{theme} {entities} afterContent={encounters.length ? encounterContent : undefined} onOpenNote={(path) => action(() => plugin.openMediaNote(path))} onTrackClick={openTrack} onEntityClick={openEntity} />
{/if}

{#snippet encounterContent()}
	<NoteEncountersUi app={plugin.app} {encounters} sourcePath={"notePath" in displayed ? displayed.notePath ?? "" : ""} />
{/snippet}

<style>.error { color: var(--text-error); font-size: 12px; margin: 4px 8px; overflow-wrap: anywhere; }</style>
