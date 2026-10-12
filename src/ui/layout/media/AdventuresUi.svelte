<script lang="ts">
	import { Notice } from "obsidian";
	import { onMount } from "svelte";
	import type DndStatblockPlugin from "src/main";
	import type { Adventure, MediaState } from "src/domain/models/media/MediaState";
	import { writeTextToClipboard, getMarkdownCodeBlockFromClipboard } from "src/data/clipboard";
	import { exportAdventureSnapshot, importAdventureSnapshot } from "src/domain/models/media/MediaSnapshot";
	import SceneGraph from "./SceneGraph.svelte";

	let { plugin }: { plugin: DndStatblockPlugin } = $props();
	function initialMedia() { return plugin.getMediaState(); }
	let media = $state<MediaState>(initialMedia());
	let adventureId = $state("");
	let newName = $state("");
	let scenePath = $state("");
	let fromSceneId = $state("");
	let toSceneId = $state("");
	let fileVersion = $state(0);
	const adventure = $derived(media.adventures.find((item) => item.id === adventureId));
	const markdownFiles = $derived.by(() => {
		void fileVersion;
		return plugin.app.vault.getMarkdownFiles().sort((a, b) => a.path.localeCompare(b.path, "ru"));
	});
	const graphScenes = $derived.by(() => {
		void fileVersion;
		return adventure?.scenes.map((scene) => ({
			id: scene.id, path: scene.path, missing: !plugin.app.vault.getFileByPath(scene.path),
		})) ?? [];
	});
	function fileExists(path: string) { void fileVersion; return !!plugin.app.vault.getFileByPath(path); }
	const activeScene = $derived(media.activeAdventureId === adventureId ? adventure?.scenes.find((scene) => scene.id === media.activeSceneId) : undefined);
	const outgoing = $derived(activeScene ? adventure?.links.filter((link) => link.fromSceneId === activeScene.id) ?? [] : []);

	$effect(() => {
		if (!media.adventures.some((item) => item.id === adventureId)) adventureId = media.adventures[0]?.id ?? "";
	});
	onMount(() => {
		const unMedia = plugin.subscribeMedia(() => { media = plugin.getMediaState(); });
		const refresh = () => { fileVersion += 1; };
		const created = plugin.app.vault.on("create", refresh);
		const renamed = plugin.app.vault.on("rename", refresh);
		const deleted = plugin.app.vault.on("delete", refresh);
		return () => { unMedia(); plugin.app.vault.offref(created); plugin.app.vault.offref(renamed); plugin.app.vault.offref(deleted); };
	});
	function errorMessage(error: unknown) { new Notice(error instanceof Error ? error.message : String(error)); }
	async function change(update: (state: MediaState) => void): Promise<boolean> {
		try { await plugin.updateMedia(update); return true; } catch (error) { errorMessage(error); return false; }
	}
	function createAdventure() {
		const name = newName.trim();
		if (!name) return;
		const id = crypto.randomUUID();
		void change((state) => state.adventures.push({ id, name, playlistIds: [], scenes: [], links: [] })).then((ok) => { if (ok) { adventureId = id; newName = ""; } });
	}
	function addScene() {
		if (!adventure || !scenePath || adventure.scenes.some((scene) => scene.path === scenePath)) return;
		void change((state) => state.adventures.find((item) => item.id === adventureId)?.scenes.push({ id: crypto.randomUUID(), path: scenePath, playlistId: null, itemId: null })).then((ok) => { if (ok) scenePath = ""; });
	}
	function removeScene(sceneId: string) {
		if (media.activeAdventureId === adventureId && media.activeSceneId === sceneId) plugin.getMediaPlayback().stop();
		void change((state) => {
			const target = state.adventures.find((item) => item.id === adventureId);
			if (!target) return;
			target.scenes = target.scenes.filter((scene) => scene.id !== sceneId);
			target.links = target.links.filter((link) => link.fromSceneId !== sceneId && link.toSceneId !== sceneId);
			if (state.activeAdventureId === adventureId && state.activeSceneId === sceneId) state.activeSceneId = null;
		});
	}
	function addLink() {
		if (!fromSceneId || !toSceneId || !adventure || adventure.links.some((link) => link.fromSceneId === fromSceneId && link.toSceneId === toSceneId)) return;
		void change((state) => state.adventures.find((item) => item.id === adventureId)?.links.push({ fromSceneId, toSceneId }));
	}
	async function activate(sceneId: string) {
		try { await plugin.activateScene(adventureId, sceneId); } catch (error) { errorMessage(error); }
	}
	function sceneName(sceneId: string) { return adventure?.scenes.find((scene) => scene.id === sceneId)?.path.split("/").at(-1) ?? "Сцена"; }
	function playlistName(id: string) { return media.playlists.find((list) => list.id === id)?.name ?? "Плейлист"; }
	function itemName(playlistId: string, itemId: string) {
		const item = media.playlists.find((list) => list.id === playlistId)?.items.find((entry) => entry.id === itemId);
		return media.audioFiles.find((audio) => audio.id === item?.normalAudioId)?.alias ?? "Элемент";
	}
	async function exportAdventure() {
		try { await writeTextToClipboard(`\`\`\`adventure\n${exportAdventureSnapshot(media, adventureId)}\n\`\`\``); new Notice("Блок adventure скопирован."); }
		catch (error) { errorMessage(error); }
	}
	async function importAdventure() {
		try {
			const block = await getMarkdownCodeBlockFromClipboard<unknown>("adventure");
			if (!block) throw new Error("В буфере обмена нет блока adventure.");
			const result = importAdventureSnapshot(media, JSON.stringify(block), () => crypto.randomUUID(), (path) => !!plugin.app.vault.getFileByPath(path));
			if (!(await change((state) => Object.assign(state, result.state)))) return;
			adventureId = result.importedId;
			new Notice(result.missingPaths.length ? `Импортировано. Отсутствуют файлы: ${result.missingPaths.join(", ")}` : "Приключение импортировано.");
		} catch (error) { errorMessage(error); }
	}
