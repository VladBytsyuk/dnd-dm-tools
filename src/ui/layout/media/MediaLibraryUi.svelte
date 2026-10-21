<script lang="ts">
	import { onMount, tick } from "svelte";
	import { PluginNotice as Notice } from "src/ui/PluginNotice";
	import { Track, Playlist as PlaylistCard, FullScene, FullAdventure, SmallTrack, SmallPlaylist, SmallAdventure, SmallScene, ReferencePicker, Tabs, type FullSceneEntity, type SceneGraphData, type SceneGraphNode, type PlaylistTrack } from "@dnd-dm-tools/design-system";
	import type DndStatblockPlugin from "src/main";
	import { createMediaTrack, createMediaPlaylist, createMediaAdventure, createMediaScene, type MediaState, type MediaTrack, type Playlist, type Adventure, type MediaScene, type AudioAsset } from "src/domain/models/media/MediaState";
	import { findMediaItem, mediaItems, mediaPanel, mediaCampaignName, saveMediaRecord, removeMediaRecord, freeScenePosition, type MediaKind, type MediaItem, type MediaRecord, type MediaRoute } from "src/domain/models/media/MediaLibrary";
	import { EmptySource } from "src/domain/models/common/Source";
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import { cloneDesignData } from "src/ui/design-system/adapters";
	import { theme as appTheme, Theme } from "src/ui/theme";
	import UiSearchToolbar from "../uikit/organisms/UiSearchToolbar.svelte";
	import UiItemGroup from "../uikit/organisms/UiItemGroup.svelte";
	import type { MediaNavigation } from "./MediaNavigation";
	import { extractNoteEntityUrls, extractNoteEncounterBlocks, noteEntityCard } from "./noteContent";
	import MediaFullCardUi from "./MediaFullCardUi.svelte";
	import NoteEncountersUi from "./NoteEncountersUi.svelte";
	import { exportMediaMarkdownBlock, importPlaylistSnapshot, importAdventureSnapshot, importTrackSnapshot, importSceneSnapshot } from "src/domain/models/media/MediaSnapshot";
	import { writeTextToClipboard, getMarkdownCodeBlockFromClipboard } from "src/data/clipboard";

	let { plugin, navigation, panel }: { plugin: DndStatblockPlugin; navigation: MediaNavigation; panel: "player" | "adventures" } = $props();
	const tabsId = $props.id();
	function getHistory() { return navigation.routes; }
	const history = getHistory();
	function getListTab() { return navigation.adventuresTab; }
	const listTab = getListTab();
	function initialMedia() { return plugin.getMediaState(); }
	function initialPlayback() { return plugin.getMediaPlayback().getSnapshot(); }
	let media = $state<MediaState>(initialMedia());
	let playback = $state(initialPlayback());
	let query = $state("");
	let groupsOpen = $state<Record<string, boolean>>({});
	let listScroll = 0;
	let content: HTMLDivElement;
	let fileVersion = $state(0);
	let newRecords = $state<Record<string, MediaRecord>>({});
	let draft = $state<MediaRecord | null>(null);
	let editing = $state(false);
	let saving = $state(false);
	let error = $state("");
	let baseline = "";
	let pendingFiles = $state<AudioAsset[]>([]);
	let pendingTracks = $state<MediaTrack[]>([]);
	let pendingPlaylists = $state<Playlist[]>([]);
	let pendingScenes = $state<MediaScene[]>([]);
	let picker = $state<"normal" | "combat" | "track" | null>(null);
	let pickerTrigger: HTMLElement | null = null;
	let leaveQuestion = $state(false);
	let resolveLeave: ((value: "save" | "discard" | "stay") => void) | undefined;
	let entities = $state<FullSceneEntity[]>([]);
	let encounters = $state<string[]>([]);
	let noteError = $state("");
	let noteLoading = $state(false);
	let noteSequence = 0;
	let lastRoute = "";
	const theme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	const route = $derived($history.at(-1));
	const entry = $derived(route ? findMediaItem(media, route) : undefined);
	const record = $derived(editing ? draft : entry?.record);
	const track = $derived(record as MediaTrack | undefined);
	const playlist = $derived(record as Playlist | undefined);
	const adventure = $derived(record as Adventure | undefined);
	const scene = $derived(record as MediaScene | undefined);
	const libraryItems = $derived(mediaItems(media));
	const availableCampaigns = $derived([...new Set([...media.adventures, ...media.scenes].map((item) => item.campaignName.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru")));
	const matching = $derived(libraryItems.filter((item) => `${item.name.rus} ${item.url} ${item.adventures?.map((adventure) => adventure.name).join(" ") ?? ""} ${mediaCampaignName(item)}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru"))));
	const campaigns = $derived.by(() => {
		const groups = new Map<string, MediaItem[]>();
		for (const item of matching.filter((item) => item.mediaRoute.kind === $listTab)) {
			const campaign = mediaCampaignName(item).trim();
			groups.set(campaign, [...groups.get(campaign) ?? [], item]);
		}
		for (const items of groups.values()) {
			items.sort((a, b) => {
				const firstAdventure = (item: MediaItem) => item.adventures?.map((adventure) => adventure.name).sort((a, b) => a.localeCompare(b, "ru"))[0] ?? "";
				const aAdventure = firstAdventure(a), bAdventure = firstAdventure(b);
				const adventureOrder = !aAdventure !== !bAdventure ? (aAdventure ? -1 : 1) : aAdventure.localeCompare(bAdventure, "ru");
				return adventureOrder || a.name.rus.localeCompare(b.name.rus, "ru");
			});
		}
		return [...groups].sort(([a], [b]) => !a ? 1 : !b ? -1 : a.localeCompare(b, "ru"));
	});
	const notePath = $derived(record && (route?.kind === "scene" || route?.kind === "adventure") ? (record as Adventure | MediaScene).notePath : null);
	const availableNotes = $derived.by(() => { void fileVersion; return plugin.app.vault.getMarkdownFiles().map((file) => file.path).sort((a, b) => a.localeCompare(b, "ru")); });
	const audioFiles = $derived.by(() => { void fileVersion; return plugin.app.vault.getFiles().filter((file) => /^(mp3|ogg|wav|m4a|flac|aac|opus)$/i.test(file.extension)).map((file) => file.path).sort((a, b) => a.localeCompare(b, "ru")); });
	const referenceTracks = $derived([...media.tracks, ...pendingTracks]);
	const referencePlaylists = $derived([...media.playlists, ...pendingPlaylists]);
	const referenceScenes = $derived([...media.scenes, ...pendingScenes]);
	const trackOptions = $derived(referenceTracks.map((item) => ({ id: item.id, title: item.name, atmosphere: item.atmosphere, source: item.source?.shortName, hasCombat: !!item.combatAudioId })));
	const playlistOptions = $derived(referencePlaylists.map((item) => ({ id: item.id, title: item.name, atmosphere: item.atmosphere, source: item.source?.shortName, trackCount: item.items.length })));
	const availableScenes = $derived(libraryItems.filter((item) => item.mediaRoute.kind === "scene" && (route?.kind !== "adventure" || !adventure?.scenes.some((scene) => scene.id === item.record.id))));
	const sceneOptions = $derived(availableScenes.map((item) => ({ value: item.record.id, label: [item.record.name, item.adventures?.map((adventure) => adventure.name).join(", "), mediaCampaignName(item)].filter(Boolean).join(" · ") })));
	const pickerLabel = $derived(picker === "track" ? "Добавить трек" : "Аудиофайл");
	const pickerOptions = $derived(picker === "track" ? referenceTracks.map((item) => ({ value: item.id, label: item.name })) : audioFiles.map((path) => ({ value: path, label: path })));

	$effect(() => {
		const key = route ? JSON.stringify([route.kind, route.id, route.kind === "scene" ? route.adventureId : null]) : "";
		if (key === lastRoute) return;
		lastRoute = key;
		error = ""; picker = null; pendingFiles = []; pendingTracks = []; pendingPlaylists = []; pendingScenes = [];
		const pending = route ? newRecords[route.id] : undefined;
		draft = pending ? cloneDesignData(pending) : null;
		editing = !!pending;
		baseline = "";
		if (route?.kind === "scene" && !pending && entry) {
			const context = entry.adventures?.find((adventure) => adventure.id === route.adventureId)?.id ?? null;
			void action(() => plugin.activateScene(context, route.id));
		}
		void tick().then(() => { if (content) content.scrollTop = route ? 0 : listScroll; });
	});

	$effect(() => {
		const path = notePath;
		void fileVersion;
		void media;
		const sequence = ++noteSequence;
		entities = []; encounters = []; noteError = ""; noteLoading = !!path;
		if (!path) return;
		void (async () => {
			try {
				const file = plugin.app.vault.getFileByPath(path);
				if (!file) throw new Error(`Заметка отсутствует: ${path}`);
				const markdown = await plugin.app.vault.cachedRead(file);
				const urls = extractNoteEntityUrls(markdown);
				const resolved = await Promise.allSettled(urls.map((url) => plugin.panelManager.resolveEntity(url)));
				if (sequence !== noteSequence) return;
				entities = resolved.flatMap((result) => result.status === "fulfilled" && result.value ? [{ url: result.value.url, label: result.value.title, card: noteEntityCard(result.value) }] : []);
				encounters = extractNoteEncounterBlocks(markdown);
				const missing = resolved.filter((result) => result.status === "rejected" || !result.value).length;
				if (missing) noteError = `Не удалось найти сущности: ${missing}`;
			} catch (failure) { if (sequence === noteSequence) noteError = message(failure); }
			finally { if (sequence === noteSequence) noteLoading = false; }
		})();
	});

	onMount(() => {
		const unMedia = plugin.subscribeMedia(() => { media = plugin.getMediaState(); });
		const unPlayback = plugin.getMediaPlayback().subscribe(() => { playback = plugin.getMediaPlayback().getSnapshot(); });
		const refresh = () => { fileVersion++; };
		const refs = [plugin.app.vault.on("create", refresh), plugin.app.vault.on("rename", (file, oldPath) => {
			const move = (path: string) => path === oldPath || path.startsWith(`${oldPath}/`) ? file.path + path.slice(oldPath.length) : path;
			function rename(record: MediaRecord) {
				if ("notePath" in record && record.notePath) record.notePath = move(record.notePath);
			}
			if (draft) rename(draft);
			Object.values(newRecords).forEach(rename);
			pendingScenes.forEach(rename);
			pendingFiles.forEach((asset) => { asset.path = move(asset.path); });
			if (baseline) { const value = JSON.parse(baseline); rename(value); baseline = JSON.stringify(value); }
			refresh();
		}), plugin.app.vault.on("delete", refresh), plugin.app.vault.on("modify", refresh)];
		navigation.beforeLeave = beforeLeave;
		return () => { unMedia(); unPlayback(); refs.forEach((ref) => plugin.app.vault.offref(ref)); navigation.beforeLeave = undefined; resolveLeave?.("stay"); noteSequence++; };
	});
	function focusDialog(node: HTMLElement) {
		const previous = document.activeElement as HTMLElement | null;
		node.querySelector<HTMLButtonElement>("button")?.focus();
		return { destroy() { if (previous?.isConnected) previous.focus(); } };
	}
	function dialogKey(event: KeyboardEvent) {
		if (event.key === "Escape") { event.preventDefault(); resolveLeave?.("stay"); }
		if (event.key !== "Tab") return;
		const buttons = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("button"));
		const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
		if (event.shiftKey && index <= 0) { event.preventDefault(); buttons.at(-1)?.focus(); }
		else if (!event.shiftKey && index === buttons.length - 1) { event.preventDefault(); buttons[0]?.focus(); }
	}
	function message(failure: unknown) { return failure instanceof Error ? failure.message : String(failure); }
	async function action(work: () => void | Promise<void>) { try { await work(); } catch (failure) { new Notice(message(failure)); } }
	function beginEdit() {
		if (!record) return;
		draft = cloneDesignData(record); draft.source ??= EmptySource();
		baseline = JSON.stringify(draft); editing = true; error = "";
	}
	function discard(goBack = true) {
		if (route && newRecords[route.id]) { delete newRecords[route.id]; if (goBack) history.update((routes) => routes.slice(0, -1)); }
		draft = null; editing = false; pendingFiles = []; pendingTracks = []; pendingPlaylists = []; pendingScenes = []; error = ""; picker = null;
	}
	async function save(): Promise<boolean> {
		if (!draft || !route || saving) return false;
		saving = true; error = "";
		try {
			const value = cloneDesignData(draft);
			const addedFiles = cloneDesignData(pendingFiles);
			const addedTracks = cloneDesignData(pendingTracks);
			const addedPlaylists = cloneDesignData(pendingPlaylists);
			const addedScenes = cloneDesignData(pendingScenes);
			await plugin.updateMedia((state) => {
				for (const asset of addedFiles) if (!state.audioFiles.some((item) => item.id === asset.id)) state.audioFiles.push(asset);
				state.tracks.push(...addedTracks);
				state.playlists.push(...addedPlaylists);
				state.scenes.push(...addedScenes);
				saveMediaRecord(state, route.kind, value, route.kind === "scene" && newRecords[route.id] ? route.adventureId : undefined);
			});
			delete newRecords[route.id]; editing = false; draft = null; pendingFiles = []; pendingTracks = []; pendingPlaylists = []; pendingScenes = []; picker = null;
			return true;
		} catch (failure) { error = message(failure); return false; }
		finally { saving = false; }
	}
	async function beforeLeave(): Promise<boolean> {
		if (saving || leaveQuestion) return false;
		if (!editing) return true;
		if (baseline === JSON.stringify(draft)) { discard(false); return true; }
		leaveQuestion = true;
		const choice = await new Promise<"save" | "discard" | "stay">((resolve) => { resolveLeave = resolve; });
		leaveQuestion = false; resolveLeave = undefined;
		if (choice === "save") return save();
		if (choice === "discard") { discard(); return true; }
		return false;
	}
	async function open(item: MediaItem) {
		if (mediaPanel(item.mediaRoute.kind) === panel) await navigation.open(item.mediaRoute);
		else if (await beforeLeave()) await plugin.openMediaUrl(item.url);
	}
	async function create(kind: MediaKind, parentId?: string) {
		if (parentId && (!editing || saving || route?.kind !== "adventure" || adventure?.id !== parentId)) return;
		if (!(await beforeLeave())) return;
		if (parentId && !media.adventures.some((adventure) => adventure.id === parentId)) return;
		const value = kind === "track" ? createMediaTrack() : kind === "playlist" ? createMediaPlaylist() : kind === "adventure" ? createMediaAdventure() : createMediaScene();
		if (kind === "scene" && parentId) (value as MediaScene).campaignName = media.adventures.find((adventure) => adventure.id === parentId)?.campaignName ?? "";
		newRecords[value.id] = value;
		await navigation.open({ kind, id: value.id, adventureId: parentId });
	}
	function switchTab(kind: string) {
		if (kind !== "adventure" && kind !== "scene") return;
		listTab.set(kind);
		listScroll = 0;
		if (content) content.scrollTop = 0;
	}
	async function remove() {
		if (!route) return;
		const target = route;
		await action(async () => { await plugin.updateMedia((state) => removeMediaRecord(state, target)); history.update((routes) => routes.filter((item) => item.kind !== target.kind || item.id !== target.id)); });
	}
	function trackProps(item: MediaTrack) { return { title: item.name, atmosphere: item.atmosphere, source: item.source?.shortName, hasCombat: !!item.combatAudioId }; }
	function playlistProps(item: Playlist) { return { title: item.name, atmosphere: item.atmosphere, source: item.source?.shortName, trackCount: item.items.length }; }
	function file(id: string | null) { return [...media.audioFiles, ...pendingFiles].find((item) => item.id === id); }
	function showPicker(value: "normal" | "combat" | "track") {
		if (!editing || saving) return;
		pickerTrigger = document.activeElement as HTMLElement | null; picker = value;
	}
	function closePicker() { picker = null; void tick().then(() => { if (pickerTrigger?.isConnected) pickerTrigger.focus(); }); }
	function audioView(id: string | null, variant: "normal" | "combat") {
		const asset = file(id); if (!asset) return undefined;
		const active = playback.sourceId === null && playback.trackId === record?.id && playback.playingVariant === variant;
		return { fileName: asset.path, currentTime: active ? playback.currentTime : 0, duration: active ? playback.duration : 0 };
	}
	function chooseFile(path: string | null) {
		if (!path || !draft || (picker !== "normal" && picker !== "combat")) return;
		let asset = [...media.audioFiles, ...pendingFiles].find((item) => item.path === path);
		if (!asset) { asset = { id: crypto.randomUUID(), path, alias: path.split("/").at(-1)!.replace(/\.[^.]+$/, "") }; pendingFiles.push(asset); }
		(draft as MediaTrack)[picker === "normal" ? "normalAudioId" : "combatAudioId"] = asset.id;
		closePicker();
	}
	function chooseTrack(id: string | null) { if (id && draft) (draft as Playlist).items.push({ id: crypto.randomUUID(), trackId: id }); closePicker(); }
	function chooseScene(id: string | null) {
		if (!id || !editing || saving || route?.kind !== "adventure" || !adventure) return;
		const item = availableScenes.find((item) => item.record.id === id);
		if (!item) return;
		adventure.scenes.push({ id: item.record.id, position: freeScenePosition(adventure.scenes) });
	}
	function playlistTracks(value: Playlist): PlaylistTrack[] {
		return value.items.flatMap((item) => { const linked = referenceTracks.find((track) => track.id === item.trackId); return linked ? [{ ...trackProps(linked), id: item.id }] : []; });
	}
	function updateTracks(cards: PlaylistTrack[]) { if (draft) (draft as Playlist).items = cards.flatMap((card) => (draft as Playlist).items.filter((item) => item.id === card.id)); }
	function openTrack(id: string) { const item = libraryItems.find((entry) => entry.mediaRoute.kind === "track" && entry.record.id === id); if (item) void open(item); }
	function openPlaylist(id: string) { const item = libraryItems.find((entry) => entry.mediaRoute.kind === "playlist" && entry.record.id === id); if (item) void open(item); }
	function graphNodes(value: Adventure): SceneGraphNode[] {
		return value.scenes.flatMap((reference) => {
			const scene = referenceScenes.find((scene) => scene.id === reference.id);
			return scene ? [{ id: scene.id, position: reference.position, note: { path: scene.notePath ?? undefined, title: scene.name, source: scene.source?.shortName, adventureName: value.name, info: scene.campaignName, musicName: referenceTracks.find((track) => track.id === scene.trackId)?.name } }] : [];
		});
	}
	function updateGraph(graph: SceneGraphData) {
		if (!editing || !draft) return;
		const value = draft as Adventure;
		value.scenes = value.scenes.flatMap((scene) => { const node = graph.nodes.find((node) => node.id === scene.id); return node ? [{ ...scene, position: { ...node.position } }] : []; });
		value.links = graph.links.map((link) => ({ ...link, id: link.id ?? crypto.randomUUID() }));
	}
	async function openEntity(url: string) { if (!(await beforeLeave())) return; await action(async () => { const entity = await plugin.panelManager.resolveEntity(url); if (entity) await plugin.panelManager.openItem(entity.panelKey, entity.item); }); }
	async function copyRecord() {
		if (!route || !record) return;
		await action(async () => {
			const text = exportMediaMarkdownBlock(media, route);
			await writeTextToClipboard(text); new Notice("Скопировано.");
		});
	}
	async function importRecord() {
		if (!editing || !draft || !route || saving) return;
		const kind = route.kind, target = draft;
		saving = true;
		await action(async () => {
			const block = await getMarkdownCodeBlockFromClipboard<unknown>(kind); if (!block) throw new Error(`В буфере обмена нет блока ${kind}.`);
			if (!editing || draft !== target) return;
			const importers = { track: importTrackSnapshot, scene: importSceneSnapshot, playlist: importPlaylistSnapshot, adventure: importAdventureSnapshot };
			const imported = importers[kind](cloneDesignData(media), JSON.stringify(block), () => crypto.randomUUID(), (path) => !!plugin.app.vault.getFileByPath(path));
			const value = findMediaItem(imported.state, { kind, id: imported.importedId })!.record;
			pendingFiles = imported.state.audioFiles.filter((item) => !media.audioFiles.some((existing) => existing.id === item.id));
			pendingTracks = imported.state.tracks.filter((item) => item.id !== imported.importedId && !media.tracks.some((existing) => existing.id === item.id));
			pendingScenes = imported.state.scenes.filter((item) => item.id !== imported.importedId && !media.scenes.some((existing) => existing.id === item.id));
			pendingPlaylists = imported.state.playlists.filter((item) => item.id !== imported.importedId && !media.playlists.some((existing) => existing.id === item.id));
			draft = { ...value, id: target.id, url: target.url };
			error = "";
			if (imported.missingPaths.length) new Notice(`Отсутствуют файлы: ${imported.missingPaths.join(", ")}`);
		});
		saving = false;
	}
</script>

<div class="media-library" data-theme={theme}>
	<UiSearchToolbar onbackclick={route ? () => void navigation.back() : undefined} onvaluechange={(value) => query = value} isvaluechangable={() => !route}
		onaddclick={!route && panel === "adventures" ? () => void create($listTab) : undefined}
		onplayclick={record && route?.kind === "track" ? () => void action(() => plugin.getMediaPlayback().playTrack(record!.id)) : record && route?.kind === "playlist" ? () => void action(() => plugin.getMediaPlayback().play(record!.id)) : undefined}
		playDisabled={editing || (route?.kind === "track" ? !track?.normalAudioId && !track?.combatAudioId : route?.kind === "playlist" ? !playlist?.items.length : false)}
		oneditclick={route && record && !editing ? beginEdit : undefined} onsaveclick={editing ? () => void save() : undefined} oncancelclick={editing ? () => discard() : undefined}
		onpasteclick={editing && route ? () => void importRecord() : undefined}
		ondeleteclick={route && record && !editing ? () => void remove() : undefined} oncopyclick={route && record && !editing ? () => void copyRecord() : undefined} actionBusy={saving} />
	{#if !route && panel === "adventures"}
		<div class="adventures-tabs">
			<Tabs id={tabsId} panelId={`${tabsId}-list`} ariaLabel="Приключения и сцены" items={[{ value: "adventure", label: "Приключения" }, { value: "scene", label: "Сцены" }]}
				value={$listTab} onValueChange={switchTab} accentColor={theme === "light" ? "var(--ds-adventure-light)" : "var(--ds-adventure)"} {theme} />
		</div>
	{/if}
	<div class="content" id={`${tabsId}-list`} role={!route && panel === "adventures" ? "tabpanel" : undefined} aria-labelledby={!route && panel === "adventures" ? `${tabsId}-${$listTab}` : undefined} bind:this={content} onscroll={() => { if (!route) listScroll = content.scrollTop; }}>
		{#if error}<p class="error" role="alert">{error}</p>{/if}
		{#if !route}
			{#if panel === "player"}
				<UiItemGroup panelKey="player" groupTitle="Плейлисты" items={matching.filter((item) => item.mediaRoute.kind === "playlist")} onItemClick={(item) => void open(item as MediaItem)} itemContent={listCard} onAdd={() => void create("playlist")} color="var(--ds-playlist)" isOpen={groupsOpen.playlists ?? true} onOpenChange={(value) => groupsOpen.playlists = value} />
				<UiItemGroup panelKey="player" groupTitle="Треки" items={matching.filter((item) => item.mediaRoute.kind === "track")} onItemClick={(item) => void open(item as MediaItem)} itemContent={listCard} onAdd={() => void create("track")} color="var(--ds-track)" isOpen={groupsOpen.tracks ?? true} onOpenChange={(value) => groupsOpen.tracks = value} />
			{:else}
				{#each campaigns as [campaign, items] (campaign)}<UiItemGroup panelKey="adventures" groupTitle={campaign || "Без кампании"} {items} onItemClick={(item) => void open(item as MediaItem)} itemContent={listCard} color={$listTab === "scene" ? "var(--ds-scene)" : "var(--ds-adventure)"} isOpen={groupsOpen[`${$listTab}:${campaign}`] ?? true} onOpenChange={(value) => groupsOpen[`${$listTab}:${campaign}`] = value} />{/each}
				{#if !campaigns.length}<p class="empty">{query ? "Ничего не найдено" : $listTab === "scene" ? "Сцены пока не добавлены" : "Приключения пока не добавлены"}</p>{/if}
			{/if}
		{:else if !record}<p class="empty">Запись не найдена</p>
		{:else if !editing && entry}
			<MediaFullCardUi {plugin} item={entry} {media} {entities} {encounters} {theme}
				onOpenMedia={(url) => { const item = libraryItems.find((value) => value.url === url); if (item) return open(item); }}
				onSceneOpen={(id) => void navigation.open({ kind: "scene", id, adventureId: entry!.record.id })} />
		{:else if route.kind === "track" && track}
			<Track editable={editing} playbackDisabled={editing} {theme}
				bind:russianName={track.name} bind:entityLink={track.url} bind:atmosphere={track.atmosphere} bind:source={track.source} bind:loop={track.loop}
				normal={audioView(track.normalAudioId, "normal")} combat={audioView(track.combatAudioId, "combat")} playingVariant={playback.sourceId === null && playback.trackId === track.id && playback.playing ? playback.playingVariant : null}
				onPlayingVariantChange={(variant) => action(() => variant ? plugin.getMediaPlayback().playTrack(track!.id, variant) : plugin.getMediaPlayback().stop())}
				onSeek={(variant, time) => { if (playback.sourceId === null && playback.trackId === track!.id && playback.playingVariant === variant) plugin.getMediaPlayback().seek(time); }}
				onAddFile={editing ? showPicker : undefined} onRemoveFile={editing ? (variant) => { track![variant === "normal" ? "normalAudioId" : "combatAudioId"] = null; } : undefined} />
			{#each [track.normalAudioId, track.combatAudioId] as id}{#if id && file(id) && !audioFiles.includes(file(id)!.path)}<p class="error">Аудиофайл отсутствует: {file(id)!.path}</p>{/if}{/each}
		{:else if route.kind === "playlist" && playlist}
			<PlaylistCard bind:russianName={playlist.name} bind:entityLink={playlist.url} bind:atmosphere={playlist.atmosphere} bind:source={playlist.source} tracks={playlistTracks(playlist)} editable={editing} {theme}
				onTrackClick={(id) => { const item = playlist!.items.find((item) => item.id === id); if (item) openTrack(item.trackId); }} onTracksChange={updateTracks} onAddTrack={editing ? () => showPicker("track") : undefined} />
		{:else if route.kind === "adventure" && adventure}
			<FullAdventure bind:russianName={adventure.name} bind:entityLink={adventure.url} bind:campaignName={adventure.campaignName} bind:source={adventure.source} bind:notePath={adventure.notePath}
				{availableCampaigns}
				playlist={playlistOptions.find((item) => item.id === adventure!.playlistId) ?? null} {availableNotes} availablePlaylists={playlistOptions} onPlaylistChange={(value) => adventure!.playlistId = value?.id ?? null}
				nodes={graphNodes(adventure)} links={adventure.links} onGraphChange={updateGraph} onSceneOpen={(id) => void navigation.open({ kind: "scene", id, adventureId: adventure!.id })}
				onCreateScene={editing ? () => void create("scene", adventure!.id) : undefined} createSceneDisabled={saving}
				availableScenes={sceneOptions} onAddScene={editing ? chooseScene : undefined} addSceneDisabled={saving}
				{entities} afterContent={encounters.length ? encounterContent : undefined} editable={editing} {theme} onOpenNote={(path) => action(() => plugin.openMediaNote(path))} onPlaylistClick={openPlaylist} onEntityClick={openEntity} />
		{:else if route.kind === "scene" && scene}
			<FullScene bind:russianName={scene.name} bind:entityLink={scene.url} bind:source={scene.source} bind:notePath={scene.notePath}
				adventures={(entry?.adventures ?? (newRecords[scene.id] ? media.adventures.filter((item) => item.id === route.adventureId) : [])).map((item) => ({ id: item.id, title: item.name }))}
				{availableCampaigns}
				bind:campaignName={scene.campaignName}
				track={trackOptions.find((item) => item.id === scene!.trackId) ?? null} availableTracks={trackOptions} onTrackChange={(value) => scene!.trackId = value?.id ?? null}
				{availableNotes} {entities} afterContent={encounters.length ? encounterContent : undefined} editable={editing} {theme} onOpenNote={(path) => action(() => plugin.openMediaNote(path))} onTrackClick={openTrack} onEntityClick={openEntity} />
		{/if}
		{#if noteLoading}<p class="empty" role="status">Загрузка ссылок из заметки…</p>{/if}
		{#if noteError}<p class="error" role="status">{noteError}</p>{/if}
	</div>
	{#if editing && picker}
		<div class="picker-overlay"><div class="picker-panel" role="dialog" aria-label={picker === "normal" || picker === "combat" ? "Выбрать аудиофайл" : pickerLabel}>
			<ReferencePicker label={pickerLabel} options={pickerOptions} open panelOnly onChange={picker === "track" ? chooseTrack : chooseFile} onClose={closePicker} {theme} />
		</div></div>
	{/if}
	{#if leaveQuestion}
		<div class="modal-overlay"><div class="leave-dialog" use:focusDialog role="dialog" tabindex="-1" onkeydown={dialogKey} aria-modal="true" aria-label="Несохранённые изменения">
			<h3>Сохранить изменения?</h3><p>В редакторе есть несохранённые изменения.</p>
			<div class="dialog-actions"><button type="button" onclick={() => resolveLeave?.("save")}>Сохранить</button><button type="button" onclick={() => resolveLeave?.("discard")}>Не сохранять</button><button type="button" onclick={() => resolveLeave?.("stay")}>Остаться</button></div>
		</div></div>
	{/if}
</div>

{#snippet encounterContent()}
	<NoteEncountersUi app={plugin.app} {encounters} sourcePath={notePath ?? ""} />
{/snippet}

{#snippet listCard(base: BaseItem)}
	{@const item = base as MediaItem}
	{#if item.mediaRoute.kind === "track"}
		{@const value = item.record as MediaTrack}<SmallTrack {...trackProps(value)} {theme} onclick={() => void open(item)} />
	{:else if item.mediaRoute.kind === "playlist"}
		{@const value = item.record as Playlist}<SmallPlaylist {...playlistProps(value)} {theme} onclick={() => void open(item)} />
	{:else if item.mediaRoute.kind === "scene"}
		{@const value = item.record as MediaScene}<SmallScene title={value.name} adventureName={item.adventures?.map((adventure) => adventure.name).join(", ")} musicName={media.tracks.find((track) => track.id === value.trackId)?.name} source={value.source?.shortName} {theme} onclick={() => void open(item)} />
	{:else}
		{@const value = item.record as Adventure}<SmallAdventure title={value.name} sceneCount={value.scenes.length} playlistName={media.playlists.find((item) => item.id === value.playlistId)?.name} source={value.source?.shortName} {theme} onclick={() => void open(item)} />
	{/if}
{/snippet}

<style>
	.media-library { display: flex; flex-direction: column; height: 100%; min-height: 0; min-width: 0; position: relative; }
	.adventures-tabs { flex-shrink: 0; padding-top: 6px; }
	.content { overflow: auto; flex: 1; min-height: 0; padding: 6px 0; display: flex; flex-direction: column; gap: 6px; }
	.content > :global(*) { flex-shrink: 0; }
	.error { color: var(--text-error); font-size: 12px; margin: 4px 8px; overflow-wrap: anywhere; }
	.empty { color: var(--text-muted); padding: 8px; margin: 0; font-size: 12px; }
	.picker-overlay, .modal-overlay { position: absolute; inset: 0; z-index: 50; background: rgb(0 0 0 / 35%); display: flex; align-items: flex-start; justify-content: center; padding: 50px 8px 8px; }
	.picker-panel { --ds-media-unit: 1.5px; position: relative; width: min(540px, 100%); min-width: 0; }
	.picker-panel :global(.reference-picker) { width: 100%; }
	.modal-overlay { align-items: center; padding: 8px; }
	.leave-dialog { padding: 16px; border: 1px solid var(--background-modifier-border); border-radius: 8px; background: var(--background-primary); max-width: 100%; }
	.leave-dialog h3 { margin: 0; }
	.dialog-actions { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
