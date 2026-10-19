import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPlaybackService } from 'src/data/services/MediaPlaybackService';
import { BufferedMusic } from 'src/data/services/BufferedMusic';
import { createDefaultMediaState, createMediaAdventure, createMediaScene, type MediaState } from 'src/domain/models/media/MediaState';

vi.mock('src/data/services/BufferedMusic', () => ({
	BufferedMusic: { load: vi.fn() },
}));

class FakeAudio {
	static instances: FakeAudio[] = [];
	volume = 1;
	muted = false;
	loop = false;
	ended = false;
	paused = true;
	currentTime = 0;
	duration = 120;
	play = vi.fn(async () => { this.paused = false; this.ended = false; });
	pause = vi.fn(() => { this.paused = true; });
	load = vi.fn();
	private listeners = new Map<string, Array<() => void>>();

	constructor(public src: string) {
		FakeAudio.instances.push(this);
	}

	addEventListener(event: string, listener: () => void): void {
		this.listeners.set(event, [...this.listeners.get(event) ?? [], listener]);
	}
	removeEventListener(event: string, listener: () => void): void {
		this.listeners.set(event, (this.listeners.get(event) ?? []).filter((entry) => entry !== listener));
	}
	emit(event: string): void {
		for (const listener of this.listeners.get(event) ?? []) listener();
	}

	removeAttribute(name: string): void {
		if (name === 'src') this.src = '';
	}

	dispose(): void {
		this.pause();
		this.removeAttribute('src');
		this.load();
	}

	end(): void {
		this.ended = true;
		this.emit('ended');
	}
}

function makeState(): MediaState {
	return {
		...createDefaultMediaState(),
		audioFiles: [
			{ id: 'calm', path: 'Audio/calm.mp3', alias: 'Таверна' },
			{ id: 'battle', path: 'Audio/battle.mp3', alias: 'Бой' },
			{ id: 'next', path: 'Audio/next.mp3', alias: 'Дорога' },
			{ id: 'effect', path: 'Audio/effect.mp3', alias: 'Дверь' },
		],
		tracks: [
			{ id: 'track-one', name: 'Таверна', url: '/track/track-one', atmosphere: '', normalAudioId: 'calm', combatAudioId: 'battle', loop: true },
			{ id: 'track-two', name: 'Дорога', url: '/track/track-two', atmosphere: '', normalAudioId: 'next', combatAudioId: null, loop: false },
		],
		playlists: [{ id: 'list', name: 'Сессия', url: '/playlist/list', atmosphere: '', items: [
			{ id: 'one', trackId: 'track-one' }, { id: 'two', trackId: 'track-two' },
		] }],
		adventures: [], musicVolume: 0.6, effectsVolume: 0.3,
		activeAdventureId: null, activeSceneId: null,
	};
}

function makeNonLoopingState(): MediaState {
	const state = makeState();
	state.tracks[0].loop = false;
	return state;
}

function makeService(state: MediaState, vaultPaths?: string[]): MediaPlaybackService {
	const app = {
		vault: {
			getFileByPath: (path: string) => (vaultPaths ? vaultPaths.includes(path) : state.audioFiles.some((asset) => asset.path === path)) ? { path } : null,
			getResourcePath: (file: { path: string }) => `app://vault/${file.path}`,
			readBinary: vi.fn(async (file: { path: string }) => new TextEncoder().encode(`app://vault/${file.path}`).buffer),
		},
	};
	return new MediaPlaybackService(app as any, () => state);
}