</script>

<div class="adventures-panel">
	<h2>Приключения</h2>
	<div class="row"><button onclick={importAdventure}>Импорт из буфера</button><button onclick={exportAdventure} disabled={!adventure}>Копировать MD-блок</button></div>
	<div class="row"><input placeholder="Название приключения" bind:value={newName} /><button onclick={createAdventure} disabled={!newName.trim()}>Создать</button></div>
	<select aria-label="Приключение" bind:value={adventureId}><option value="">Выберите приключение</option>{#each media.adventures as option (option.id)}<option value={option.id}>{option.name}</option>{/each}</select>
	{#if adventure}
		<div class="row"><input aria-label="Название приключения" value={adventure.name} onchange={(event) => change((state) => { const target = state.adventures.find((item) => item.id === adventureId); if (target) target.name = event.currentTarget.value.trim() || target.name; })} /><button onclick={() => { if (media.activeAdventureId === adventureId) plugin.getMediaPlayback().stop(); void change((state) => { state.adventures = state.adventures.filter((item) => item.id !== adventureId); if (state.activeAdventureId === adventureId) { state.activeAdventureId = null; state.activeSceneId = null; } }); }}>Удалить</button></div>
		<section>
			<h3>Плейлисты приключения</h3>
			{#each media.playlists as list (list.id)}
				<label><input type="checkbox" checked={adventure.playlistIds.includes(list.id)} onchange={(event) => change((state) => { const target = state.adventures.find((item) => item.id === adventureId); if (!target) return; if (event.currentTarget.checked) target.playlistIds.push(list.id); else { target.playlistIds = target.playlistIds.filter((id) => id !== list.id); for (const scene of target.scenes) if (scene.playlistId === list.id) { scene.playlistId = null; scene.itemId = null; } } })} /> {list.name}</label>
			{/each}
		</section>
		<section>
			<h3>Сцены</h3>
			<div class="row"><select aria-label="Markdown-файл сцены" bind:value={scenePath}><option value="">Выберите заметку</option>{#each markdownFiles as file (file.path)}<option value={file.path}>{file.path}</option>{/each}</select><button onclick={addScene} disabled={!scenePath}>Добавить сцену</button></div>
			{#each adventure.scenes as scene (scene.id)}
				<div class="scene">
					<div class="row"><strong>{scene.path.split("/").at(-1)}</strong>{#if !fileExists(scene.path)}<small>Файл отсутствует</small>{/if}<button onclick={() => activate(scene.id)} disabled={!fileExists(scene.path)}>Перейти</button><button onclick={() => removeScene(scene.id)} aria-label="Удалить сцену">×</button></div>
					<small>{scene.path}</small>
					<select aria-label="Плейлист сцены" value={scene.playlistId ?? ""} onchange={(event) => change((state) => { const target = state.adventures.find((item) => item.id === adventureId)?.scenes.find((item) => item.id === scene.id); if (target) { target.playlistId = event.currentTarget.value || null; target.itemId = null; } })}><option value="">Без музыки</option>{#each adventure.playlistIds as id (id)}<option value={id}>{playlistName(id)}</option>{/each}</select>
				{#if scene.playlistId}<select aria-label="Элемент сцены" value={scene.itemId ?? ""} onchange={(event) => change((state) => { const target = state.adventures.find((item) => item.id === adventureId)?.scenes.find((item) => item.id === scene.id); if (target) target.itemId = event.currentTarget.value || null; })}><option value="">Выберите элемент</option>{#each media.playlists.find((list) => list.id === scene.playlistId)?.items ?? [] as item (item.id)}<option value={item.id}>{itemName(scene.playlistId, item.id)}</option>{/each}</select>{/if}
				</div>
			{/each}
		</section>
		<section>
			<h3>Связи сцен</h3>
			<div class="row"><select aria-label="Из сцены" bind:value={fromSceneId}><option value="">Из сцены</option>{#each adventure.scenes as scene (scene.id)}<option value={scene.id}>{sceneName(scene.id)}</option>{/each}</select><span>→</span><select aria-label="В сцену" bind:value={toSceneId}><option value="">В сцену</option>{#each adventure.scenes as scene (scene.id)}<option value={scene.id}>{sceneName(scene.id)}</option>{/each}</select><button onclick={addLink} disabled={!fromSceneId || !toSceneId}>Связать</button></div>
			{#each adventure.links as link (`${link.fromSceneId}:${link.toSceneId}`)}<div class="row"><span>{sceneName(link.fromSceneId)} → {sceneName(link.toSceneId)}</span><button onclick={() => change((state) => { const target = state.adventures.find((item) => item.id === adventureId); if (target) target.links = target.links.filter((entry) => entry.fromSceneId !== link.fromSceneId || entry.toSceneId !== link.toSceneId); })} aria-label="Удалить связь">×</button></div>{/each}
		</section>
		<section><h3>Граф</h3><SceneGraph scenes={graphScenes} links={adventure.links} activeSceneId={media.activeAdventureId === adventureId ? media.activeSceneId : null} onSelect={(id) => { void activate(id); }} /></section>
		{#if activeScene}<section><h3>Текущая сцена: {sceneName(activeScene.id)}</h3><div class="row">{#each outgoing as link (`${link.fromSceneId}:${link.toSceneId}`)}<button onclick={() => activate(link.toSceneId)}>→ {sceneName(link.toSceneId)}</button>{/each}</div></section>{/if}
	{/if}
</div>

<style>
	.adventures-panel { overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box; }
	h2, h3 { margin: 0; }
	h3 { font-size: 14px; }
	.row { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
	.row input, .row select, .row span:first-child { flex: 1; min-width: 90px; }
	section, .scene { display: flex; flex-direction: column; gap: 7px; padding: 8px 0; border-bottom: 1px solid var(--background-modifier-border); }
	.scene { padding: 7px; border: 1px solid var(--background-modifier-border); border-radius: 5px; }
	.scene strong { flex: 1; overflow-wrap: anywhere; }
	small { color: var(--text-muted); overflow-wrap: anywhere; }
	label { display: flex; align-items: center; gap: 5px; }
	button, select, input { font: inherit; }
	button { cursor: pointer; }
</style>
