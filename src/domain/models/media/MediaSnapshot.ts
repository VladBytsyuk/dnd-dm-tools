import type { Adventure, AudioAsset, MediaState, Playlist } from "./MediaState";

export interface MediaSnapshotImportResult {
	state: MediaState;
	importedId: string;
	missingPaths: string[];
}

export interface PlaylistSnapshot {
	schemaVersion: 1;
	kind: "playlist";
	playlist: Playlist;
	audioFiles: AudioAsset[];
}

export interface AdventureSnapshot {
	schemaVersion: 1;
	kind: "adventure";
	adventure: Adventure;
	playlists: Playlist[];
	audioFiles: AudioAsset[];
}

function fail(): never {
	throw new Error("Некорректный блок музыки или приключения.");
}

function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) fail();
	return value as Record<string, unknown>;
}

function requiredString(value: unknown): string {
	if (typeof value !== "string" || !value.trim()) fail();
	return value;
}

function optionalString(value: unknown): string | null {
	return value === null ? null : requiredString(value);
}

function array(value: unknown): unknown[] {
	if (!Array.isArray(value)) fail();
	return value;
}

function unique(values: string[]): void {
	if (new Set(values).size !== values.length) fail();
}

function parseAudioFiles(value: unknown): AudioAsset[] {
	const files = array(value).map((raw): AudioAsset => {
		const file = object(raw);
		return { id: requiredString(file.id), path: requiredString(file.path), alias: requiredString(file.alias) };
	});
	unique(files.map((file) => file.id));
	return files;
}

function parsePlaylist(value: unknown, audioIds: Set<string>): Playlist {
	const data = object(value);
	const items = array(data.items).map((raw) => {
		const item = object(raw);
		const normalAudioId = requiredString(item.normalAudioId);
		const combatAudioId = optionalString(item.combatAudioId);
		if (!audioIds.has(normalAudioId) || (combatAudioId && !audioIds.has(combatAudioId)) || typeof item.loop !== "boolean") fail();
		return { id: requiredString(item.id), normalAudioId, combatAudioId, loop: item.loop };
	});
	unique(items.map((item) => item.id));
	return { id: requiredString(data.id), name: requiredString(data.name), items };
}

function parseAdventure(value: unknown, playlists: Playlist[]): Adventure {
	const data = object(value);
	const playlistIds = array(data.playlistIds).map(requiredString);
	unique(playlistIds);
	const playlistById = new Map(playlists.map((playlist) => [playlist.id, playlist]));
	if (playlistIds.length !== playlists.length || playlistIds.some((id) => !playlistById.has(id))) fail();
	const scenes = array(data.scenes).map((raw) => {
		const scene = object(raw);
		const playlistId = optionalString(scene.playlistId);
		const itemId = optionalString(scene.itemId);
		if ((playlistId === null) !== (itemId === null)) fail();
		if (playlistId && (!playlistById.get(playlistId)?.items.some((item) => item.id === itemId))) fail();
		return { id: requiredString(scene.id), path: requiredString(scene.path), playlistId, itemId };
	});
	unique(scenes.map((scene) => scene.id));
	const sceneIds = new Set(scenes.map((scene) => scene.id));
	const links = array(data.links).map((raw) => {
		const link = object(raw);
		const fromSceneId = requiredString(link.fromSceneId);
		const toSceneId = requiredString(link.toSceneId);
		if (!sceneIds.has(fromSceneId) || !sceneIds.has(toSceneId)) fail();
		return { fromSceneId, toSceneId };
	});
	unique(links.map((link) => `${link.fromSceneId}\u0000${link.toSceneId}`));
	return { id: requiredString(data.id), name: requiredString(data.name), playlistIds, scenes, links };
}

