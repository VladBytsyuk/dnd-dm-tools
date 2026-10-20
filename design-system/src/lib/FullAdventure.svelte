<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import "./colors.css";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import Chip from "./Chip.svelte";
	import SmallPlaylist from "./SmallPlaylist.svelte";
	import ReferencePicker, { type ReferenceOption } from "./ReferencePicker.svelte";
	import Autocomplete from "./Autocomplete.svelte";
	import SceneGraph from "./SceneGraph.svelte";
	import Plus from "lucide-svelte/icons/plus";
	import type { SceneGraphNode, SceneGraphLink, SceneGraphNote, SceneGraphData } from "./sceneGraphModel";

	export type FullAdventurePlaylist = { id: string } & Omit<ComponentProps<typeof SmallPlaylist>, "theme" | "onclick">;
	/** Card snippets are presentational; FullAdventure provides the opening interaction. */
	export type FullAdventureEntity = { url: string; label: string; card: Snippet<[theme: "dark" | "light"]> };
	type Props = {
		russianName: string;
		entityLink: string;
		campaignName?: string;
		availableCampaigns?: string[];
		source?: FullItemSource;
		notePath?: string | null;
		playlist?: FullAdventurePlaylist | null;
		nodes?: SceneGraphNode[];
		links?: SceneGraphLink[];
		availableNotes?: string[];
		availablePlaylists?: FullAdventurePlaylist[];
		availableSceneNotes?: SceneGraphNote[];
		availableScenes?: ReferenceOption[];
		entities?: FullAdventureEntity[];
		afterContent?: Snippet;
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
		onSceneOpen?: (id: string) => void;
		onCreateScene?: () => void;
		createSceneDisabled?: boolean;
		onAddScene?: (id: string) => void;
		addSceneDisabled?: boolean;
		onCopyText?: (text: string) => void;
	};
	let {
		russianName = $bindable(""), entityLink = $bindable(""), campaignName = $bindable(""), source = $bindable<FullItemSource | undefined>(),
		notePath = $bindable<string | null>(null), playlist = $bindable<FullAdventurePlaylist | null>(null), nodes = $bindable<SceneGraphNode[]>([]), links = $bindable<SceneGraphLink[]>([]),
		availableNotes = [], availablePlaylists = [], availableSceneNotes = [], availableScenes = [], availableCampaigns = [], entities = [], afterContent, editable = false, theme = "dark", graphHeight = 600,
		onOpenNote, onPlaylistClick, onEntityClick, onNoteChange, onPlaylistChange, onGraphChange, onSceneSelect, onSceneOpen, onCreateScene, createSceneDisabled = false, onAddScene, addSceneDisabled = false, onCopyText,
	}: Props = $props();
	let sceneQuery = $state("");
	const sceneOptions = $derived(availableScenes.filter((option) => !nodes.some((node) => node.id === option.value)));
	let uniqueEntities = $derived.by(() => {
		const seen = new Set<string>();
		return entities.filter((entity) => { if (seen.has(entity.url)) return false; seen.add(entity.url); return true; });
	});
	function changeNote(path: string | null) { notePath = path; onNoteChange?.(path); }
	function changePlaylist(id: string | null) {
		playlist = availablePlaylists.find((item) => item.id === id) ?? null;
		onPlaylistChange?.(playlist);
	}
	function changeGraph(graph: SceneGraphData) {
		nodes = graph.nodes;
		links = graph.links;
		onGraphChange?.(graph);
	}
</script>

