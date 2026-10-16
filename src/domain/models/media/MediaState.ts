import { EmptySource, type Source } from "../common/Source";

export interface AudioAsset { id: string; path: string; alias: string }
export interface MediaTrack {
	id: string; name: string; url: string; atmosphere: string; source?: Source;
	normalAudioId: string | null; combatAudioId: string | null; loop: boolean;
}
export interface PlaylistItem { id: string; trackId: string }
export interface Playlist {
	id: string; name: string; url: string; atmosphere: string; source?: Source;
	items: PlaylistItem[];
}
export interface AdventureScene {
	id: string; name: string; url: string; source?: Source; notePath: string | null;
	trackId: string | null; position: { x: number; y: number };
}
export type SceneSide = "left" | "right" | "top" | "bottom";
export interface SceneLink {
	id: string; fromSceneId: string; toSceneId: string;
	fromSide?: SceneSide; toSide?: SceneSide;
}
export interface Adventure {
	id: string; name: string; url: string; campaignName: string; source?: Source;
	notePath: string | null; playlistId: string | null;
	scenes: AdventureScene[]; links: SceneLink[];
}
export interface MediaState {
	audioFiles: AudioAsset[]; tracks: MediaTrack[]; playlists: Playlist[]; adventures: Adventure[];
	musicVolume: number; effectsVolume: number;
	activeAdventureId: string | null; activeSceneId: string | null;
}

const asRecord = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const asString = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null;
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const asNumber = (value: unknown, fallback: number): number => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const basename = (path: string) => path.split("/").pop()?.replace(/\.md$/i, "") || path;
function distinct<T extends { id: string }>(entries: T[]): T[] {
	const seen = new Set<string>();
	return entries.filter((entry) => !seen.has(entry.id) && !!seen.add(entry.id));
}
function validSource(value: unknown): Source | undefined {
	const candidate = asRecord(value), group = asRecord(candidate?.group);
	if (!candidate || !group || typeof candidate.shortName !== "string" || typeof candidate.name !== "string" ||
		typeof group.name !== "string" || typeof group.shortName !== "string") return undefined;
	return { shortName: candidate.shortName, name: candidate.name,
		group: { name: group.name, shortName: group.shortName },
		...(typeof candidate.homebrew === "boolean" ? { homebrew: candidate.homebrew } : {}) };
}
function idOrUuid(id?: string): string { return id || crypto.randomUUID(); }
function urlFor(kind: string, id: string): string { return `/${kind}/${encodeURIComponent(id)}`; }

export function createMediaTrack(name = "Трек", id?: string): MediaTrack {
	const key = idOrUuid(id);
	return { id: key, name, url: urlFor("track", key), atmosphere: "", source: EmptySource(), normalAudioId: null, combatAudioId: null, loop: true };
}
export function createMediaPlaylist(name = "Плейлист", id?: string): Playlist {
	const key = idOrUuid(id);
	return { id: key, name, url: urlFor("playlist", key), atmosphere: "", source: EmptySource(), items: [] };
}
export function createMediaAdventure(name = "Приключение", id?: string): Adventure {
	const key = idOrUuid(id);
	return { id: key, name, url: urlFor("adventure", key), campaignName: "", source: EmptySource(), notePath: null, playlistId: null, scenes: [], links: [] };
}
export function createMediaScene(name = "Сцена", id?: string): AdventureScene {
	const key = idOrUuid(id);
	return { id: key, name, url: urlFor("scene", key), source: EmptySource(), notePath: null, trackId: null, position: { x: 0, y: 0 } };
}
export function createDefaultMediaState(): MediaState {
	return { audioFiles: [], tracks: [], playlists: [], adventures: [], musicVolume: 1, effectsVolume: 1,
		activeAdventureId: null, activeSceneId: null };
}