export function parseMediaSnapshot(json: string): PlaylistSnapshot | AdventureSnapshot {
	let parsed: unknown;
	try { parsed = JSON.parse(json); } catch { fail(); }
	const data = object(parsed);
	if (data.schemaVersion !== 1) throw new Error("Неподдерживаемая версия блока.");
	const audioFiles = parseAudioFiles(data.audioFiles);
	const audioIds = new Set(audioFiles.map((file) => file.id));
	if (data.kind === "playlist") {
		return { schemaVersion: 1, kind: "playlist", audioFiles, playlist: parsePlaylist(data.playlist, audioIds) };
	}
	if (data.kind === "adventure") {
		const playlists = array(data.playlists).map((playlist) => parsePlaylist(playlist, audioIds));
		unique(playlists.map((playlist) => playlist.id));
		return { schemaVersion: 1, kind: "adventure", audioFiles, playlists, adventure: parseAdventure(data.adventure, playlists) };
	}
	return fail();
}

function referencedAudioFiles(state: MediaState, playlists: Playlist[]): AudioAsset[] {
	const ids = new Set(playlists.flatMap((playlist) => playlist.items.flatMap((item) =>
		item.combatAudioId ? [item.normalAudioId, item.combatAudioId] : [item.normalAudioId])));
	const audioFiles = state.audioFiles.filter((file) => ids.has(file.id));
	if (audioFiles.length !== ids.size) throw new Error("Аудиофайл плейлиста не найден.");
	return audioFiles;
}

/** Returns the JSON body for a `playlist` Markdown code block. */
export function exportPlaylistSnapshot(state: MediaState, playlistId: string): string {
	const playlist = state.playlists.find((entry) => entry.id === playlistId);
	if (!playlist) throw new Error("Плейлист не найден.");
	const snapshot: PlaylistSnapshot = { schemaVersion: 1, kind: "playlist", playlist, audioFiles: referencedAudioFiles(state, [playlist]) };
	return JSON.stringify(snapshot, null, 2);
}

/** Returns the JSON body for an `adventure` Markdown code block. */
export function exportAdventureSnapshot(state: MediaState, adventureId: string): string {
	const adventure = state.adventures.find((entry) => entry.id === adventureId);
	if (!adventure) throw new Error("Приключение не найдено.");
	const playlists = adventure.playlistIds.map((id) => state.playlists.find((entry) => entry.id === id));
	if (playlists.some((playlist) => !playlist)) throw new Error("Плейлист приключения не найден.");
	const completePlaylists = playlists as Playlist[];
	const snapshot: AdventureSnapshot = {
		schemaVersion: 1, kind: "adventure", adventure, playlists: completePlaylists,
		audioFiles: referencedAudioFiles(state, completePlaylists),
	};
	return JSON.stringify(snapshot, null, 2);
}

function importAssets(
	state: MediaState,
	audioFiles: AudioAsset[],
	newId: () => string,
	pathExists: (path: string) => boolean,
	usedIds: Set<string>,
): { files: AudioAsset[]; idMap: Map<string, string>; missingPaths: string[] } {
	const files = [...state.audioFiles];
	const idMap = new Map<string, string>();
	const missingPaths = new Set<string>();
	for (const source of audioFiles) {
		let target = files.find((file) => file.path === source.path);
		if (!target) {
			target = { ...source, id: freshId(newId, usedIds) };
			files.push(target);
		}
		idMap.set(source.id, target.id);
		if (!pathExists(source.path)) missingPaths.add(source.path);
	}
	return { files, idMap, missingPaths: [...missingPaths] };
}

function freshId(newId: () => string, usedIds: Set<string>): string {
	for (let attempt = 0; attempt < 100; attempt++) {
		const id = newId();
		if (id.trim() && !usedIds.has(id)) {
			usedIds.add(id);
			return id;
		}
	}
	throw new Error("Не удалось создать уникальный ID.");
}

