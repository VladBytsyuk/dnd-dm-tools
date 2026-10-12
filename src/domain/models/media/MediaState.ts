export interface AudioAsset {
	id: string;
	path: string;
	alias: string;
}

export interface PlaylistItem {
	id: string;
	normalAudioId: string;
	combatAudioId: string | null;
	loop: boolean;
}

export interface Playlist {
	id: string;
	name: string;
	items: PlaylistItem[];
}

export interface AdventureScene {
	id: string;
	path: string;
	playlistId: string | null;
	itemId: string | null;
}

export interface SceneLink {
	fromSceneId: string;
	toSceneId: string;
}

export interface Adventure {
	id: string;
	name: string;
	playlistIds: string[];
	scenes: AdventureScene[];
	links: SceneLink[];
}

export interface MediaState {
	audioFiles: AudioAsset[];
	playlists: Playlist[];
	adventures: Adventure[];
	musicVolume: number;
	effectsVolume: number;
	activeAdventureId: string | null;
	activeSceneId: string | null;
}

export function createDefaultMediaState(): MediaState {
	return {
		audioFiles: [], playlists: [], adventures: [],
		musicVolume: 1, effectsVolume: 1,
		activeAdventureId: null, activeSceneId: null,
	};
}

function record(value: unknown): Record<string, unknown> | null {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? value as Record<string, unknown> : null;
}