function loadAudioFiles(value: unknown): AudioAsset[] {
	return distinct(asArray(value).flatMap((raw): AudioAsset[] => {
		const item = asRecord(raw), id = asString(item?.id), path = asString(item?.path);
		return id && path ? [{ id, path, alias: asString(item?.alias) ?? basename(path) }] : [];
	}));
}
function loadTracks(value: unknown, audioIds: Set<string>): MediaTrack[] {
	return distinct(asArray(value).flatMap((raw): MediaTrack[] => {
		const item = asRecord(raw), id = asString(item?.id);
		if (!id) return [];
		const track = createMediaTrack(asString(item?.name) ?? "Трек", id);
		const normal = asString(item?.normalAudioId), combat = asString(item?.combatAudioId);
		return [{ ...track, url: asString(item?.url) ?? track.url,
			atmosphere: typeof item?.atmosphere === "string" ? item.atmosphere : "", source: validSource(item?.source) ?? EmptySource(),
			normalAudioId: normal && audioIds.has(normal) ? normal : null,
			combatAudioId: combat && audioIds.has(combat) ? combat : null, loop: item?.loop !== false }];
	}));
}
function loadPlaylists(value: unknown, trackIds: Set<string>): Playlist[] {
	return distinct(asArray(value).flatMap((raw): Playlist[] => {
		const item = asRecord(raw), id = asString(item?.id);
		if (!id) return [];
		const playlist = createMediaPlaylist(asString(item?.name) ?? "Плейлист", id);
		playlist.items = distinct(asArray(item?.items).flatMap((rawItem): PlaylistItem[] => {
			const entry = asRecord(rawItem), entryId = asString(entry?.id), trackId = asString(entry?.trackId);
			return entryId && trackId && trackIds.has(trackId) ? [{ id: entryId, trackId }] : [];
		}));
		return [{ ...playlist, url: asString(item?.url) ?? playlist.url,
			atmosphere: typeof item?.atmosphere === "string" ? item.atmosphere : "", source: validSource(item?.source) ?? EmptySource() }];
	}));
}
function loadAdventures(value: unknown, playlistIds: Set<string>, trackIds: Set<string>): Adventure[] {
	return distinct(asArray(value).flatMap((raw): Adventure[] => {
		const item = asRecord(raw), id = asString(item?.id);
		if (!id) return [];
		const adventure = createMediaAdventure(asString(item?.name) ?? "Приключение", id);
		const playlistId = asString(item?.playlistId);
		adventure.scenes = distinct(asArray(item?.scenes).flatMap((rawScene): AdventureScene[] => {
			const entry = asRecord(rawScene), sceneId = asString(entry?.id);
			if (!sceneId) return [];
			const scene = createMediaScene(asString(entry?.name) ?? "Сцена", sceneId);
			const trackId = asString(entry?.trackId), position = asRecord(entry?.position);
			return [{ ...scene, url: asString(entry?.url) ?? scene.url,
				source: validSource(entry?.source) ?? EmptySource(), notePath: asString(entry?.notePath),
				trackId: trackId && trackIds.has(trackId) ? trackId : null,
				position: { x: asNumber(position?.x, 0), y: asNumber(position?.y, 0) } }];
		}));
		const sceneIds = new Set(adventure.scenes.map((scene) => scene.id));
		const side = (value: unknown): SceneSide | undefined => value === "left" || value === "right" || value === "top" || value === "bottom" ? value : undefined;
		adventure.links = distinct(asArray(item?.links).flatMap((rawLink, index): SceneLink[] => {
			const link = asRecord(rawLink), fromSceneId = asString(link?.fromSceneId), toSceneId = asString(link?.toSceneId);
			return fromSceneId && toSceneId && sceneIds.has(fromSceneId) && sceneIds.has(toSceneId)
				? [{ id: asString(link?.id) ?? `legacy-link-${id}-${index}`, fromSceneId, toSceneId,
					fromSide: side(link?.fromSide), toSide: side(link?.toSide) }] : [];
		}));
		return [{ ...adventure, url: asString(item?.url) ?? adventure.url,
			campaignName: typeof item?.campaignName === "string" ? item.campaignName : "",
			source: validSource(item?.source) ?? EmptySource(), notePath: asString(item?.notePath),
			playlistId: playlistId && playlistIds.has(playlistId) ? playlistId : null }];
	}));
}
function finishState(raw: Record<string, unknown>, audioFiles: AudioAsset[], tracks: MediaTrack[], playlists: Playlist[], adventures: Adventure[]): MediaState {
	const activeAdventure = adventures.find((adventure) => adventure.id === asString(raw.activeAdventureId));
	return { audioFiles, tracks, playlists, adventures,
		musicVolume: Math.max(0, Math.min(1, asNumber(raw.musicVolume, 1))),
		effectsVolume: Math.max(0, Math.min(1, asNumber(raw.effectsVolume, 1))),
		activeAdventureId: activeAdventure?.id ?? null,
		activeSceneId: activeAdventure?.scenes.find((scene) => scene.id === asString(raw.activeSceneId))?.id ?? null };
}

