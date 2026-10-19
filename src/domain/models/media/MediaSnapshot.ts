import { createMediaAdventure, loadMediaState, type Adventure, type AdventureScene, type AudioAsset, type MediaState, type MediaTrack, type Playlist } from "./MediaState";
import type { MediaRoute } from "./MediaLibrary";

export interface MediaSnapshotImportResult { state: MediaState; importedId: string; missingPaths: string[] }
export interface PlaylistSnapshot { schemaVersion: 2; kind: "playlist"; playlist: Playlist; tracks: MediaTrack[]; audioFiles: AudioAsset[] }
export interface AdventureSnapshot { schemaVersion: 2; kind: "adventure"; adventure: Adventure; playlists: Playlist[]; tracks: MediaTrack[]; audioFiles: AudioAsset[] }
export interface TrackSnapshot { schemaVersion: 2; kind: "track"; track: MediaTrack; audioFiles: AudioAsset[] }
export interface SceneSnapshot { schemaVersion: 2; kind: "scene"; scene: AdventureScene; adventure: (Pick<Adventure, "id" | "name" | "url"> & { campaignName?: string }) | null; tracks: MediaTrack[]; audioFiles: AudioAsset[] }
export type MediaSnapshot = PlaylistSnapshot | AdventureSnapshot | TrackSnapshot | SceneSnapshot;
const fail = (): never => { throw new Error("Некорректный блок музыки или приключения."); };
function object(value: unknown): Record<string, any> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : fail(); }
function array(value: unknown): any[] { return Array.isArray(value) ? value : fail(); }
function text(value: unknown): string { return typeof value === "string" && value.trim() ? value : fail(); }
function unique(values: string[]): void { if (new Set(values).size !== values.length) fail(); }

export function parseMediaSnapshot(json: string): MediaSnapshot {
	let parsed: unknown;
	try { parsed = JSON.parse(json); } catch { return fail(); }
	const data = object(parsed);
	if (data.schemaVersion !== 1 && data.schemaVersion !== 2) throw new Error("Неподдерживаемая версия блока.");
	if (data.kind !== "playlist" && data.kind !== "adventure" && data.kind !== "track" && data.kind !== "scene") return fail();
	if (data.schemaVersion === 1 && data.kind !== "playlist" && data.kind !== "adventure") return fail();
	const files = array(data.audioFiles);
	files.forEach((value) => { const file = object(value); text(file.id); text(file.path); text(file.alias); });
	unique(files.map((file) => file.id));
	const playlists = data.kind === "playlist" ? [object(data.playlist)] : data.kind === "adventure" ? array(data.playlists) : [];
	const tracks = data.schemaVersion === 2 ? data.kind === "track" ? [object(data.track)] : array(data.tracks) : [];
	const trackIds = new Set(tracks.map((track) => text(object(track).id)));
	const audioIds = new Set(files.map((file) => file.id));
	if (data.schemaVersion === 2) {
		unique(tracks.map((track) => track.id));
		for (const value of tracks) {
			const track = object(value); text(track.name); text(track.url);
			if (typeof track.loop !== "boolean") fail();
			for (const id of [track.normalAudioId, track.combatAudioId]) if (id !== null && !audioIds.has(id)) fail();
		}
	}
	unique(playlists.map((list) => text(object(list).id)));
	for (const list of playlists) {
		text(list.name); unique(array(list.items).map((item) => text(object(item).id)));
		for (const item of list.items) {
			if (data.schemaVersion === 2) { if (!trackIds.has(item.trackId)) fail(); }
			else if (!audioIds.has(item.normalAudioId) || (item.combatAudioId !== null && !audioIds.has(item.combatAudioId)) || typeof item.loop !== "boolean") fail();
		}
	}
	const adventures = data.kind === "adventure" ? [object(data.adventure)] : [];
	const standaloneScenes = data.kind === "scene" && data.adventure === null ? [object(data.scene)] : [];
	function validateScene(value: unknown) {
		const scene = object(value);
		text(scene.id); text(scene.name); text(scene.url);
		if (scene.notePath !== null) text(scene.notePath);
		if (scene.trackId !== null && !trackIds.has(scene.trackId)) fail();
		const pos = object(scene.position); if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) fail();
	}
	standaloneScenes.forEach(validateScene);
	if (data.kind === "scene" && data.adventure !== null) {
		const parent = object(data.adventure);
		text(parent.url);
		adventures.push({ ...createMediaAdventure(text(parent.name), text(parent.id)), url: parent.url, campaignName: typeof parent.campaignName === "string" ? parent.campaignName : "", scenes: [object(data.scene)] });
	}
	for (const adventure of adventures) {
		text(adventure.id); text(adventure.name);
		const playlistIds = new Set(playlists.map((list) => list.id));
		if (data.schemaVersion === 1) { if (array(adventure.playlistIds).some((id) => !playlistIds.has(id))) fail(); }
		else if (adventure.playlistId !== null && !playlistIds.has(adventure.playlistId)) fail();
		const scenes = array(adventure.scenes), sceneIds = new Set(scenes.map((scene) => text(object(scene).id)));
		unique(scenes.map((scene) => scene.id));
		for (const scene of scenes) {
			if (data.schemaVersion === 1) {
				text(scene.path);
				if ((scene.playlistId === null) !== (scene.itemId === null)) fail();
				if (scene.playlistId && !playlists.find((list) => list.id === scene.playlistId)?.items.some((item: any) => item.id === scene.itemId)) fail();
			} else validateScene(scene);
		}
		const links = array(adventure.links);
		for (const link of links) if (!sceneIds.has(link.fromSceneId) || !sceneIds.has(link.toSceneId)) fail();
		if (data.schemaVersion === 2) unique(links.map((link) => text(link.id)));
	}
	const state = loadMediaState({ audioFiles: files, ...(data.schemaVersion === 2 ? { tracks } : {}), playlists, adventures, standaloneScenes });
	if (data.kind === "track") return { schemaVersion: 2, kind: "track", track: state.tracks[0], audioFiles: state.audioFiles };
	if (data.kind === "scene") {
		const parent = state.adventures[0];
		return { schemaVersion: 2, kind: "scene", scene: parent?.scenes[0] ?? state.standaloneScenes[0], adventure: parent ? { id: parent.id, name: parent.name, url: parent.url, campaignName: parent.campaignName } : null, tracks: state.tracks, audioFiles: state.audioFiles };
	}
	return data.kind === "playlist" ? { schemaVersion: 2, kind: "playlist", playlist: state.playlists[0], tracks: state.tracks, audioFiles: state.audioFiles }
		: { schemaVersion: 2, kind: "adventure", adventure: state.adventures[0], playlists: state.playlists, tracks: state.tracks, audioFiles: state.audioFiles };
}

