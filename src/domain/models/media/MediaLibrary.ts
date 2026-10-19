import type { BaseItem } from "../common/BaseItem";
import type { PanelKey } from "../assistant/AssistantWorkspace";
import type { Adventure, AdventureScene, MediaState, MediaTrack, Playlist } from "./MediaState";

export type MediaKind = "track" | "playlist" | "adventure" | "scene";
export type MediaRoute = { kind: MediaKind; id: string; adventureId?: string };
export type MediaRecord = MediaTrack | Playlist | Adventure | AdventureScene;
export type MediaItem = BaseItem & { mediaRoute: MediaRoute; record: MediaRecord; parent?: Adventure };

export function mediaItems(state: MediaState): MediaItem[] {
	const item = (kind: MediaKind, record: MediaRecord, parent?: Adventure): MediaItem => ({
		name: { rus: record.name, eng: "" }, url: record.url, origin: "manual", record, parent,
		mediaRoute: { kind, id: record.id, ...(parent ? { adventureId: parent.id } : {}) },
	});
	return [
		...state.playlists.map((record) => item("playlist", record)),
		...state.tracks.map((record) => item("track", record)),
		...state.standaloneScenes.map((record) => item("scene", record)),
		...state.adventures.flatMap((record) => [item("adventure", record), ...record.scenes.map((scene) => item("scene", scene, record))]),
	];
}

export function mediaCampaignName(item: MediaItem): string {
	return item.parent?.campaignName ?? ("campaignName" in item.record ? item.record.campaignName : "");
}

export function mediaPanel(kind: MediaKind): PanelKey { return kind === "track" || kind === "playlist" ? "player" : "adventures"; }

export function findMediaItem(state: MediaState, route: MediaRoute): MediaItem | undefined {
	return mediaItems(state).find((item) => item.mediaRoute.kind === route.kind && item.mediaRoute.id === route.id);
}

export function validateMediaRecord(state: MediaState, kind: MediaKind, record: MediaRecord): string | null {
	if (!record.name.trim()) return "Укажите название.";
	if (!record.url.startsWith(`/${kind}/`) || !record.url.slice(kind.length + 2).trim() || /\s/.test(record.url)) return `Укажите ссылку вида /${kind}/идентификатор без пробелов.`;
	if (mediaItems(state).some((item) => item.url === record.url && (item.mediaRoute.kind !== kind || item.record.id !== record.id))) return "Такая ссылка уже используется.";
	return null;
}

/** Saving a scene moves its one owning record and removes arrows from its previous adventure. */
export function saveMediaRecord(state: MediaState, kind: MediaKind, record: MediaRecord, adventureId?: string): void {
	const error = validateMediaRecord(state, kind, record);
	if (error) throw new Error(error);
	const next = structuredClone(record);
	next.name = next.name.trim();
	if (kind === "scene") {
		const parent = state.adventures.find((entry) => entry.id === adventureId);
		if (adventureId && !parent) throw new Error("Приключение не найдено.");
		const old = state.adventures.find((entry) => entry.scenes.some((scene) => scene.id === next.id));
		if (old && old !== parent) {
			old.scenes = old.scenes.filter((scene) => scene.id !== next.id);
			old.links = old.links.filter((link) => link.fromSceneId !== next.id && link.toSceneId !== next.id);
		}
		if (parent) state.standaloneScenes = state.standaloneScenes.filter((scene) => scene.id !== next.id);
		const scenes = parent?.scenes ?? state.standaloneScenes;
		const index = scenes.findIndex((scene) => scene.id === next.id);
		if (index >= 0) scenes[index] = next as AdventureScene;
		else {
			if (parent) (next as AdventureScene).position = freeScenePosition(scenes);
			scenes.push(next as AdventureScene);
		}
		if (state.activeSceneId === next.id) state.activeAdventureId = parent?.id ?? null;
		return;
	}
	const list = kind === "track" ? state.tracks : kind === "playlist" ? state.playlists : state.adventures;
	const index = list.findIndex((entry) => entry.id === next.id);
	if (index >= 0) (list as MediaRecord[])[index] = next;
	else (list as MediaRecord[]).push(next);
	if (kind === "adventure" && state.activeAdventureId === next.id && !(next as Adventure).scenes.some((scene) => scene.id === state.activeSceneId)) state.activeSceneId = null;
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
		for (const adventure of state.adventures) for (const scene of adventure.scenes) if (scene.trackId === route.id) scene.trackId = null;
		for (const scene of state.standaloneScenes) if (scene.trackId === route.id) scene.trackId = null;
	} else if (route.kind === "playlist") {
		state.playlists = state.playlists.filter((playlist) => playlist.id !== route.id);
		for (const adventure of state.adventures) if (adventure.playlistId === route.id) adventure.playlistId = null;
	} else if (route.kind === "adventure") {
		state.adventures = state.adventures.filter((adventure) => adventure.id !== route.id);
		if (state.activeAdventureId === route.id) { state.activeAdventureId = null; state.activeSceneId = null; }
	} else {
		state.standaloneScenes = state.standaloneScenes.filter((scene) => scene.id !== route.id);
		for (const adventure of state.adventures) {
			adventure.scenes = adventure.scenes.filter((scene) => scene.id !== route.id);
			adventure.links = adventure.links.filter((link) => link.fromSceneId !== route.id && link.toSceneId !== route.id);
		}
		if (state.activeSceneId === route.id) state.activeSceneId = null;
	}
}
