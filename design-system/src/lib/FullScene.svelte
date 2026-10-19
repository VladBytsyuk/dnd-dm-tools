<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import "./colors.css";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import Chip from "./Chip.svelte";
	import SmallTrack from "./SmallTrack.svelte";
	import ReferencePicker from "./ReferencePicker.svelte";

	export type FullSceneAdventure = { id: string; title: string };
	export type FullSceneTrack = { id: string } & Omit<ComponentProps<typeof SmallTrack>, "theme" | "onclick">;
	/** Card snippets are presentational; FullScene provides the opening interaction. */
	export type FullSceneEntity = { url: string; label: string; card: Snippet<[theme: "dark" | "light"]> };
	type Props = {
		russianName: string;
		entityLink: string;
		adventure?: FullSceneAdventure | null;
		campaignName?: string;
		notePath?: string | null;
		track?: FullSceneTrack | null;
		availableAdventures?: FullSceneAdventure[];
		availableNotes?: string[];
		availableTracks?: FullSceneTrack[];
		entities?: FullSceneEntity[];
		afterContent?: Snippet;
		source?: FullItemSource;
		editable?: boolean;
		theme?: "dark" | "light";
		onOpenNote?: (path: string) => void | Promise<void>;
		onTrackClick?: (id: string) => void;
		onEntityClick?: (url: string) => void | Promise<void>;
		onAdventureChange?: (adventure: FullSceneAdventure | null) => void;
		onCampaignChange?: (campaignName: string) => void;
		onNoteChange?: (path: string | null) => void;
		onTrackChange?: (track: FullSceneTrack | null) => void;
		onCopyText?: (text: string) => void;
	};
	let {
		russianName = $bindable(""), entityLink = $bindable(""),
		adventure = $bindable<FullSceneAdventure | null>(null), notePath = $bindable<string | null>(null), track = $bindable<FullSceneTrack | null>(null),
		campaignName = $bindable(""),
		availableAdventures = [], availableNotes = [], availableTracks = [], entities = [], afterContent, source = $bindable<FullItemSource | undefined>(),
		editable = false, theme = "dark", onOpenNote, onTrackClick, onEntityClick, onAdventureChange, onCampaignChange, onNoteChange, onTrackChange, onCopyText,
	}: Props = $props();
	let uniqueEntities = $derived.by(() => {
		const seen = new Set<string>();
		return entities.filter((entity) => { if (seen.has(entity.url)) return false; seen.add(entity.url); return true; });
	});
	function changeAdventure(id: string | null) {
		adventure = availableAdventures.find((item) => item.id === id) ?? null;
		onAdventureChange?.(adventure);
	}
	function changeNote(path: string | null) { notePath = path; onNoteChange?.(path); }
	function changeTrack(id: string | null) {
		track = availableTracks.find((item) => item.id === id) ?? null;
		onTrackChange?.(track);
	}
</script>