<article class="full-adventure" data-theme={theme} aria-label={russianName}>
	<FullItemHeader bind:russianName bind:entityLink englishName="" showEnglishName={false} info={campaignName} infoContent={editable ? campaignInput : undefined} bind:source onCopy={onCopyText} {editable} {theme} />
	{#if editable}
		<div class="reference"><ReferencePicker label="Заметка" placeholder="Выбрать заметку" value={notePath} options={availableNotes.map((path) => ({ value: path, label: path }))} onChange={changeNote} {theme} /></div>
	{/if}
	{#if !editable && notePath}
		<div class="note-link"><Chip text={notePath} href={notePath} onLinkClick={({ href }) => onOpenNote?.(href)} background="var(--ds-adventure-sub)" {theme} /></div>
	{/if}
	{#if editable}
		<div class="reference"><ReferencePicker label="Плейлист" placeholder="Выбрать плейлист" value={playlist?.id ?? null} selectedLabel={playlist?.title} options={availablePlaylists.map((item) => ({ value: item.id, label: item.title }))} onChange={changePlaylist} {theme} /></div>
	{/if}
	{#if !editable && playlist}
		<SmallPlaylist {...playlist} {theme} onclick={onPlaylistClick ? () => onPlaylistClick?.(playlist!.id) : undefined} />
	{/if}
	<h2>Сцены</h2>
	<SceneGraph {nodes} {links} availableNotes={availableSceneNotes} height={graphHeight} onChange={changeGraph} {onSceneSelect} {onSceneOpen} showAddScene={!onCreateScene && !onAddScene} {editable} {theme} />
	{#if editable && (onCreateScene || onAddScene)}
		<div class="scene-actions">
			<div class="scene-search"><Autocomplete label="Добавить существующую сцену" placeholder="Добавить сцену" bind:value={sceneQuery} options={sceneOptions} disabled={addSceneDisabled || !onAddScene} {theme} onSelect={(option) => { onAddScene?.(option.value); sceneQuery = ""; }} /></div>
			{#if onCreateScene}<button class="create-scene" type="button" aria-label="Создать сцену" title="Создать сцену" disabled={createSceneDisabled} onclick={onCreateScene}><Plus size={14} style="width: calc(14 * var(--ds-media-unit, 1px)); height: calc(14 * var(--ds-media-unit, 1px))" aria-hidden={true} /></button>{/if}
		</div>
	{/if}
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
	{:else if !afterContent}<p class="empty">В заметке нет ссылок на сущности плагина</p>{/if}
	{@render afterContent?.()}
</article>

{#snippet campaignInput()}
	<div class="info"><Autocomplete label="Кампания" placeholder="Кампания" bind:value={campaignName} options={availableCampaigns.map((name) => ({ value: name, label: name }))} {theme} /></div>
{/snippet}

<style>
	.full-adventure { --ds-media-unit: 1.5px; container: full-adventure / inline-size; }
	.full-adventure { border-radius: var(--dnd-ui-radius-lg, 8px); }
	.full-adventure { --adventure-primary: var(--ds-adventure); --adventure-secondary: var(--ds-adventure-sub); box-sizing: border-box; display: flex; flex-direction: column; gap: calc(6 * var(--ds-media-unit, 1px)); width: 100%; min-width: 0; padding: calc(8 * var(--ds-media-unit, 1px)); background: linear-gradient(to top right, color-mix(in srgb, var(--adventure-primary) var(--ds-gradient-strength, 20%), transparent), color-mix(in srgb, var(--adventure-secondary) var(--ds-gradient-strength, 20%), transparent)), var(--ds-full-surface); color: #fff; font-family: "Golos Text", sans-serif; }
	.full-adventure[data-theme="light"] { --adventure-primary: var(--ds-adventure-light); --adventure-secondary: var(--ds-adventure-sub-light); color: #1f2937; }
	.full-adventure :global(.full-item-header) { min-height: calc(36 * var(--ds-media-unit, 1px)); gap: calc(4 * var(--ds-media-unit, 1px)); }
	.full-adventure :global(.full-item-header .details) { flex: 0 1 calc(160 * var(--ds-media-unit, 1px)); max-width: 45%; gap: calc(2 * var(--ds-media-unit, 1px)); }
	.full-adventure :global(.full-item-header .russian-name) { font-size: calc(16 * var(--ds-media-unit, 1px)); font-weight: 700; line-height: calc(20 * var(--ds-media-unit, 1px)); }
	.full-adventure :global(.full-item-header .info) { font-size: calc(10 * var(--ds-media-unit, 1px)); line-height: calc(12 * var(--ds-media-unit, 1px)); overflow-wrap: anywhere; }
	.full-adventure :global(.full-item-header .entity-link), .full-adventure :global(.full-item-header .source) { font-size: calc(8 * var(--ds-media-unit, 1px)); line-height: calc(10 * var(--ds-media-unit, 1px)); }
	.reference { width: min(100%, calc(320 * var(--ds-media-unit, 1px))); min-width: 0; }
	.note-link { display: flex; min-width: 0; }
	.note-link :global(.chip) { box-sizing: border-box; min-width: 0; max-width: 100%; font-size: calc(8 * var(--ds-media-unit, 1px)); line-height: calc(10 * var(--ds-media-unit, 1px)); }
	.note-link :global(a) { overflow-wrap: anywhere; }
	h2 { margin: 0; font-size: calc(16 * var(--ds-media-unit, 1px)); line-height: calc(20 * var(--ds-media-unit, 1px)); }
	.adventure-content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: calc(6 * var(--ds-media-unit, 1px)); padding: 0; margin: 0; list-style: none; }
	.adventure-content li, .entity-card { min-width: 0; }
	.entity-card { --ds-media-unit: 1px; border-radius: calc(8 * var(--ds-media-unit, 1px)); }
	.entity-card[role="button"] { cursor: pointer; }
	.entity-card:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
	.empty { margin: 0; opacity: 0.7; font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(15 * var(--ds-media-unit, 1px)); }
	.scene-actions { display: flex; align-items: stretch; gap: calc(4 * var(--ds-media-unit, 1px)); width: 100%; min-width: 0; }
	.scene-search { flex: 1; min-width: 0; font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(18 * var(--ds-media-unit, 1px)); }
	.scene-search :global(.autocomplete input) { min-height: calc(26 * var(--ds-media-unit, 1px)); }
	.scene-search :global(.suggestions) { width: 100%; max-width: 100%; }
	.create-scene { all: unset; box-sizing: border-box; display: grid; place-items: center; flex: 0 0 calc(26 * var(--ds-media-unit, 1px)); min-height: calc(26 * var(--ds-media-unit, 1px)); border-radius: calc(4 * var(--ds-media-unit, 1px)); background: rgb(212 212 212 / 20%); color: inherit; cursor: pointer; }
	.create-scene:hover:not(:disabled) { background: rgb(212 212 212 / 25%); }
	.create-scene:disabled { opacity: 0.4; cursor: default; }
	.create-scene:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
	@container full-adventure (max-width: 790.5px) { .adventure-content { grid-template-columns: minmax(0, 1fr); } }
</style>
