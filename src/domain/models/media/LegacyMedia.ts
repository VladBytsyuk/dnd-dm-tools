import { createMediaTrack, createMediaPlaylist, createMediaAdventure, createMediaScene, type MediaState } from "./MediaState";

export interface LegacyPlaylistItem { id: string; normalAudioId: string; combatAudioId: string | null; loop: boolean }
export interface LegacyPlaylist { id: string; name: string; items: LegacyPlaylistItem[] }
export interface LegacyScene { id: string; path: string; playlistId: string | null; itemId: string | null }
export interface LegacyAdventure { id: string; name: string; playlistIds: string[]; scenes: LegacyScene[]; links: Array<{ id?: string; fromSceneId: string; toSceneId: string }> }
export interface LegacyMediaState extends Omit<MediaState, "tracks" | "playlists" | "adventures"> { playlists: LegacyPlaylist[]; adventures: LegacyAdventure[] }

/** Native legacy screens edit a projection; canonical metadata and standalone tracks stay intact. */
export function toLegacyMedia(state: MediaState): LegacyMediaState {
	return {
		...structuredClone(state),
		playlists: state.playlists.map((playlist) => ({ id: playlist.id, name: playlist.name, items: playlist.items.flatMap((item) => {
			const track = state.tracks.find((track) => track.id === item.trackId);
			return track?.normalAudioId ? [{ id: item.id, normalAudioId: track.normalAudioId, combatAudioId: track.combatAudioId, loop: track.loop }] : [];
		}) })),
		adventures: state.adventures.map((adventure) => ({ id: adventure.id, name: adventure.name, playlistIds: adventure.playlistId ? [adventure.playlistId] : [],
			scenes: adventure.scenes.map((scene) => {
				const playlist = state.playlists.find((entry) => entry.id === adventure.playlistId);
				const item = playlist?.items.find((item) => item.trackId === scene.trackId);
				return { id: scene.id, path: scene.notePath ?? scene.name, playlistId: item ? playlist!.id : null, itemId: item?.id ?? null };
			}), links: adventure.links.map((link) => ({ ...link })) })),
	};
}
export function applyLegacyMedia(state: MediaState, before: LegacyMediaState, legacy: LegacyMediaState): void {
	const originalPlaylists = state.playlists;
	const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
	if (changed(before.audioFiles, legacy.audioFiles)) state.audioFiles = legacy.audioFiles.map((file) => ({ ...file }));
	if (before.musicVolume !== legacy.musicVolume) state.musicVolume = legacy.musicVolume;
	if (before.effectsVolume !== legacy.effectsVolume) state.effectsVolume = legacy.effectsVolume;
	if (before.activeAdventureId !== legacy.activeAdventureId) state.activeAdventureId = legacy.activeAdventureId;
	if (before.activeSceneId !== legacy.activeSceneId) state.activeSceneId = legacy.activeSceneId;
	for (const asset of state.audioFiles) if (!before.audioFiles.some((file) => file.id === asset.id) && !state.tracks.some((track) => track.normalAudioId === asset.id)) {
		const track = createMediaTrack(asset.alias); track.normalAudioId = asset.id; state.tracks.push(track);
	}
	state.playlists = legacy.playlists.map((playlist) => {
		const original = originalPlaylists.find((entry) => entry.id === playlist.id);
		const prior = before.playlists.find((entry) => entry.id === playlist.id);
		if (original && !changed(prior, playlist)) return original;
		return { ...(original ?? createMediaPlaylist(playlist.name, playlist.id)), name: playlist.name, items: playlist.items.map((item) => {
			const oldItem = original?.items.find((entry) => entry.id === item.id);
			let track = state.tracks.find((entry) => entry.id === oldItem?.trackId);
			if (!track) { track = createMediaTrack(state.audioFiles.find((file) => file.id === item.normalAudioId)?.alias ?? "Трек"); state.tracks.push(track); }
			if (changed(prior?.items.find((entry) => entry.id === item.id), item)) { track.normalAudioId = item.normalAudioId; track.combatAudioId = item.combatAudioId; track.loop = item.loop; }
			return { id: item.id, trackId: track.id };
		}) };
	}).concat(originalPlaylists.filter((playlist) => !before.playlists.some((entry) => entry.id === playlist.id)));
	const originalAdventures = state.adventures;
	state.adventures = legacy.adventures.map((adventure) => {
		const original = state.adventures.find((entry) => entry.id === adventure.id);
		const prior = before.adventures.find((entry) => entry.id === adventure.id);
		if (original && !changed(prior, adventure)) return original;
		const scenes = adventure.scenes.map((scene, index) => {
			const old = original?.scenes.find((entry) => entry.id === scene.id);
			const previous = prior?.scenes.find((entry) => entry.id === scene.id);
			const linked = state.playlists.find((entry) => entry.id === scene.playlistId)?.items.find((entry) => entry.id === scene.itemId);
			const assignmentUnchanged = previous?.playlistId === scene.playlistId && previous?.itemId === scene.itemId;
			return { ...(old ?? createMediaScene(scene.path.split("/").at(-1)?.replace(/\.md$/i, ""), scene.id)),
				notePath: old && previous?.path === scene.path ? old.notePath : scene.path,
				trackId: assignmentUnchanged ? old?.trackId ?? null : linked?.trackId ?? null,
				position: old?.position ?? { x: index % 3 * 220, y: Math.floor(index / 3) * 120 } };
		});
		return { ...(original ?? createMediaAdventure(adventure.name, adventure.id)), name: adventure.name,
			playlistId: adventure.playlistIds.find((id) => state.playlists.some((list) => list.id === id)) ?? null, scenes,
			links: adventure.links.map((link) => ({ ...(original?.links.find((entry) => entry.id === link.id) ?? {}), ...link, id: link.id ?? crypto.randomUUID() })) };
	}).concat(originalAdventures.filter((adventure) => !before.adventures.some((entry) => entry.id === adventure.id)));
	for (const track of state.tracks) {
		if (!state.audioFiles.some((file) => file.id === track.normalAudioId)) track.normalAudioId = null;
		if (!state.audioFiles.some((file) => file.id === track.combatAudioId)) track.combatAudioId = null;
	}
}