function importPlaylists(
	playlists: Playlist[],
	audioIdMap: Map<string, string>,
	newId: () => string,
	usedIds: Set<string>,
): { imported: Playlist[]; playlistIdMap: Map<string, string>; itemIdMap: Map<string, string> } {
	const playlistIdMap = new Map<string, string>();
	const itemIdMap = new Map<string, string>();
	const imported = playlists.map((playlist) => {
		const id = freshId(newId, usedIds);
		playlistIdMap.set(playlist.id, id);
		return {
			id, name: playlist.name,
			items: playlist.items.map((item) => {
				const itemId = freshId(newId, usedIds);
				itemIdMap.set(`${playlist.id}\u0000${item.id}`, itemId);
				return {
					id: itemId,
					normalAudioId: audioIdMap.get(item.normalAudioId)!,
					combatAudioId: item.combatAudioId ? audioIdMap.get(item.combatAudioId)! : null,
					loop: item.loop,
				};
			}),
		};
	});
	return { imported, playlistIdMap, itemIdMap };
}

/** Imports a copy, reusing local audio assets by vault path and preserving their aliases. */
export function importPlaylistSnapshot(
	state: MediaState, json: string, newId: () => string, pathExists: (path: string) => boolean,
): MediaSnapshotImportResult {
	const snapshot = parseMediaSnapshot(json);
	if (snapshot.kind !== "playlist") fail();
	const usedIds = new Set([...state.audioFiles, ...state.playlists, ...state.adventures,
		...state.playlists.flatMap((playlist) => playlist.items),
		...state.adventures.flatMap((adventure) => adventure.scenes)].map((entry) => entry.id));
	const assets = importAssets(state, snapshot.audioFiles, newId, pathExists, usedIds);
	const playlists = importPlaylists([snapshot.playlist], assets.idMap, newId, usedIds);
	return {
		state: { ...state, audioFiles: assets.files, playlists: [...state.playlists, ...playlists.imported] },
		importedId: playlists.imported[0].id, missingPaths: assets.missingPaths,
	};
}

/** Imports a self-contained adventure copy with remapped playlist, item and scene IDs. */
export function importAdventureSnapshot(
	state: MediaState, json: string, newId: () => string, pathExists: (path: string) => boolean,
): MediaSnapshotImportResult {
	const snapshot = parseMediaSnapshot(json);
	if (snapshot.kind !== "adventure") fail();
	const usedIds = new Set([...state.audioFiles, ...state.playlists, ...state.adventures,
		...state.playlists.flatMap((playlist) => playlist.items),
		...state.adventures.flatMap((adventure) => adventure.scenes)].map((entry) => entry.id));
	const assets = importAssets(state, snapshot.audioFiles, newId, pathExists, usedIds);
	const playlists = importPlaylists(snapshot.playlists, assets.idMap, newId, usedIds);
	const sceneIdMap = new Map<string, string>();
	const scenes = snapshot.adventure.scenes.map((scene) => {
		const id = freshId(newId, usedIds);
		sceneIdMap.set(scene.id, id);
		return {
			id, path: scene.path,
			playlistId: scene.playlistId ? playlists.playlistIdMap.get(scene.playlistId)! : null,
			itemId: scene.playlistId && scene.itemId ? playlists.itemIdMap.get(`${scene.playlistId}\u0000${scene.itemId}`)! : null,
		};
	});
	const adventure: Adventure = {
		id: freshId(newId, usedIds), name: snapshot.adventure.name,
		playlistIds: snapshot.adventure.playlistIds.map((id) => playlists.playlistIdMap.get(id)!),
		scenes,
		links: snapshot.adventure.links.map((link) => ({
			fromSceneId: sceneIdMap.get(link.fromSceneId)!, toSceneId: sceneIdMap.get(link.toSceneId)!,
		})),
	};
	const missingPaths = new Set(assets.missingPaths);
	for (const scene of scenes) if (!pathExists(scene.path)) missingPaths.add(scene.path);
	return {
		state: {
			...state, audioFiles: assets.files,
			playlists: [...state.playlists, ...playlists.imported],
			adventures: [...state.adventures, adventure],
		},
		importedId: adventure.id, missingPaths: [...missingPaths],
	};
}