function dependencies(state: MediaState, playlists: Playlist[], sceneTrackIds: Array<string | null> = []) {
	const ids = new Set([...playlists.flatMap((playlist) => playlist.items.map((item) => item.trackId)), ...sceneTrackIds.filter((id): id is string => !!id)]);
	const tracks = state.tracks.filter((track) => ids.has(track.id));
	if (tracks.length !== ids.size) throw new Error("Трек не найден.");
	const audioIds = new Set(tracks.flatMap((track) => [track.normalAudioId, track.combatAudioId]).filter((id): id is string => !!id));
	const audioFiles = state.audioFiles.filter((file) => audioIds.has(file.id));
	if (audioFiles.length !== audioIds.size) throw new Error("Аудиофайл не найден.");
	return { tracks, audioFiles };
}
export function exportPlaylistSnapshot(state: MediaState, id: string): string {
	const playlist = state.playlists.find((entry) => entry.id === id);
	if (!playlist) throw new Error("Плейлист не найден.");
	return JSON.stringify({ schemaVersion: 2, kind: "playlist", playlist, ...dependencies(state, [playlist]) }, null, 2);
}
export function exportAdventureSnapshot(state: MediaState, id: string): string {
	const adventure = state.adventures.find((entry) => entry.id === id);
	if (!adventure) throw new Error("Приключение не найдено.");
	const playlists = state.playlists.filter((playlist) => playlist.id === adventure.playlistId);
	return JSON.stringify({ schemaVersion: 2, kind: "adventure", adventure, playlists, ...dependencies(state, playlists, adventure.scenes.map((scene) => scene.trackId)) }, null, 2);
}
export function exportTrackSnapshot(state: MediaState, id: string): string {
	const track = state.tracks.find((entry) => entry.id === id);
	if (!track) throw new Error("Трек не найден.");
	return JSON.stringify({ schemaVersion: 2, kind: "track", track, audioFiles: dependencies(state, [], [id]).audioFiles }, null, 2);
}
export function exportSceneSnapshot(state: MediaState, id: string): string {
	const parent = state.adventures.find((entry) => entry.scenes.some((scene) => scene.id === id));
	const scene = parent?.scenes.find((entry) => entry.id === id) ?? state.standaloneScenes.find((entry) => entry.id === id);
	if (!scene) throw new Error("Сцена не найдена.");
	return JSON.stringify({ schemaVersion: 2, kind: "scene", scene, adventure: parent ? { id: parent.id, name: parent.name, url: parent.url, campaignName: parent.campaignName } : null, ...dependencies(state, [], [scene.trackId]) }, null, 2);
}
export function exportMediaMarkdownBlock(state: MediaState, route: MediaRoute): string {
	const exporters = { track: exportTrackSnapshot, playlist: exportPlaylistSnapshot, scene: exportSceneSnapshot, adventure: exportAdventureSnapshot };
	return `\`\`\`${route.kind}\n${exporters[route.kind](state, route.id)}\n\`\`\``;
}

