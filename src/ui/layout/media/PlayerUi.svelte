<script lang="ts">
	import { Notice, type TFile } from "obsidian";
	import { onMount } from "svelte";
	import type DndStatblockPlugin from "src/main";
	import { toLegacyMedia, applyLegacyMedia, type LegacyMediaState as MediaState, type LegacyPlaylist as Playlist } from "src/domain/models/media/LegacyMedia";
	import { writeTextToClipboard, getMarkdownCodeBlockFromClipboard } from "src/data/clipboard";
	import { exportPlaylistSnapshot, importPlaylistSnapshot } from "src/domain/models/media/MediaSnapshot";

	let { plugin }: { plugin: DndStatblockPlugin } = $props();
	function initialMedia() { return toLegacyMedia(plugin.getMediaState()); }
	function initialPlayback() { return plugin.getMediaPlayback().getSnapshot(); }
	let media = $state<MediaState>(initialMedia());
	let playback = $state(initialPlayback());
	let fileVersion = $state(0);
	let playlistId = $state("");
	let newPlaylistName = $state("");
	let normalAudioId = $state("");
	let vaultPath = $state("");
	let combatAudioId = $state("");
	let effectAudioId = $state("");
	const audioExtensions = new Set(["mp3", "ogg", "wav", "m4a", "flac", "aac", "opus"]);
	const availableFiles = $derived.by(() => {
		void fileVersion;
		return plugin.app.vault.getFiles().filter((file) => audioExtensions.has(file.extension.toLowerCase())).sort((a, b) => a.path.localeCompare(b.path, "ru"));
	});
	const playlist = $derived(media.playlists.find((item) => item.id === playlistId));

	$effect(() => {
		if (!media.playlists.some((item) => item.id === playlistId)) playlistId = media.playlists[0]?.id ?? "";
	});

	onMount(() => {
		const unMedia = plugin.subscribeMedia(() => { media = toLegacyMedia(plugin.getMediaState()); });
		const unPlayback = plugin.getMediaPlayback().subscribe(() => { playback = plugin.getMediaPlayback().getSnapshot(); });
		const onFiles = () => { fileVersion += 1; };
		const created = plugin.app.vault.on("create", onFiles);
		const renamed = plugin.app.vault.on("rename", onFiles);
		const deleted = plugin.app.vault.on("delete", onFiles);
		return () => { unMedia(); unPlayback(); plugin.app.vault.offref(created); plugin.app.vault.offref(renamed); plugin.app.vault.offref(deleted); };
	});

	async function change(update: (state: MediaState) => void): Promise<boolean> {
		try { const before = toLegacyMedia(plugin.getMediaState()); const next = structuredClone(before); update(next); await plugin.updateMedia((state) => applyLegacyMedia(state, before, next)); return true; } catch (error) { showError(error); return false; }
	}
	async function play(action: () => Promise<void> | void) {
		try { await action(); } catch (error) { showError(error); }
	}
	function showError(error: unknown) { new Notice(error instanceof Error ? error.message : String(error)); }
	function fileExists(path: string) { void fileVersion; return !!plugin.app.vault.getFileByPath(path); }
	function addAudio(file: TFile) {
		if (media.audioFiles.some((audio) => audio.path === file.path)) return;
		void change((state) => state.audioFiles.push({ id: crypto.randomUUID(), path: file.path, alias: file.basename }));
	}
	function addPlaylist() {
		const name = newPlaylistName.trim();
		if (!name) return;
		const id = crypto.randomUUID();
		void change((state) => state.playlists.push({ id, name, items: [] })).then((ok) => { if (ok) { playlistId = id; newPlaylistName = ""; } });
	}
	function addItem() {
		if (!playlistId || !normalAudioId) return;
		void change((state) => state.playlists.find((item) => item.id === playlistId)?.items.push({
			id: crypto.randomUUID(), normalAudioId, combatAudioId: combatAudioId || null, loop: true,
		}));
	}
	function moveItem(itemId: string, offset: number) {
		void change((state) => {
			const items = state.playlists.find((item) => item.id === playlistId)?.items;
			if (!items) return;
			const index = items.findIndex((item) => item.id === itemId);
			const next = index + offset;
			if (index < 0 || next < 0 || next >= items.length) return;
			[items[index], items[next]] = [items[next], items[index]];
		});
	}
	function removePlaylist(target: Playlist) {
		void change((state) => {
			state.playlists = state.playlists.filter((item) => item.id !== target.id);
			for (const adventure of state.adventures) {
				adventure.playlistIds = adventure.playlistIds.filter((id) => id !== target.id);
				for (const scene of adventure.scenes) if (scene.playlistId === target.id) { scene.playlistId = null; scene.itemId = null; }
			}
		});
	}
	async function exportPlaylist() {
		try {
			await writeTextToClipboard(`\`\`\`playlist\n${exportPlaylistSnapshot(plugin.getMediaState(), playlistId)}\n\`\`\``);
			new Notice("Блок playlist скопирован.");
		} catch (error) { showError(error); }
	}
	async function importPlaylist() {
		try {
			const block = await getMarkdownCodeBlockFromClipboard<unknown>("playlist");
			if (!block) throw new Error("В буфере обмена нет блока playlist.");
			const result = importPlaylistSnapshot(plugin.getMediaState(), JSON.stringify(block), () => crypto.randomUUID(), (path) => !!plugin.app.vault.getFileByPath(path));
			await plugin.updateMedia((state) => Object.assign(state, result.state));
			playlistId = result.importedId;
			new Notice(result.missingPaths.length ? `Импортировано. Отсутствуют файлы: ${result.missingPaths.join(", ")}` : "Плейлист импортирован.");
		} catch (error) { showError(error); }
	}
