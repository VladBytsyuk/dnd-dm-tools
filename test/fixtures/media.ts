import { loadMediaState } from "src/domain/models/media/MediaState";
export function legacyMedia() {
	return {
		audioFiles: [{ id: "calm", path: "Audio/calm.mp3", alias: "Спокойно" }, { id: "battle", path: "Audio/battle.mp3", alias: "Бой" }, { id: "effect", path: "Audio/effect.mp3", alias: "Дверь" }],
		playlists: [{ id: "music", name: "Город", items: [{ id: "market", normalAudioId: "calm", combatAudioId: "battle", loop: true }] }, { id: "other", name: "Другой", items: [{ id: "entry", normalAudioId: "calm", combatAudioId: null, loop: false }] }],
		adventures: [{ id: "quest", name: "Поход", playlistIds: ["music", "other"], scenes: [{ id: "start", path: "Scenes/Start.md", playlistId: "other", itemId: "entry" }, { id: "end", path: "Scenes/End.md", playlistId: null, itemId: null }], links: [{ fromSceneId: "start", toSceneId: "end" }] }],
		musicVolume: 0.6, effectsVolume: 0.4, activeAdventureId: "quest", activeSceneId: "start",
	};
}
export function sampleMedia() { return loadMediaState(legacyMedia()); }