describe('MediaPlaybackService', () => {
	beforeEach(() => {
		FakeAudio.instances = [];
		vi.stubGlobal('Audio', FakeAudio);
		vi.mocked(BufferedMusic.load).mockReset().mockImplementation(async (data) => new FakeAudio(new TextDecoder().decode(data)) as unknown as BufferedMusic);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('plays a snapshot with an empty library and retains it through pause, combat changes and stop', async () => {
		const saved = makeState();
		const state = createDefaultMediaState();
		state.musicVolume = 0.25;
		const before = structuredClone(state);
		const service = makeService(state, saved.audioFiles.map((asset) => asset.path));
		await service.playTrackSnapshot(saved.tracks[0], saved.audioFiles, 'note-one', 'normal');
		expect(FakeAudio.instances[0].src).toContain('calm.mp3');
		expect(FakeAudio.instances[0].loop).toBe(true);
		vi.advanceTimersByTime(500);
		expect(FakeAudio.instances[0].volume).toBe(0.25);
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'note-one', title: 'Таверна', playing: true, volume: 0.25 });
		service.seek(45);
		service.pause();
		await service.setManualCombat(true);
		expect(FakeAudio.instances[1].src).toContain('battle.mp3');
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'note-one', paused: true, currentTime: 45, playingVariant: 'combat' });
		await service.resume();
		await service.setTrackerCombat(true);
		await service.setTrackerCombat(false);
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'note-one', playing: true, currentTime: 45, playingVariant: 'normal' });
		service.stop();
		await service.resume();
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'note-one', playing: true, currentTime: 0 });
		expect(state).toEqual(before);
		service.clear();
		expect(service.getSnapshot()).toMatchObject({ sourceId: null, trackId: null });
		service.dispose();
	});

	it('keeps snapshot tracks and audio separate from matching library IDs and later edits', async () => {
		const saved = makeState();
		const state = makeState();
		state.tracks[0].name = 'Из библиотеки';
		state.audioFiles[0].path = 'Audio/library.mp3';
		const service = makeService(state, [...saved.audioFiles, ...state.audioFiles].map((asset) => asset.path));
		await service.playTrackSnapshot(saved.tracks[0], saved.audioFiles, 'note-one');
		saved.tracks[0].name = 'Изменённый снимок';
		saved.audioFiles[1].path = 'Audio/changed.mp3';
		state.tracks = [];
		state.audioFiles = [];
		service.onMediaChanged();
		await service.setManualCombat(true);
		expect(FakeAudio.instances[1].src).toContain('battle.mp3');
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'note-one', title: 'Таверна', playing: true });
		state.tracks = makeState().tracks;
		state.tracks[0].name = 'Из библиотеки';
		state.audioFiles = makeState().audioFiles;
		state.audioFiles[0].path = 'Audio/library.mp3';
		await service.playTrack('track-one', 'normal');
		expect(FakeAudio.instances.at(-1)!.src).toContain('library.mp3');
		expect(service.getSnapshot()).toMatchObject({ sourceId: null, title: 'Из библиотеки' });
		await service.playTrackSnapshot(saved.tracks[0], saved.audioFiles, 'note-two', 'normal');
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'note-two', title: 'Изменённый снимок' });
		await service.play('list');
		expect(service.getSnapshot()).toMatchObject({ sourceId: null, playlistId: 'list', title: 'Из библиотеки' });
		service.dispose();
	});

	it('reports missing snapshot files without falling back to the library or replacing current playback', async () => {
		const state = makeState();
		const saved = makeState();
		const service = makeService(state);
		await service.playTrackSnapshot(saved.tracks[0], saved.audioFiles, 'working-note');
		saved.audioFiles[0].path = 'Audio/missing.mp3';
		await expect(service.playTrackSnapshot(saved.tracks[0], saved.audioFiles, 'missing-note')).rejects.toThrow('Аудиофайл отсутствует в хранилище: Audio/missing.mp3');
		await expect(service.playTrackSnapshot(saved.tracks[0], [], 'invalid-note')).rejects.toThrow('Обычный звуковой файл не найден');
		expect(service.getSnapshot()).toMatchObject({ sourceId: 'working-note', title: 'Таверна', playing: true });
		service.dispose();
	});

	it('does not commit a snapshot source when a newer library track starts during loading', async () => {
		const state = makeState();
		const service = makeService(state);
		let finish!: (audio: BufferedMusic) => void;
		vi.mocked(BufferedMusic.load).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
		const pending = service.playTrackSnapshot(state.tracks[0], state.audioFiles, 'loading-note');
		await vi.waitFor(() => expect(finish).toBeDefined());
		await service.playTrack('track-two');
		const stale = new FakeAudio('snapshot');
		finish(stale as unknown as BufferedMusic);
		await pending;
		expect(service.getSnapshot()).toMatchObject({ sourceId: null, trackId: 'track-two', playing: true });
		expect(stale.load).toHaveBeenCalled();
		service.dispose();
	});

	it('follows library scene music even when a snapshot has the same track ID', async () => {
		const state = makeState();
		const adventure = createMediaAdventure('Поход', 'quest');
		const scene = createMediaScene('Первая', 'first');
		scene.trackId = 'track-one';
		adventure.scenes = [scene];
		state.adventures = [adventure];
		const service = makeService(state);
		await service.playTrackSnapshot(state.tracks[0], state.audioFiles, 'note-one');
		await service.followScene('quest', 'first');
		expect(service.getSnapshot()).toMatchObject({ sourceId: null, trackId: 'track-one', playing: true });
		expect(FakeAudio.instances).toHaveLength(2);
		service.dispose();
	});

	it('plays one looping item, pauses and changes to the next item', async () => {
		const service = makeService(makeState());
		await service.play('list');
		const first = FakeAudio.instances[0];
		expect(first.src).toContain('calm.mp3');
		expect(first.loop).toBe(true);
		vi.advanceTimersByTime(500);
		expect(first.volume).toBe(0.6);
		service.pause();
		expect(service.getSnapshot()).toMatchObject({ playing: false, paused: true, title: 'Таверна' });
		await service.resume();
		await service.next();
		expect(FakeAudio.instances[1].src).toContain('next.mp3');
		vi.advanceTimersByTime(500);
		expect(first.paused).toBe(true);
		expect(service.getSnapshot()).toMatchObject({ itemId: 'two', playing: true, title: 'Дорога' });
		FakeAudio.instances[1].end();
		expect(service.getSnapshot().playing).toBe(false);
		await service.resume();
		expect(FakeAudio.instances).toHaveLength(2);
		expect(FakeAudio.instances[1].src).toContain('next.mp3');
		service.dispose();
	});

	it('uses the combat source while tracker combat is active', async () => {
		const service = makeService(makeState());
		await service.play('list');
		await service.setTrackerCombat(true);
		expect(FakeAudio.instances[1].src).toContain('battle.mp3');
		expect(service.getSnapshot()).toMatchObject({ combatMode: true, manualCombat: false });
		await service.setTrackerCombat(false);
		expect(FakeAudio.instances.at(-1)?.src).toContain('calm.mp3');
		service.dispose();
	});

	it('locks normal playback when no combat source exists', async () => {
		const service = makeService(makeState());
		await service.play('list', 'two');
		await service.setTrackerCombat(true);
		expect(FakeAudio.instances).toHaveLength(1);
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: true, playingVariant: 'normal' });
		service.dispose();
	});

	it('plays independent one-shot effects and applies separate volume updates', async () => {
		const state = makeState();
		const service = makeService(state);
		await service.play('list');
		await service.playEffect('effect');
		await service.playEffect('effect');
		expect(FakeAudio.instances).toHaveLength(3);
		state.effectsVolume = 0.1;
		service.onMediaChanged();
		expect(FakeAudio.instances[1].volume).toBe(0.1);
		expect(FakeAudio.instances[2].volume).toBe(0.1);
		FakeAudio.instances[1].end();
		service.dispose();
		expect(FakeAudio.instances[2].paused).toBe(true);
	});

	it('reports missing files and keeps the current music', async () => {
		const state = makeState();
		const service = makeService(state);
		await service.play('list');
		state.audioFiles = state.audioFiles.filter((asset) => asset.id !== 'next');
		await expect(service.next()).rejects.toThrow('Обычный звуковой файл не найден');
		expect(service.getSnapshot()).toMatchObject({ itemId: 'one', playing: true });
		service.dispose();
	});

	it('reports the timeline and automatically advances non-looping tracks', async () => {
		const service = makeService(makeNonLoopingState());
		const updates = vi.fn();
		service.subscribe(updates);
		await service.play('list');
		const first = FakeAudio.instances[0];
		first.currentTime = 34;
		first.emit('timeupdate');
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', playlistName: 'Сессия', nextTrackName: 'Дорога', hasPrevious: false, currentTime: 34, duration: 120 });
		expect(updates).toHaveBeenCalled();
		first.end();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ itemId: 'two', trackId: 'track-two', hasPrevious: true, playing: true }));
		FakeAudio.instances[1].end();
		expect(service.getSnapshot()).toMatchObject({ itemId: 'two', playing: false, paused: false, currentTime: 0 });
		await service.resume();
		expect(service.getSnapshot().playing).toBe(true);
		service.dispose();
	});

	it('seeks, mutes, sets volume, and retains selection after stop', async () => {
		const state = makeNonLoopingState();
		const service = makeService(state);
		await service.playTrack('track-one');
		service.seek(200);
		expect(service.getSnapshot().currentTime).toBe(120);
		service.setVolume(0.4);
		service.setMuted(true);
		expect(service.getSnapshot()).toMatchObject({ volume: 0.4, muted: true });
		service.stop();
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', playing: false, paused: false, currentTime: 0 });
		await service.resume();
		expect(service.getSnapshot().playing).toBe(true);
		service.dispose();
	});

	it('lets manual mode override combat until tracker changes and preserves position on variant switch', async () => {
		const state = makeNonLoopingState();
		const service = makeService(state);
		await service.playTrack('track-one', 'combat');
		FakeAudio.instances[0].currentTime = 60;
		await service.setTrackerCombat(true);
		expect(service.getSnapshot()).toMatchObject({ combatMode: true, playingVariant: 'combat', manualCombat: false });
		await service.setManualCombat(false);
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, trackerCombat: true, playingVariant: 'normal' });
		expect(FakeAudio.instances[1].currentTime).toBe(60);
		await service.setTrackerCombat(false);
		expect(service.getSnapshot().combatMode).toBe(false);
		service.dispose();
	});
	it('follows scene music only while playing, retains playlist context and does not restart the same track', async () => {
		const state = makeNonLoopingState();
		const adventure = createMediaAdventure("Поход", "quest"); adventure.playlistId = "list";
		adventure.scenes = [createMediaScene("Первая", "first"), createMediaScene("Следующая", "second"), createMediaScene("Тихая", "silent")];
		adventure.scenes[0].trackId = "track-one"; adventure.scenes[1].trackId = "track-two"; state.adventures = [adventure];
		const service = makeService(state);
		await service.followScene("quest", "first"); expect(FakeAudio.instances).toHaveLength(0);
		await service.playTrack("track-one"); service.pause();
		await service.followScene("quest", "second"); expect(FakeAudio.instances).toHaveLength(1);
		await service.resume(); await service.followScene("quest", "second");
		expect(service.getSnapshot()).toMatchObject({ playlistId: "list", itemId: "two", trackId: "track-two", playing: true });
		await service.followScene("quest", "second"); await service.followScene("quest", "silent"); expect(FakeAudio.instances).toHaveLength(2);
		service.stop(); await service.followScene("quest", "first"); expect(FakeAudio.instances).toHaveLength(2);
		service.clear(); expect(service.getSnapshot()).toMatchObject({ trackId: null, playlistId: null }); service.dispose();
	});
	it('follows standalone scene tracks only while playing without playlist context', async () => {
		const state = makeNonLoopingState(), scene = createMediaScene("Засада", "solo");
		scene.trackId = "track-two"; state.standaloneScenes.push(scene);
		const service = makeService(state);
		await service.followScene(null, scene.id); expect(FakeAudio.instances).toHaveLength(0);
		await service.play("list", "one"); service.pause();
		await service.followScene(null, scene.id); expect(FakeAudio.instances).toHaveLength(1);
		await service.resume(); await service.followScene(null, scene.id);
		expect(service.getSnapshot()).toMatchObject({ playlistId: null, itemId: null, trackId: "track-two", playing: true });
		await service.followScene(null, scene.id); expect(FakeAudio.instances).toHaveLength(2);
		service.stop(); scene.trackId = "track-one";
		await service.followScene(null, scene.id); expect(FakeAudio.instances).toHaveLength(2);
		service.dispose();
	});
	it('plays a combat-only file explicitly and keeps the previous mode when another play fails', async () => {
		const state = makeNonLoopingState(); state.tracks[0].normalAudioId = null; state.tracks[1].normalAudioId = null;
		const service = makeService(state);
		await service.playTrack("track-one", "combat");
		expect(service.getSnapshot()).toMatchObject({ playing: true, playingVariant: "combat", combatMode: true });
		await expect(service.playTrack("track-two", "normal")).rejects.toThrow();
		expect(service.getSnapshot()).toMatchObject({ trackId: "track-one", combatMode: true, playing: true }); service.dispose();
	});

	it.each([false, true])('locks combat-only tracks and restores the previous manual mode %s', async (combatMode) => {
		const state = makeState();
		state.tracks[0].normalAudioId = null;
		state.tracks[1].combatAudioId = 'battle';
		const service = makeService(state);
		await service.setManualCombat(combatMode);
		await service.playTrack('track-one', 'combat');
		expect(service.getSnapshot()).toMatchObject({ combatMode: true, combatModeLocked: true, playingVariant: 'combat' });
		await service.setManualCombat(false);
		expect(service.getSnapshot().combatMode).toBe(true);
		await service.playTrack('track-two', 'normal');
		expect(service.getSnapshot()).toMatchObject({ combatMode, combatModeLocked: false, playingVariant: combatMode ? 'combat' : 'normal' });
		service.dispose();
	});

	it.each([false, true])('preserves the previous tracker mode %s while combat is forced', async (combatMode) => {
		const state = makeState();
		state.tracks[0].normalAudioId = null;
		state.tracks[1].combatAudioId = 'battle';
		const service = makeService(state);
		await service.setTrackerCombat(combatMode);
		await service.playTrack('track-one');
		await service.setTrackerCombat(!combatMode);
		expect(service.getSnapshot()).toMatchObject({ combatMode: true, combatModeLocked: true, trackerCombat: !combatMode });
		await service.playTrack('track-two');
		expect(service.getSnapshot()).toMatchObject({ combatMode, combatModeLocked: false });
		service.dispose();
	});

	it.each([false, true])('restores mode %s when a playlist automatically leaves a combat-only track', async (combatMode) => {
		const state = makeNonLoopingState();
		state.tracks[0].normalAudioId = null;
		state.tracks[1].combatAudioId = 'battle';
		const service = makeService(state);
		await service.setManualCombat(combatMode);
		await service.play('list');
		expect(FakeAudio.instances[0].src).toContain('battle.mp3');
		expect(service.getSnapshot().combatModeLocked).toBe(true);
		FakeAudio.instances[0].end();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ itemId: 'two', combatMode, combatModeLocked: false }));
		await service.previous();
		expect(service.getSnapshot()).toMatchObject({ itemId: 'one', combatMode: true, combatModeLocked: true });
		await service.next();
		expect(service.getSnapshot()).toMatchObject({ itemId: 'two', combatMode, combatModeLocked: false });
		service.dispose();
	});

	it('keeps the lock through pause, stop and consecutive combat-only tracks, and restores on clear', async () => {
		const state = makeState();
		state.tracks[0].normalAudioId = null;
		state.tracks.push({ ...state.tracks[0], id: 'track-three' });
		const service = makeService(state);
		await service.playTrack('track-one', 'combat');
		service.pause();
		expect(service.getSnapshot()).toMatchObject({ paused: true, combatMode: true, combatModeLocked: true });
		await service.resume();
		service.stop();
		expect(service.getSnapshot()).toMatchObject({ playing: false, combatMode: true, combatModeLocked: true });
		await service.resume();
		await service.playTrack('track-three', 'combat');
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-three', combatMode: true, combatModeLocked: true });
		service.clear();
		expect(service.getSnapshot()).toMatchObject({ trackId: null, combatMode: false, combatModeLocked: false });
		service.dispose();
	});

	it('restores the prior mode for a dual-variant track after combat-only playback', async () => {
		const state = makeState();
		state.tracks[1].normalAudioId = null;
		state.tracks[1].combatAudioId = 'battle';
		const service = makeService(state);
		await service.playTrack('track-two', 'combat');
		await service.playTrack('track-one');
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: false, playingVariant: 'normal' });
		expect(FakeAudio.instances.at(-1)?.src).toContain('calm.mp3');
		service.dispose();
	});

	it('keeps the current track and mode when the combat-only audio file is missing', async () => {
		const state = makeState();
		state.tracks[0].normalAudioId = null;
		const service = makeService(state);
		await service.playTrack('track-two');
		state.audioFiles = state.audioFiles.filter((asset) => asset.id !== 'battle');
		await expect(service.playTrack('track-one', 'combat')).rejects.toThrow();
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-two', playing: true, combatMode: false, combatModeLocked: true });
		service.dispose();
	});

	it('updates the combat lock when the selected track gains or loses its normal audio', async () => {
		const state = makeState();
		const service = makeService(state);
		await service.playTrack('track-one');
		state.tracks[0].normalAudioId = null;
		service.onMediaChanged();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ combatMode: true, combatModeLocked: true, playingVariant: 'combat' }));
		state.tracks[0].normalAudioId = 'calm';
		service.onMediaChanged();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: false, playingVariant: 'normal' }));
		service.dispose();
	});

	it.each([false, true])('locks normal-only tracks without changing the saved manual mode %s', async (combatMode) => {
		const service = makeService(makeState());
		await service.setManualCombat(combatMode);
		await service.playTrack('track-one');
		await service.playTrack('track-two', 'normal');
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: true, playingVariant: 'normal' });
		await service.setManualCombat(!combatMode);
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: true });
		await service.playTrack('track-one', 'normal');
		expect(service.getSnapshot()).toMatchObject({ combatMode, combatModeLocked: false, playingVariant: combatMode ? 'combat' : 'normal' });
		expect(FakeAudio.instances.at(-1)?.src).toContain(combatMode ? 'battle.mp3' : 'calm.mp3');
		service.dispose();
	});

	it.each([false, true])('preserves the previous tracker mode %s while normal playback is forced', async (combatMode) => {
		const service = makeService(makeState());
		await service.setTrackerCombat(combatMode);
		await service.playTrack('track-two');
		await service.setTrackerCombat(!combatMode);
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: true, trackerCombat: !combatMode });
		await service.playTrack('track-one');
		expect(service.getSnapshot()).toMatchObject({ combatMode, combatModeLocked: false });
		service.dispose();
	});

	it.each([false, true])('preserves saved mode %s across mixed normal-only and combat-only playlist tracks', async (combatMode) => {
		const state = makeState();
		state.tracks.push({ ...state.tracks[0], id: 'combat-only', normalAudioId: null });
		state.playlists[0].items = [
			{ id: 'dual', trackId: 'track-one' },
			{ id: 'normal', trackId: 'track-two' },
			{ id: 'combat', trackId: 'combat-only' },
			{ id: 'normal-again', trackId: 'track-two' },
			{ id: 'dual-again', trackId: 'track-one' },
		];
		const service = makeService(state);
		await service.setManualCombat(combatMode);
		await service.play('list');
		for (const forcedMode of [false, true, false]) {
			await service.next();
			expect(service.getSnapshot()).toMatchObject({ combatMode: forcedMode, combatModeLocked: true, playingVariant: forcedMode ? 'combat' : 'normal' });
		}
		await service.next();
		expect(service.getSnapshot()).toMatchObject({ combatMode, combatModeLocked: false, playingVariant: combatMode ? 'combat' : 'normal' });
		service.dispose();
	});

	it('restores combat when a playlist automatically leaves a normal-only track', async () => {
		const state = makeNonLoopingState();
		state.playlists[0].items.reverse();
		const service = makeService(state);
		await service.setManualCombat(true);
		await service.play('list');
		expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: true, playingVariant: 'normal' });
		FakeAudio.instances[0].end();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', combatMode: true, combatModeLocked: false, playingVariant: 'combat' }));
		service.dispose();
	});

	it('keeps normal mode locked through pause and stop and restores combat on clear', async () => {
		const service = makeService(makeState());
		await service.setManualCombat(true);
		await service.playTrack('track-two', 'normal');
		service.pause();
		expect(service.getSnapshot()).toMatchObject({ paused: true, combatMode: false, combatModeLocked: true });
		await service.resume();
		service.stop();
		expect(service.getSnapshot()).toMatchObject({ playing: false, combatMode: false, combatModeLocked: true });
		await service.resume();
		service.clear();
		expect(service.getSnapshot()).toMatchObject({ trackId: null, combatMode: true, combatModeLocked: false });
		service.dispose();
	});

	it('keeps combat playback and its mode when a normal-only file is missing', async () => {
		const state = makeState();
		const service = makeService(state);
		await service.playTrack('track-one', 'combat');
		state.audioFiles = state.audioFiles.filter((asset) => asset.id !== 'next');
		await expect(service.playTrack('track-two', 'normal')).rejects.toThrow();
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', playing: true, combatMode: true, combatModeLocked: false, playingVariant: 'combat' });
		service.dispose();
	});

	it('restores the saved mode after adding combat audio to the selected normal-only track', async () => {
		const state = makeState();
		const service = makeService(state);
		await service.playTrack('track-one', 'combat');
		state.tracks[0].combatAudioId = null;
		service.onMediaChanged();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ combatMode: false, combatModeLocked: true, playingVariant: 'normal' }));
		state.tracks[0].combatAudioId = 'battle';
		service.onMediaChanged();
		await vi.waitFor(() => expect(service.getSnapshot()).toMatchObject({ combatMode: true, combatModeLocked: false, playingVariant: 'combat' }));
		service.dispose();
	});

	it('disposes decoded music if the player is cleared while loading', async () => {
		const service = makeService(makeState());
		let finish!: () => void;
		vi.mocked(BufferedMusic.load).mockImplementationOnce((data) => new Promise((resolve) => {
			finish = () => resolve(new FakeAudio(new TextDecoder().decode(data)) as unknown as BufferedMusic);
		}));
		const pending = service.playTrack('track-one');
		await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
		service.clear();
		finish();
		await pending;
		expect(service.getSnapshot()).toMatchObject({ trackId: null, playing: false });
		expect(FakeAudio.instances[0].src).toBe('');
		expect(FakeAudio.instances[0].play).not.toHaveBeenCalled();
		service.dispose();
	});

	it('does not let a slower decoded track replace a newer selection', async () => {
		const service = makeService(makeState());
		let finish!: () => void;
		vi.mocked(BufferedMusic.load).mockImplementationOnce((data) => new Promise((resolve) => {
			finish = () => resolve(new FakeAudio(new TextDecoder().decode(data)) as unknown as BufferedMusic);
		}));
		const pending = service.playTrack('track-one');
		await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
		await service.playTrack('track-two');
		finish();
		await pending;
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-two', playing: true });
		expect(FakeAudio.instances[1].src).toBe('');
		service.dispose();
	});

	it('does not restart music after a pause during decoding of another track', async () => {
		const service = makeService(makeState());
		await service.playTrack('track-one');
		let finish!: () => void;
		vi.mocked(BufferedMusic.load).mockImplementationOnce((data) => new Promise((resolve) => {
			finish = () => resolve(new FakeAudio(new TextDecoder().decode(data)) as unknown as BufferedMusic);
		}));
		const pending = service.playTrack('track-two');
		await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
		service.pause();
		finish();
		await pending;
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', playing: false, paused: true });
		expect(FakeAudio.instances[1].src).toBe('');
		service.dispose();
	});

	it('keeps current music playing if decoding the next track fails', async () => {
		const service = makeService(makeState());
		await service.play('list');
		vi.mocked(BufferedMusic.load).mockRejectedValueOnce(new Error('Unsupported audio'));
		await expect(service.next()).rejects.toThrow('Unsupported audio');
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', playing: true });
		expect(FakeAudio.instances[0].src).toContain('calm.mp3');
		service.dispose();
	});

	it('uses the latest combat mode when it changes during initial decoding', async () => {
		const service = makeService(makeState());
		let finish!: () => void;
		vi.mocked(BufferedMusic.load).mockImplementationOnce((data) => new Promise((resolve) => {
			finish = () => resolve(new FakeAudio(new TextDecoder().decode(data)) as unknown as BufferedMusic);
		}));
		const pending = service.playTrack('track-one');
		await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
		await service.setManualCombat(true);
		finish();
		await pending;
		expect(service.getSnapshot()).toMatchObject({ trackId: 'track-one', playing: true, combatMode: true, playingVariant: 'combat' });
		expect(FakeAudio.instances[0].src).toBe('');
		expect(FakeAudio.instances[1].src).toContain('battle.mp3');
		service.dispose();
	});

	it('changes looping on loaded music without decoding it again', async () => {
		const state = makeState();
		const service = makeService(state);
		await service.playTrack('track-one');
		state.tracks[0].loop = false;
		service.onMediaChanged();
		expect(FakeAudio.instances[0].loop).toBe(false);
		state.tracks[0].loop = true;
		service.onMediaChanged();
		expect(FakeAudio.instances[0].loop).toBe(true);
		expect(BufferedMusic.load).toHaveBeenCalledOnce();
		service.dispose();
	});

});