function nonEmpty(value: unknown): string | null {
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableId(value: unknown): string | null {
	return value === null ? null : nonEmpty(value);
}

function uniqueById<T extends { id: string }>(values: T[]): T[] {
	const seen = new Set<string>();
	return values.filter((entry) => {
		if (seen.has(entry.id)) return false;
		seen.add(entry.id);
		return true;
	});
}

function volume(value: unknown, fallback: number): number {
	return typeof value === "number" && Number.isFinite(value)
		? Math.max(0, Math.min(1, value)) : fallback;
}

/** Normalize saved settings without discarding references to files that are temporarily missing. */
export function loadMediaState(value: unknown): MediaState {
	const source = record(value);
	if (!source) return createDefaultMediaState();

	const audioFiles = uniqueById((Array.isArray(source.audioFiles) ? source.audioFiles : []).flatMap((value): AudioAsset[] => {
		const data = record(value);
		const id = nonEmpty(data?.id);
		const path = nonEmpty(data?.path);
		if (!id || !path) return [];
		return [{ id, path, alias: nonEmpty(data?.alias) ?? path.split("/").pop() ?? path }];
	}));
	const audioIds = new Set(audioFiles.map((audio) => audio.id));
	const playlists = uniqueById((Array.isArray(source.playlists) ? source.playlists : []).flatMap((value): Playlist[] => {
		const data = record(value);
		const id = nonEmpty(data?.id);
		const name = nonEmpty(data?.name);
		if (!id || !name) return [];
		const items = uniqueById((Array.isArray(data?.items) ? data.items : []).flatMap((value): PlaylistItem[] => {
			const item = record(value);
			const itemId = nonEmpty(item?.id);
			const normalAudioId = nonEmpty(item?.normalAudioId);
			if (!itemId || !normalAudioId || !audioIds.has(normalAudioId)) return [];
			const combatId = nullableId(item?.combatAudioId);
			return [{ id: itemId, normalAudioId, combatAudioId: combatId && audioIds.has(combatId) ? combatId : null, loop: item?.loop !== false }];
		}));
		return [{ id, name, items }];
	}));
	const playlistById = new Map(playlists.map((playlist) => [playlist.id, playlist]));
	const adventures = uniqueById((Array.isArray(source.adventures) ? source.adventures : []).flatMap((value): Adventure[] => {
		const data = record(value);
		const id = nonEmpty(data?.id);
		const name = nonEmpty(data?.name);
		if (!id || !name) return [];
		const playlistIds = [...new Set((Array.isArray(data?.playlistIds) ? data.playlistIds : [])
			.filter((value): value is string => typeof value === "string" && playlistById.has(value)))];
		const scenes = uniqueById((Array.isArray(data?.scenes) ? data.scenes : []).flatMap((value): AdventureScene[] => {
			const scene = record(value);
			const sceneId = nonEmpty(scene?.id);
			const path = nonEmpty(scene?.path);
			if (!sceneId || !path) return [];
			const playlistId = nullableId(scene?.playlistId);
			const itemId = nullableId(scene?.itemId);
			const playlist = playlistId && playlistIds.includes(playlistId) ? playlistById.get(playlistId) : undefined;
			const assignmentValid = playlist && itemId && playlist.items.some((item) => item.id === itemId);
			return [{ id: sceneId, path, playlistId: assignmentValid ? playlistId : null, itemId: assignmentValid ? itemId : null }];
		}));
		const sceneIds = new Set(scenes.map((scene) => scene.id));
		const links = (Array.isArray(data?.links) ? data.links : []).flatMap((value): SceneLink[] => {
			const link = record(value);
			const fromSceneId = nonEmpty(link?.fromSceneId);
			const toSceneId = nonEmpty(link?.toSceneId);
			return fromSceneId && toSceneId && sceneIds.has(fromSceneId) && sceneIds.has(toSceneId)
				? [{ fromSceneId, toSceneId }] : [];
		}).filter((link, index, links) => links.findIndex((candidate) =>
			candidate.fromSceneId === link.fromSceneId && candidate.toSceneId === link.toSceneId) === index);
		return [{ id, name, playlistIds, scenes, links }];
	}));
	const activeAdventureId = nullableId(source.activeAdventureId);
	const activeAdventure = adventures.find((adventure) => adventure.id === activeAdventureId);
	const activeSceneId = nullableId(source.activeSceneId);
	return {
		audioFiles, playlists, adventures,
		musicVolume: volume(source.musicVolume, 1),
		effectsVolume: volume(source.effectsVolume, 1),
		activeAdventureId: activeAdventure?.id ?? null,
		activeSceneId: activeAdventure?.scenes.some((scene) => scene.id === activeSceneId) ? activeSceneId : null,
	};
}

export function addAudioAsset(state: MediaState, asset: AudioAsset): MediaState {
	if (!asset.id.trim() || !asset.path.trim() || !asset.alias.trim() || state.audioFiles.some((entry) => entry.id === asset.id)) {
		throw new Error("Некорректный аудиофайл или повторяющийся ID.");
	}
	return { ...state, audioFiles: [...state.audioFiles, asset] };
}

export function renameAudioAsset(state: MediaState, id: string, alias: string): MediaState {
	if (!alias.trim()) throw new Error("Укажите название аудиофайла.");
	return { ...state, audioFiles: state.audioFiles.map((asset) => asset.id === id ? { ...asset, alias: alias.trim() } : asset) };
}

export function updateVaultFilePath(state: MediaState, oldPath: string, newPath: string): MediaState {
	const movedPath = (path: string) => path === oldPath || path.startsWith(`${oldPath}/`)
		? newPath + path.slice(oldPath.length) : path;
	return {
		...state,
		audioFiles: state.audioFiles.map((asset) => ({ ...asset, path: movedPath(asset.path) })),
		adventures: state.adventures.map((adventure) => ({
			...adventure,
			scenes: adventure.scenes.map((scene) => ({ ...scene, path: movedPath(scene.path) })),
		})),
	};
}

export function addPlaylist(state: MediaState, playlist: Playlist): MediaState {
	if (!playlist.name.trim() || state.playlists.some((entry) => entry.id === playlist.id)) throw new Error("Некорректный плейлист.");
	return { ...state, playlists: [...state.playlists, playlist] };
}

export function renamePlaylist(state: MediaState, id: string, name: string): MediaState {
	if (!name.trim()) throw new Error("Укажите название плейлиста.");
	return { ...state, playlists: state.playlists.map((playlist) => playlist.id === id ? { ...playlist, name: name.trim() } : playlist) };
}

export function removePlaylist(state: MediaState, id: string): MediaState {
	return {
		...state,
		playlists: state.playlists.filter((playlist) => playlist.id !== id),
		adventures: state.adventures.map((adventure) => ({
			...adventure,
			playlistIds: adventure.playlistIds.filter((playlistId) => playlistId !== id),
			scenes: adventure.scenes.map((scene) => scene.playlistId === id
				? { ...scene, playlistId: null, itemId: null } : scene),
		})),
	};
}

export function addPlaylistItem(state: MediaState, playlistId: string, item: PlaylistItem): MediaState {
	if (!state.audioFiles.some((audio) => audio.id === item.normalAudioId) ||
		(item.combatAudioId !== null && !state.audioFiles.some((audio) => audio.id === item.combatAudioId))) {
		throw new Error("Аудиофайл элемента не найден.");
	}
	return { ...state, playlists: state.playlists.map((playlist) => {
		if (playlist.id !== playlistId) return playlist;
		if (playlist.items.some((entry) => entry.id === item.id)) throw new Error("Элемент уже существует.");
		return { ...playlist, items: [...playlist.items, item] };
	}) };
}

export function removePlaylistItem(state: MediaState, playlistId: string, itemId: string): MediaState {
	return {
		...state,
		playlists: state.playlists.map((playlist) => playlist.id === playlistId
			? { ...playlist, items: playlist.items.filter((item) => item.id !== itemId) } : playlist),
		adventures: state.adventures.map((adventure) => ({
			...adventure,
			scenes: adventure.scenes.map((scene) => scene.playlistId === playlistId && scene.itemId === itemId
				? { ...scene, playlistId: null, itemId: null } : scene),
		})),
	};
}

export function movePlaylistItem(state: MediaState, playlistId: string, itemId: string, toIndex: number): MediaState {
	return { ...state, playlists: state.playlists.map((playlist) => {
		if (playlist.id !== playlistId) return playlist;
		const fromIndex = playlist.items.findIndex((item) => item.id === itemId);
		if (fromIndex < 0 || toIndex < 0 || toIndex >= playlist.items.length) return playlist;
		const items = [...playlist.items];
		items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
		return { ...playlist, items };
	}) };
}

export function addAdventure(state: MediaState, adventure: Adventure): MediaState {
	if (!adventure.name.trim() || state.adventures.some((entry) => entry.id === adventure.id)) throw new Error("Некорректное приключение.");
	return { ...state, adventures: [...state.adventures, adventure] };
}

export function renameAdventure(state: MediaState, id: string, name: string): MediaState {
	if (!name.trim()) throw new Error("Укажите название приключения.");
	return { ...state, adventures: state.adventures.map((adventure) => adventure.id === id ? { ...adventure, name: name.trim() } : adventure) };
}

export function removeAdventure(state: MediaState, id: string): MediaState {
	return {
		...state,
		adventures: state.adventures.filter((adventure) => adventure.id !== id),
		activeAdventureId: state.activeAdventureId === id ? null : state.activeAdventureId,
		activeSceneId: state.activeAdventureId === id ? null : state.activeSceneId,
	};
}

export function removeAdventureScene(state: MediaState, adventureId: string, sceneId: string): MediaState {
	return {
		...state,
		adventures: state.adventures.map((adventure) => adventure.id === adventureId ? {
			...adventure,
			scenes: adventure.scenes.filter((scene) => scene.id !== sceneId),
			links: adventure.links.filter((link) => link.fromSceneId !== sceneId && link.toSceneId !== sceneId),
		} : adventure),
		activeSceneId: state.activeAdventureId === adventureId && state.activeSceneId === sceneId ? null : state.activeSceneId,
	};
}
