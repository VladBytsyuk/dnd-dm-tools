<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import "./colors.css";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import Chip from "./Chip.svelte";
	import SmallPlaylist from "./SmallPlaylist.svelte";
	import ReferencePicker from "./ReferencePicker.svelte";
	import SceneGraph from "./SceneGraph.svelte";
	import type { SceneGraphNode, SceneGraphLink, SceneGraphNote, SceneGraphData } from "./sceneGraphModel";

	export type FullAdventurePlaylist = { id: string } & Omit<ComponentProps<typeof SmallPlaylist>, "theme" | "onclick">;
	/** Card snippets are presentational; FullAdventure provides the opening interaction. */
	export type FullAdventureEntity = { url: string; label: string; card: Snippet<[theme: "dark" | "light"]> };
	type Props = {
		russianName: string;
		entityLink: string;
		campaignName?: string;
		source?: FullItemSource;
		notePath?: string | null;
		playlist?: FullAdventurePlaylist | null;
		nodes?: SceneGraphNode[];
		links?: SceneGraphLink[];
		availableNotes?: string[];
		availablePlaylists?: FullAdventurePlaylist[];
		availableSceneNotes?: SceneGraphNote[];
		entities?: FullAdventureEntity[];
		editable?: boolean;
		theme?: "dark" | "light";
		graphHeight?: number;
		onOpenNote?: (path: string) => void | Promise<void>;
		onPlaylistClick?: (id: string) => void;
		onEntityClick?: (url: string) => void | Promise<void>;
		onNoteChange?: (path: string | null) => void;
		onPlaylistChange?: (playlist: FullAdventurePlaylist | null) => void;
		onGraphChange?: (graph: SceneGraphData) => void;
		onSceneSelect?: (id: string | null) => void;
		onCopyText?: (text: string) => void;
	};
	let {
		russianName = $bindable(""), entityLink = $bindable(""), campaignName = $bindable(""), source = $bindable<FullItemSource | undefined>(),
		notePath = $bindable<string | null>(null), playlist = $bindable<FullAdventurePlaylist | null>(null), nodes = $bindable<SceneGraphNode[]>([]), links = $bindable<SceneGraphLink[]>([]),
		availableNotes = [], availablePlaylists = [], availableSceneNotes = [], entities = [], editable = false, theme = "dark", graphHeight = 400,
		onOpenNote, onPlaylistClick, onEntityClick, onNoteChange, onPlaylistChange, onGraphChange, onSceneSelect, onCopyText,
	}: Props = $props();
	let uniqueEntities = $derived.by(() => {
		const seen = new Set<string>();
		return entities.filter((entity) => { if (seen.has(entity.url)) return false; seen.add(entity.url); return true; });
	});
	function changeNote(path: string | null) { notePath = path; onNoteChange?.(path); }
	function changePlaylist(id: string | null) {
		playlist = availablePlaylists.find((item) => item.id === id) ?? null;
		onPlaylistChange?.(playlist);
	}
</script>

<article class="full-adventure" data-theme={theme} aria-label={russianName}>
	<FullItemHeader bind:russianName bind:entityLink englishName="" showEnglishName={false} info={campaignName} infoContent={editable ? campaignInput : undefined} bind:source onCopy={onCopyText} {editable} {theme} />
	{#if editable}
		<div class="reference"><ReferencePicker label="Заметка" placeholder="Выбрать заметку" value={notePath} options={availableNotes.map((path) => ({ value: path, label: path }))} onChange={changeNote} {theme} /></div>
	{/if}
	{#if notePath}
		<div class="note-link"><Chip text={notePath} href={notePath} onLinkClick={({ href }) => onOpenNote?.(href)} background="var(--ds-adventure-sub)" {theme} /></div>
	{/if}
	{#if editable}
		<div class="reference"><ReferencePicker label="Плейлист" placeholder="Выбрать плейлист" value={playlist?.id ?? null} selectedLabel={playlist?.title} options={availablePlaylists.map((item) => ({ value: item.id, label: item.title }))} onChange={changePlaylist} {theme} /></div>
	{/if}
	{#if playlist}
		<SmallPlaylist {...playlist} {theme} onclick={onPlaylistClick ? () => onPlaylistClick?.(playlist!.id) : undefined} />
	{/if}
	<h2>Сцены</h2>
	<SceneGraph bind:nodes bind:links availableNotes={availableSceneNotes} height={graphHeight} onChange={onGraphChange} {onSceneSelect} {editable} {theme} />
	<h2>Контент приключения</h2>
	{#if uniqueEntities.length}
		<ul class="adventure-content">
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
	{:else}<p class="empty">В заметке нет ссылок на сущности плагина</p>{/if}
</article>

{#snippet campaignInput()}
	<input class="info" aria-label="Кампания" placeholder="Кампания" bind:value={campaignName} />
{/snippet}

<style>
	.full-adventure { container: full-adventure / inline-size; }
	.full-adventure { --adventure-primary: var(--ds-adventure); --adventure-secondary: var(--ds-adventure-sub); box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; width: 100%; min-width: 0; padding: 8px; background: linear-gradient(to top right, color-mix(in srgb, var(--adventure-primary) var(--ds-gradient-strength, 20%), transparent), color-mix(in srgb, var(--adventure-secondary) var(--ds-gradient-strength, 20%), transparent)), var(--ds-full-surface); color: #fff; font-family: "Golos Text", sans-serif; }
	.full-adventure[data-theme="light"] { --adventure-primary: var(--ds-adventure-light); --adventure-secondary: var(--ds-adventure-sub-light); color: #1f2937; }
	.full-adventure :global(.full-item-header) { min-height: 36px; gap: 4px; }
	.full-adventure :global(.full-item-header .details) { flex: 0 1 160px; max-width: 45%; gap: 2px; }
	.full-adventure :global(.full-item-header .russian-name) { font-size: 16px; font-weight: 700; line-height: 20px; }
	.full-adventure :global(.full-item-header .info) { font-size: 10px; line-height: 12px; overflow-wrap: anywhere; }
	.full-adventure :global(.full-item-header .entity-link), .full-adventure :global(.full-item-header .source) { font-size: 8px; line-height: 10px; }
	input.info { all: unset; box-sizing: border-box; display: block; width: 100%; min-width: 0; max-width: 100%; color: inherit; font: inherit; text-align: inherit; cursor: text; }
	input.info::placeholder { color: currentcolor; opacity: 0.65; }
	input.info:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	.reference { width: min(100%, 320px); min-width: 0; }
	.note-link { display: flex; min-width: 0; }
	.note-link :global(.chip) { box-sizing: border-box; min-width: 0; max-width: 100%; font-size: 8px; line-height: 10px; }
	.note-link :global(a) { overflow-wrap: anywhere; }
	h2 { margin: 0; font-size: 16px; line-height: 20px; }
	.adventure-content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 6px; padding: 0; margin: 0; list-style: none; }
	.adventure-content li, .entity-card { min-width: 0; }
	.entity-card { border-radius: 8px; }
	.entity-card[role="button"] { cursor: pointer; }
	.entity-card:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	.empty { margin: 0; opacity: 0.7; font-size: 12px; line-height: 15px; }
	@container full-adventure (max-width: 527px) { .adventure-content { grid-template-columns: minmax(0, 1fr); } }
</style>