/** Deterministic v5 migration: one reusable track per playlist entry plus orphan audio tracks. */
export function migrateLegacyMediaState(value: unknown): MediaState {
	const raw = asRecord(value);
	if (!raw) return createDefaultMediaState();
	const audioFiles = loadAudioFiles(raw.audioFiles), audioById = new Map(audioFiles.map((audio) => [audio.id, audio]));
	const tracks: MediaTrack[] = [], itemToTrack = new Map<string, string>();
	const playlists = distinct(asArray(raw.playlists).flatMap((candidate): Playlist[] => {
		const old = asRecord(candidate), id = asString(old?.id);
		if (!id) return [];
		const playlist = createMediaPlaylist(asString(old?.name) ?? "Плейлист", id);
		playlist.items = distinct(asArray(old?.items).flatMap((candidateItem): PlaylistItem[] => {
			const item = asRecord(candidateItem), itemId = asString(item?.id), audioId = asString(item?.normalAudioId);
			if (!itemId || !audioId || !audioById.has(audioId)) return [];
			const trackId = `legacy-track-${id}-${itemId}`, track = createMediaTrack(audioById.get(audioId)!.alias, trackId);
			track.normalAudioId = audioId;
			const combat = asString(item?.combatAudioId);
			track.combatAudioId = combat && audioById.has(combat) ? combat : null;
			track.loop = item?.loop !== false;
			tracks.push(track);
			itemToTrack.set(`${id}\u0000${itemId}`, trackId);
			return [{ id: itemId, trackId }];
		}));
		return [playlist];
	}));
	const usedAudioIds = new Set(tracks.flatMap((track) => [track.normalAudioId, track.combatAudioId]));
	for (const audio of audioFiles) if (!usedAudioIds.has(audio.id)) {
		const track = createMediaTrack(audio.alias, `legacy-audio-${audio.id}`);
		track.normalAudioId = audio.id;
		tracks.push(track);
	}
	const playlistById = new Map(playlists.map((playlist) => [playlist.id, playlist]));
	const adventures = distinct(asArray(raw.adventures).flatMap((candidate): Adventure[] => {
		const old = asRecord(candidate), id = asString(old?.id);
		if (!id) return [];
		const adventure = createMediaAdventure(asString(old?.name) ?? "Приключение", id);
		adventure.playlistId = asArray(old?.playlistIds).find((entry): entry is string => typeof entry === "string" && playlistById.has(entry)) ?? null;
		adventure.scenes = distinct(asArray(old?.scenes).flatMap((candidateScene, index): AdventureScene[] => {
			const oldScene = asRecord(candidateScene), sceneId = asString(oldScene?.id), path = asString(oldScene?.path);
			if (!sceneId || !path) return [];
			const scene = createMediaScene(basename(path), sceneId);
			scene.notePath = path;
			scene.position = { x: (index % 4) * 240, y: Math.floor(index / 4) * 140 };
			const oldPlaylistId = asString(oldScene?.playlistId), oldItemId = asString(oldScene?.itemId);
			scene.trackId = oldPlaylistId && oldItemId ? itemToTrack.get(`${oldPlaylistId}\u0000${oldItemId}`) ?? null : null;
			return [scene];
		}));
		const sceneIds = new Set(adventure.scenes.map((scene) => scene.id));
		adventure.links = asArray(old?.links).flatMap((candidateLink, index): SceneLink[] => {
			const link = asRecord(candidateLink), fromSceneId = asString(link?.fromSceneId), toSceneId = asString(link?.toSceneId);
			return fromSceneId && toSceneId && sceneIds.has(fromSceneId) && sceneIds.has(toSceneId)
				? [{ id: `legacy-link-${id}-${index}`, fromSceneId, toSceneId, fromSide: "right", toSide: "left" }] : [];
		});
		return [adventure];
	}));
	return finishState(raw, audioFiles, distinct(tracks), playlists, adventures);
}

export function loadMediaState(value: unknown): MediaState {
	const raw = asRecord(value);
	if (!raw) return createDefaultMediaState();
	if (!Array.isArray(raw.tracks)) return migrateLegacyMediaState(value);
	const audioFiles = loadAudioFiles(raw.audioFiles), audioIds = new Set(audioFiles.map((audio) => audio.id));
	const tracks = loadTracks(raw.tracks, audioIds), trackIds = new Set(tracks.map((track) => track.id));
	const playlists = loadPlaylists(raw.playlists, trackIds), playlistIds = new Set(playlists.map((playlist) => playlist.id));
	const adventures = loadAdventures(raw.adventures, playlistIds, trackIds);
	return finishState(raw, audioFiles, tracks, playlists, adventures);
}

