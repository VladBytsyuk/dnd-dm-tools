import type { BaseItem } from "../common/BaseItem";
import type { PanelKey } from "../assistant/AssistantWorkspace";
import type { Adventure, AdventureScene, MediaScene, MediaState, MediaTrack, Playlist } from "./MediaState";

export type MediaKind = "track" | "playlist" | "adventure" | "scene";
export type MediaRoute = { kind: MediaKind; id: string; adventureId?: string };
export type MediaRecord = MediaTrack | Playlist | Adventure | MediaScene;
export type MediaItem = BaseItem & { mediaRoute: MediaRoute; record: MediaRecord; adventures?: Adventure[] };

export function mediaItems(state: MediaState): MediaItem[] {
	const item = (kind: MediaKind, record: MediaRecord): MediaItem => ({
		name: { rus: record.name, eng: "" }, url: record.url, origin: "manual", record,
		adventures: kind === "scene" ? state.adventures.filter((adventure) => adventure.scenes.some((scene) => scene.id === record.id)) : undefined,
		mediaRoute: { kind, id: record.id },
	});
	return [
		...state.playlists.map((record) => item("playlist", record)),
		...state.tracks.map((record) => item("track", record)),
		...state.scenes.map((record) => item("scene", record)),
		...state.adventures.map((record) => item("adventure", record)),
	];
}

export function mediaCampaignName(item: MediaItem): string {
	return "campaignName" in item.record ? item.record.campaignName : "";
}

export function mediaPanel(kind: MediaKind): PanelKey { return kind === "track" || kind === "playlist" ? "player" : "adventures"; }

export function findMediaItem(state: MediaState, route: MediaRoute): MediaItem | undefined {
	return mediaItems(state).find((item) => item.mediaRoute.kind === route.kind && item.mediaRoute.id === route.id);
}

export function validateMediaRecord(state: MediaState, kind: MediaKind, record: MediaRecord): string | null {
	if (!record.id.trim()) return "Укажите ID.";
	if (!record.name.trim()) return "Укажите название.";
	if (!record.url.startsWith(`/${kind}/`) || !record.url.slice(kind.length + 2).trim() || /\s/.test(record.url)) return `Укажите ссылку вида /${kind}/идентификатор без пробелов.`;
	if (mediaItems(state).some((item) => item.url === record.url && (item.mediaRoute.kind !== kind || item.record.id !== record.id))) return "Такая ссылка уже используется.";
	if ("notePath" in record && record.notePath !== null && (record.notePath.startsWith("/") || record.notePath.includes("\\") || record.notePath.includes(":") || record.notePath.split("/").some((part) => part === ".." || part === "."))) return "Укажите относительный путь заметки в vault.";
	if (kind === "track") {
		const track = record as MediaTrack;
		if ([track.normalAudioId, track.combatAudioId].some((id) => id !== null && !state.audioFiles.some((audio) => audio.id === id))) return "Аудиофайл не найден.";
	} else if (kind === "playlist") {
		const playlist = record as Playlist;
		if (new Set(playlist.items.map((item) => item.id)).size !== playlist.items.length) return "ID элементов плейлиста должны быть уникальными.";
		if (playlist.items.some((item) => !item.id.trim() || !state.tracks.some((track) => track.id === item.trackId))) return "Трек элемента не найден.";
	} else if (kind === "scene") {
		const scene = record as MediaScene;
		if (scene.trackId !== null && !state.tracks.some((track) => track.id === scene.trackId)) return "Трек сцены не найден.";
	} else {
		const adventure = record as Adventure;
		if (adventure.playlistId !== null && !state.playlists.some((playlist) => playlist.id === adventure.playlistId)) return "Плейлист приключения не найден.";
		if (new Set(adventure.links.map((link) => link.id)).size !== adventure.links.length || adventure.links.some((link) => !link.id.trim())) return "ID связей сцен должны быть уникальными.";
		if (adventure.scenes.some((scene) => !Number.isFinite(scene.position.x) || !Number.isFinite(scene.position.y))) return "Некорректное положение сцены.";
	}
	return null;
}

/** Scene records are shared; adventures own only their graph references. */
export function saveMediaRecord(state: MediaState, kind: MediaKind, record: MediaRecord, adventureId?: string): void {
	const error = validateMediaRecord(state, kind, record);
	if (error) throw new Error(error);
	const next = structuredClone(record);
	next.name = next.name.trim();
	if (kind === "scene") {
		const parent = state.adventures.find((entry) => entry.id === adventureId);
		if (adventureId && !parent) throw new Error("Приключение не найдено.");
		if (parent && !parent.scenes.some((scene) => scene.id === next.id)) parent.scenes.push({ id: next.id, position: freeScenePosition(parent.scenes) });
	}
	if (kind === "adventure") {
		const sceneIds = new Set((next as Adventure).scenes.map((scene) => scene.id));
		if ((next as Adventure).scenes.length !== sceneIds.size || [...sceneIds].some((id) => !state.scenes.some((scene) => scene.id === id))) throw new Error("Некорректные ссылки на сцены.");
		if ((next as Adventure).links.some((link) => !sceneIds.has(link.fromSceneId) || !sceneIds.has(link.toSceneId))) throw new Error("Некорректные связи сцен.");
	}
	const list = kind === "track" ? state.tracks : kind === "playlist" ? state.playlists : kind === "scene" ? state.scenes : state.adventures;
	const index = list.findIndex((entry) => entry.id === next.id);
	if (index >= 0) (list as MediaRecord[])[index] = next;
	else (list as MediaRecord[]).push(next);
	if (kind === "adventure" && state.activeSceneId && state.activeAdventureId === next.id && !(next as Adventure).scenes.some((scene) => scene.id === state.activeSceneId)) state.activeAdventureId = null;
}

export function freeScenePosition(scenes: AdventureScene[]): { x: number; y: number } {
	let x = 0;
	let y = 0;
	while (scenes.some((scene) => Math.abs(scene.position.x - x) < 330 && Math.abs(scene.position.y - y) < 150)) {
		x += 330;
		if (x >= 990) { x = 0; y += 180; }
	}
	return { x, y };
}

export function removeMediaRecord(state: MediaState, route: MediaRoute): void {
	if (route.kind === "track") {
		state.tracks = state.tracks.filter((track) => track.id !== route.id);
		for (const playlist of state.playlists) playlist.items = playlist.items.filter((item) => item.trackId !== route.id);
		for (const scene of state.scenes) if (scene.trackId === route.id) scene.trackId = null;
	} else if (route.kind === "playlist") {
		state.playlists = state.playlists.filter((playlist) => playlist.id !== route.id);
		for (const adventure of state.adventures) if (adventure.playlistId === route.id) adventure.playlistId = null;
	} else if (route.kind === "adventure") {
		state.adventures = state.adventures.filter((adventure) => adventure.id !== route.id);
		if (state.activeAdventureId === route.id) state.activeAdventureId = null;
	} else {
		state.scenes = state.scenes.filter((scene) => scene.id !== route.id);
		for (const adventure of state.adventures) {
			adventure.scenes = adventure.scenes.filter((scene) => scene.id !== route.id);
			adventure.links = adventure.links.filter((link) => link.fromSceneId !== route.id && link.toSceneId !== route.id);
		}
		if (state.activeSceneId === route.id) state.activeSceneId = null;
	}
}
