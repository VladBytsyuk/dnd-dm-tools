<script lang="ts">
	import { SmallTrack, SmallPlaylist, SmallAdventure, SmallScene } from "@dnd-dm-tools/design-system";
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import type { MediaItem } from "src/domain/models/media/MediaLibrary";
	import type { Adventure, AdventureScene, MediaTrack, Playlist } from "src/domain/models/media/MediaState";
	import RedesignedSmallItem from "src/ui/design-system/RedesignedSmallItem.svelte";
	let { result, theme }: { result: PanelSearchResult; theme: "dark" | "light" } = $props();
	const media = $derived(result.item as MediaItem);
</script>

{#if media.mediaRoute?.kind === "track"}
	{@const record = media.record as MediaTrack}<SmallTrack title={record.name} atmosphere={record.atmosphere} source={record.source?.shortName} hasCombat={!!record.combatAudioId} {theme} />
{:else if media.mediaRoute?.kind === "playlist"}
	{@const record = media.record as Playlist}<SmallPlaylist title={record.name} atmosphere={record.atmosphere} source={record.source?.shortName} trackCount={record.items.length} {theme} />
{:else if media.mediaRoute?.kind === "adventure"}
	{@const record = media.record as Adventure}<SmallAdventure title={record.name} sceneCount={record.scenes.length} source={record.source?.shortName} {theme} />
{:else if media.mediaRoute?.kind === "scene"}
	{@const record = media.record as AdventureScene}<SmallScene title={record.name} adventureName={media.parent?.name} source={record.source?.shortName} {theme} />
{:else if result.panelKey === "dm-screen" || result.panelKey === "character-sheets"}
	<div class="fallback"><strong>{result.title}</strong><small>{result.panelKey === "dm-screen" ? "Правило" : "Лист персонажа"}</small></div>
{:else}<RedesignedSmallItem panelKey={result.panelKey} smallItem={result.item} />{/if}

<style>.fallback { padding: 8px; border-radius: 8px; background: var(--background-secondary); display: flex; flex-direction: column; gap: 4px; } small { color: var(--text-muted); }</style>