export function addAudioAsset(state: MediaState, asset: AudioAsset): MediaState {
	if (!asset.id.trim() || !asset.path.trim() || !asset.alias.trim() || state.audioFiles.some((entry) => entry.id === asset.id)) throw new Error("Некорректный аудиофайл или повторяющийся ID.");
	return { ...state, audioFiles: [...state.audioFiles, asset] };
}
export function renameAudioAsset(state: MediaState, id: string, alias: string): MediaState {
	if (!alias.trim()) throw new Error("Укажите название аудиофайла.");
	return { ...state, audioFiles: state.audioFiles.map((asset) => asset.id === id ? { ...asset, alias: alias.trim() } : asset) };
}
export function updateVaultFilePath(state: MediaState, oldPath: string, newPath: string): MediaState {
	const moved = (path: string) => path === oldPath || path.startsWith(`${oldPath}/`) ? newPath + path.slice(oldPath.length) : path;
	return { ...state, audioFiles: state.audioFiles.map((asset) => ({ ...asset, path: moved(asset.path) })),
		adventures: state.adventures.map((adventure) => ({ ...adventure,
			notePath: adventure.notePath ? moved(adventure.notePath) : null,
			scenes: adventure.scenes.map((scene) => ({ ...scene, notePath: scene.notePath ? moved(scene.notePath) : null })) })) };
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
	return { ...state, playlists: state.playlists.filter((playlist) => playlist.id !== id),
		adventures: state.adventures.map((adventure) => ({ ...adventure, playlistId: adventure.playlistId === id ? null : adventure.playlistId })) };
}
export function addPlaylistItem(state: MediaState, playlistId: string, item: PlaylistItem): MediaState {
	if (!state.tracks.some((track) => track.id === item.trackId)) throw new Error("Трек элемента не найден.");
	return { ...state, playlists: state.playlists.map((playlist) => {
		if (playlist.id !== playlistId) return playlist;
		if (playlist.items.some((entry) => entry.id === item.id)) throw new Error("Элемент уже существует.");
		return { ...playlist, items: [...playlist.items, item] };
	}) };
}
export function removePlaylistItem(state: MediaState, playlistId: string, itemId: string): MediaState {
	return { ...state, playlists: state.playlists.map((playlist) => playlist.id === playlistId
		? { ...playlist, items: playlist.items.filter((item) => item.id !== itemId) } : playlist) };
}
export function movePlaylistItem(state: MediaState, playlistId: string, itemId: string, toIndex: number): MediaState {
	return { ...state, playlists: state.playlists.map((playlist) => {
		if (playlist.id !== playlistId) return playlist;
		const from = playlist.items.findIndex((item) => item.id === itemId);
		if (from < 0 || toIndex < 0 || toIndex >= playlist.items.length) return playlist;
		const items = [...playlist.items]; items.splice(toIndex, 0, items.splice(from, 1)[0]);
		return { ...playlist, items };
	}) };
}
export function removeMediaTrack(state: MediaState, id: string): MediaState {
	return { ...state, tracks: state.tracks.filter((track) => track.id !== id),
		playlists: state.playlists.map((playlist) => ({ ...playlist, items: playlist.items.filter((item) => item.trackId !== id) })),
		adventures: state.adventures.map((adventure) => ({ ...adventure,
			scenes: adventure.scenes.map((scene) => scene.trackId === id ? { ...scene, trackId: null } : scene) })) };
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
	return { ...state, adventures: state.adventures.filter((adventure) => adventure.id !== id),
		activeAdventureId: state.activeAdventureId === id ? null : state.activeAdventureId,
		activeSceneId: state.activeAdventureId === id ? null : state.activeSceneId };
}
export function removeAdventureScene(state: MediaState, adventureId: string, sceneId: string): MediaState {
	return { ...state, adventures: state.adventures.map((adventure) => adventure.id === adventureId ? { ...adventure,
		scenes: adventure.scenes.filter((scene) => scene.id !== sceneId),
		links: adventure.links.filter((link) => link.fromSceneId !== sceneId && link.toSceneId !== sceneId) } : adventure),
		activeSceneId: state.activeAdventureId === adventureId && state.activeSceneId === sceneId ? null : state.activeSceneId };
}