export function mediaSnapshotState(snapshot: MediaSnapshot): { media: MediaState; route: MediaRoute } {
	const tracks = snapshot.kind === "track" ? [snapshot.track] : snapshot.tracks;
	const playlists = snapshot.kind === "playlist" ? [snapshot.playlist] : snapshot.kind === "adventure" ? snapshot.playlists : [];
	const adventures = snapshot.kind === "adventure" ? [snapshot.adventure] : snapshot.kind === "scene" && snapshot.adventure ? [{ ...createMediaAdventure(snapshot.adventure.name, snapshot.adventure.id), ...snapshot.adventure, scenes: [snapshot.scene] }] : [];
	const standaloneScenes = snapshot.kind === "scene" && !snapshot.adventure ? [snapshot.scene] : [];
	const id = snapshot.kind === "track" ? snapshot.track.id : snapshot.kind === "playlist" ? snapshot.playlist.id : snapshot.kind === "scene" ? snapshot.scene.id : snapshot.adventure.id;
	return { media: loadMediaState({ audioFiles: snapshot.audioFiles, tracks, playlists, adventures, standaloneScenes }), route: { kind: snapshot.kind, id } };
}
function importSnapshot(state: MediaState, snapshot: PlaylistSnapshot | AdventureSnapshot, newId: () => string, pathExists: (path: string) => boolean): MediaSnapshotImportResult {
	const next = structuredClone(state);
	const usedIds = new Set([...next.audioFiles, ...next.tracks, ...next.playlists, ...next.playlists.flatMap((list) => list.items), ...next.adventures, ...next.standaloneScenes, ...next.adventures.flatMap((adventure) => [...adventure.scenes, ...adventure.links])].map((item) => item.id));
	function fresh(): string { for (let i = 0; i < 100; i++) { const id = newId(); if (id.trim() && !usedIds.has(id)) { usedIds.add(id); return id; } } throw new Error("Не удалось создать уникальный ID."); }
	const urls = new Set([...next.tracks, ...next.playlists, ...next.adventures, ...next.standaloneScenes, ...next.adventures.flatMap((adventure) => adventure.scenes)].map((record) => record.url));
	function copyUrl(url: string, kind: string, id: string): string { const value = urls.has(url) ? `/${kind}/${encodeURIComponent(id)}` : url; urls.add(value); return value; }
	const missing = new Set<string>();
	const audioMap = new Map<string, string>();
	for (const file of snapshot.audioFiles) {
		let target = next.audioFiles.find((entry) => entry.path === file.path);
		if (!target) { target = { ...file, id: fresh() }; next.audioFiles.push(target); }
		audioMap.set(file.id, target.id); if (!pathExists(file.path)) missing.add(file.path);
	}
	const trackMap = new Map<string, string>();
	for (const track of snapshot.tracks) {
		const id = fresh(); trackMap.set(track.id, id);
		next.tracks.push({ ...track, id, url: copyUrl(track.url, "track", id), normalAudioId: track.normalAudioId ? audioMap.get(track.normalAudioId)! : null, combatAudioId: track.combatAudioId ? audioMap.get(track.combatAudioId)! : null });
	}
	const playlistMap = new Map<string, string>();
	for (const playlist of snapshot.kind === "playlist" ? [snapshot.playlist] : snapshot.playlists) {
		const id = fresh(); playlistMap.set(playlist.id, id);
		next.playlists.push({ ...playlist, id, url: copyUrl(playlist.url, "playlist", id), items: playlist.items.map((item) => ({ id: fresh(), trackId: trackMap.get(item.trackId)! })) });
	}
	let importedId: string;
	if (snapshot.kind === "adventure") {
		const source = snapshot.adventure, id = fresh(), sceneMap = new Map<string, string>();
		const scenes = source.scenes.map((scene) => { const id = fresh(); sceneMap.set(scene.id, id); if (scene.notePath && !pathExists(scene.notePath)) missing.add(scene.notePath); return { ...scene, id, url: copyUrl(scene.url, "scene", id), trackId: scene.trackId ? trackMap.get(scene.trackId)! : null }; });
		if (source.notePath && !pathExists(source.notePath)) missing.add(source.notePath);
		next.adventures.push({ ...source, id, url: copyUrl(source.url, "adventure", id), playlistId: source.playlistId ? playlistMap.get(source.playlistId)! : null, scenes, links: source.links.map((link) => ({ ...link, id: fresh(), fromSceneId: sceneMap.get(link.fromSceneId)!, toSceneId: sceneMap.get(link.toSceneId)! })) });
		importedId = id;
	} else importedId = playlistMap.get(snapshot.playlist.id)!;
	return { state: next, importedId, missingPaths: [...missing] };
}
export function importPlaylistSnapshot(state: MediaState, json: string, newId: () => string, pathExists: (path: string) => boolean): MediaSnapshotImportResult {
	const snapshot = parseMediaSnapshot(json); if (snapshot.kind !== "playlist") return fail();
	return importSnapshot(state, snapshot, newId, pathExists);
}
export function importAdventureSnapshot(state: MediaState, json: string, newId: () => string, pathExists: (path: string) => boolean): MediaSnapshotImportResult {
	const snapshot = parseMediaSnapshot(json); if (snapshot.kind !== "adventure") return fail();
	return importSnapshot(state, snapshot, newId, pathExists);
}