<article class="full-scene" data-theme={theme} aria-label={russianName}>
	<FullItemHeader bind:russianName bind:entityLink englishName="" showEnglishName={false} bind:source infoContent={editable || adventure || campaignName ? sceneInfo : undefined} onCopy={onCopyText} {editable} {theme} />
	{#if editable}
		<div class="note-picker"><ReferencePicker label="Заметка" placeholder="Выбрать заметку" value={notePath} options={availableNotes.map((path) => ({ value: path, label: path }))} onChange={changeNote} {theme} /></div>
	{/if}
	{#if notePath}
		<div class="note-link"><Chip text={notePath} href={notePath} onLinkClick={({ href }) => onOpenNote?.(href)} background="var(--ds-scene-sub)" {theme} /></div>
	{/if}
	{#if editable}
		<div class="track-picker"><ReferencePicker label="Трек" placeholder="Выбрать трек" value={track?.id ?? null} selectedLabel={track?.title} options={availableTracks.map((item) => ({ value: item.id, label: item.title }))} onChange={changeTrack} {theme} /></div>
	{/if}
	{#if track}
		<div class="scene-track"><SmallTrack {...track} {theme} onclick={onTrackClick ? () => onTrackClick?.(track!.id) : undefined} /></div>
	{/if}
	<h2>Контент сцены</h2>
	{#if uniqueEntities.length}
		<ul class="scene-content">
			{#each uniqueEntities as entity (entity.url)}
				<li>
					{#if onEntityClick}
						<div class="entity-card" role="button" tabindex="0" aria-label={`Открыть: ${entity.label}`} onclick={() => onEntityClick?.(entity.url)} onkeydown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void onEntityClick?.(entity.url); } }}>
							{@render entity.card(theme)}
						</div>
					{:else}<div class="entity-card">{@render entity.card(theme)}</div>{/if}
				</li>
			{/each}
		</ul>
	{:else if !afterContent}<p class="empty">В заметке нет ссылок на сущности плагина</p>{/if}
	{@render afterContent?.()}
</article>

{#snippet sceneInfo()}
	{#if editable}
		<ReferencePicker label="Приключение" placeholder="Выбрать приключение" value={adventure?.id ?? null} selectedLabel={adventure?.title} options={availableAdventures.map((item) => ({ value: item.id, label: item.title }))} onChange={changeAdventure} align="end" {theme} />
	{:else if adventure}<span class="info">{adventure.title}</span>{/if}
	{#if editable && !adventure}
		<input class="info" aria-label="Кампания" placeholder="Кампания" bind:value={campaignName} oninput={(event) => onCampaignChange?.(event.currentTarget.value)} />
	{:else if campaignName}<span class="info" aria-label="Кампания">{campaignName}</span>{/if}
{/snippet}

<style>
	.full-scene { --ds-media-unit: 1.5px; container: full-scene / inline-size; }
	.full-scene { --scene-primary: var(--ds-scene); --scene-secondary: var(--ds-scene-sub); box-sizing: border-box; display: flex; flex-direction: column; gap: calc(6 * var(--ds-media-unit, 1px)); width: 100%; min-width: 0; padding: calc(8 * var(--ds-media-unit, 1px)); background: linear-gradient(to top right, color-mix(in srgb, var(--scene-primary) var(--ds-gradient-strength, 20%), transparent), color-mix(in srgb, var(--scene-secondary) var(--ds-gradient-strength, 20%), transparent)), var(--ds-full-surface); color: #fff; font-family: "Golos Text", sans-serif; }
	.full-scene[data-theme="light"] { --scene-primary: var(--ds-scene-light); --scene-secondary: var(--ds-scene-sub-light); color: #1f2937; }
	.full-scene :global(.full-item-header) { min-height: calc(36 * var(--ds-media-unit, 1px)); gap: calc(4 * var(--ds-media-unit, 1px)); }
	.full-scene :global(.full-item-header .details) { flex: 0 1 calc(160 * var(--ds-media-unit, 1px)); max-width: 45%; gap: calc(2 * var(--ds-media-unit, 1px)); }
	.full-scene :global(.full-item-header .russian-name) { font-size: calc(16 * var(--ds-media-unit, 1px)); font-weight: 700; line-height: calc(20 * var(--ds-media-unit, 1px)); }
	.full-scene :global(.full-item-header .info) { font-size: calc(10 * var(--ds-media-unit, 1px)); line-height: calc(12 * var(--ds-media-unit, 1px)); overflow-wrap: anywhere; }
	.full-scene :global(.full-item-header .entity-link), .full-scene :global(.full-item-header .source) { font-size: calc(8 * var(--ds-media-unit, 1px)); line-height: calc(10 * var(--ds-media-unit, 1px)); }
	.note-picker, .track-picker { width: min(100%, calc(320 * var(--ds-media-unit, 1px))); min-width: 0; }
	.note-link { display: flex; min-width: 0; }
	.note-link :global(.chip) { box-sizing: border-box; min-width: 0; max-width: 100%; font-size: calc(8 * var(--ds-media-unit, 1px)); line-height: calc(10 * var(--ds-media-unit, 1px)); }
	.note-link :global(a) { overflow-wrap: anywhere; }
	.scene-track { width: calc((100% - calc(6 * var(--ds-media-unit, 1px))) / 2); min-width: 0; }
	h2 { margin: 0; font-size: calc(16 * var(--ds-media-unit, 1px)); line-height: calc(20 * var(--ds-media-unit, 1px)); }
	.scene-content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: calc(6 * var(--ds-media-unit, 1px)); padding: 0; margin: 0; list-style: none; }
	.scene-content li, .entity-card { min-width: 0; }
	.entity-card { --ds-media-unit: 1px; border-radius: calc(8 * var(--ds-media-unit, 1px)); }
	.entity-card[role="button"] { cursor: pointer; }
	.entity-card:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
	.empty { margin: 0; opacity: 0.7; font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(15 * var(--ds-media-unit, 1px)); }
	@container full-scene (max-width: 790.5px) { .scene-content { grid-template-columns: minmax(0, 1fr); } .scene-track { width: 100%; } }
</style>