</script>

<div class="media-panel">
	<h2>Плеер</h2>
	<section>
		<h3>Сейчас играет</h3>
		<div class="transport">
			<span>{playback.title ?? "Ничего не играет"}</span>
			<button onclick={() => play(() => plugin.getMediaPlayback().previous())} disabled={!playback.itemId} aria-label="Предыдущий">◀◀</button>
			<button onclick={() => play(() => playback.playing ? plugin.getMediaPlayback().pause() : playback.itemId ? plugin.getMediaPlayback().resume() : playlistId ? plugin.getMediaPlayback().play(playlistId) : undefined)} aria-label={playback.playing ? "Пауза" : "Воспроизвести"}>{playback.playing ? "Ⅱ" : "▶"}</button>
			<button onclick={() => play(() => plugin.getMediaPlayback().next())} disabled={!playback.itemId} aria-label="Следующий">▶▶</button>
			<button onclick={() => play(() => plugin.getMediaPlayback().clear())} disabled={!playback.itemId} aria-label="Остановить">■</button>
		</div>
		<label><input type="checkbox" checked={playback.manualCombat} onchange={(event) => play(() => plugin.getMediaPlayback().setManualCombat(event.currentTarget.checked))} /> Боевой режим вручную</label>
		<label>Громкость музыки <input type="range" min="0" max="1" step="0.01" value={media.musicVolume} oninput={(event) => change((state) => { state.musicVolume = Number(event.currentTarget.value); })} /></label>
		<label>Громкость эффектов <input type="range" min="0" max="1" step="0.01" value={media.effectsVolume} oninput={(event) => change((state) => { state.effectsVolume = Number(event.currentTarget.value); })} /></label>
	</section>

	<section>
		<h3>Аудиофайлы</h3>
		<div class="row">
			<select aria-label="Файл из хранилища" bind:value={vaultPath}>
				<option value="">Выберите файл</option>
				{#each availableFiles as file (file.path)}<option value={file.path}>{file.path}</option>{/each}
			</select>
			<button onclick={() => { const file = availableFiles.find((item) => item.path === vaultPath); if (file) addAudio(file); vaultPath = ""; }} disabled={!vaultPath}>Добавить</button>
		</div>
		{#each media.audioFiles as audio (audio.id)}
			<div class="asset">
				<input aria-label="Псевдоним аудиофайла" value={audio.alias} onchange={(event) => change((state) => { const target = state.audioFiles.find((item) => item.id === audio.id); if (target) target.alias = event.currentTarget.value.trim() || audio.path.split("/").at(-1) || audio.path; })} />
				<small title={audio.path}>{audio.path}{fileExists(audio.path) ? "" : " · отсутствует"}</small>
				<button aria-label={`Воспроизвести эффект ${audio.alias}`} onclick={() => play(() => plugin.getMediaPlayback().playEffect(audio.id))}>Эффект</button>
				<button aria-label={`Удалить ${audio.alias}`} disabled={media.playlists.some((list) => list.items.some((item) => item.normalAudioId === audio.id || item.combatAudioId === audio.id))} onclick={() => change((state) => { state.audioFiles = state.audioFiles.filter((item) => item.id !== audio.id); })}>×</button>
			</div>
		{/each}
	</section>

	<section>
		<h3>Плейлисты</h3>
		<div class="row"><button onclick={importPlaylist}>Импорт из буфера</button><button onclick={exportPlaylist} disabled={!playlist}>Копировать MD-блок</button></div>
		<div class="row"><input placeholder="Название плейлиста" bind:value={newPlaylistName} /><button onclick={addPlaylist} disabled={!newPlaylistName.trim()}>Создать</button></div>
		<select aria-label="Плейлист" bind:value={playlistId}><option value="">Выберите плейлист</option>{#each media.playlists as list (list.id)}<option value={list.id}>{list.name}</option>{/each}</select>
		{#if playlist}
			<div class="row"><input aria-label="Название плейлиста" value={playlist.name} onchange={(event) => change((state) => { const target = state.playlists.find((item) => item.id === playlist.id); if (target) target.name = event.currentTarget.value.trim() || target.name; })} /><button onclick={() => play(() => plugin.getMediaPlayback().play(playlist.id))} disabled={!playlist.items.length}>▶</button><button onclick={() => removePlaylist(playlist)} aria-label="Удалить плейлист">Удалить</button></div>
			{#each playlist.items as item, index (item.id)}
				<div class="item">
					<div class="row"><strong>{index + 1}.</strong><button onclick={() => play(() => plugin.getMediaPlayback().play(playlist.id, item.id))}>▶</button><button onclick={() => moveItem(item.id, -1)} disabled={index === 0} aria-label="Выше">↑</button><button onclick={() => moveItem(item.id, 1)} disabled={index === playlist.items.length - 1} aria-label="Ниже">↓</button><button onclick={() => change((state) => { const target = state.playlists.find((list) => list.id === playlist.id); if (target) target.items = target.items.filter((entry) => entry.id !== item.id); for (const adventure of state.adventures) for (const scene of adventure.scenes) if (scene.playlistId === playlist.id && scene.itemId === item.id) { scene.playlistId = null; scene.itemId = null; } })} aria-label="Удалить элемент">×</button></div>
					<label>Обычный: <select value={item.normalAudioId} onchange={(event) => change((state) => { const target = state.playlists.find((list) => list.id === playlist.id)?.items.find((entry) => entry.id === item.id); if (target) target.normalAudioId = event.currentTarget.value; })}>{#each media.audioFiles as audio (audio.id)}<option value={audio.id}>{audio.alias}</option>{/each}</select></label>
					<label>Боевой: <select value={item.combatAudioId ?? ""} onchange={(event) => change((state) => { const target = state.playlists.find((list) => list.id === playlist.id)?.items.find((entry) => entry.id === item.id); if (target) target.combatAudioId = event.currentTarget.value || null; })}><option value="">Без боевого файла</option>{#each media.audioFiles as audio (audio.id)}<option value={audio.id}>{audio.alias}</option>{/each}</select></label>
					<label><input type="checkbox" checked={item.loop} onchange={(event) => change((state) => { const target = state.playlists.find((list) => list.id === playlist.id)?.items.find((entry) => entry.id === item.id); if (target) target.loop = event.currentTarget.checked; })} /> Повторять</label>
				</div>
			{/each}
			<div class="row"><select aria-label="Обычный файл" bind:value={normalAudioId}><option value="">Обычный файл</option>{#each media.audioFiles as audio (audio.id)}<option value={audio.id}>{audio.alias}</option>{/each}</select><select aria-label="Боевой файл" bind:value={combatAudioId}><option value="">Боевой файл (необязательно)</option>{#each media.audioFiles as audio (audio.id)}<option value={audio.id}>{audio.alias}</option>{/each}</select><button onclick={addItem} disabled={!normalAudioId}>Добавить элемент</button></div>
		{/if}
	</section>
	<section><h3>Быстрый эффект</h3><div class="row"><select aria-label="Эффект" bind:value={effectAudioId}><option value="">Выберите звук</option>{#each media.audioFiles as audio (audio.id)}<option value={audio.id}>{audio.alias}</option>{/each}</select><button disabled={!effectAudioId} onclick={() => play(() => plugin.getMediaPlayback().playEffect(effectAudioId))}>Запустить</button></div></section>
</div>

<style>
	.media-panel { overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px; height: 100%; box-sizing: border-box; }
	section { display: flex; flex-direction: column; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid var(--background-modifier-border); }
	h2, h3 { margin: 0; }
	h3 { font-size: 14px; }
	.row, .transport, .asset { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
	.row > input, .row > select, .transport > span { flex: 1; min-width: 85px; }
	.asset input { flex: 1; min-width: 100px; }
	.asset small { flex-basis: 100%; overflow-wrap: anywhere; color: var(--text-muted); }
	.item { padding: 6px; border: 1px solid var(--background-modifier-border); border-radius: 5px; display: grid; gap: 6px; }
	.item strong { flex: 1; min-width: 100px; overflow-wrap: anywhere; }
	label { display: flex; align-items: center; gap: 6px; font-size: 12px; }
	label input[type="range"] { flex: 1; }
	button, select, input { font: inherit; }
	button { cursor: pointer; }
</style>
