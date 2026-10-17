import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPlaybackService } from 'src/data/services/MediaPlaybackService';
import { createDefaultMediaState, createMediaAdventure, createMediaScene, type MediaState } from 'src/domain/models/media/MediaState';

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

function makeService(state: MediaState): MediaPlaybackService {
	const app = {
		vault: {
			getFileByPath: (path: string) => state.audioFiles.some((asset) => asset.path === path) ? { path } : null,
			getResourcePath: (file: { path: string }) => `app://vault/${file.path}`,
		},
	};
	return new MediaPlaybackService(app as any, () => state);
}

describe('MediaPlaybackService', () => {
	beforeEach(() => {
		FakeAudio.instances = [];
		vi.stubGlobal('Audio', FakeAudio);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
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

	it('keeps normal music when no combat source exists', async () => {
		const service = makeService(makeState());
		await service.play('list', 'two');
		await service.setTrackerCombat(true);
		expect(FakeAudio.instances).toHaveLength(1);
		expect(service.getSnapshot().combatMode).toBe(true);
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
		const app = { vault: { getFileByPath: (path: string) => ({ path }), getResourcePath: (file: { path: string }) => file.path } };
		const service = new MediaPlaybackService(app as any, () => state);
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
		const app = { vault: { getFileByPath: (path: string) => ({ path }), getResourcePath: (file: { path: string }) => file.path } };
		const service = new MediaPlaybackService(app as any, () => state);
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
		const app = { vault: { getFileByPath: (path: string) => ({ path }), getResourcePath: (file: { path: string }) => file.path } };
		const service = new MediaPlaybackService(app as any, () => state);
		await service.followScene("quest", "first"); expect(FakeAudio.instances).toHaveLength(0);
		await service.playTrack("track-one"); service.pause();
		await service.followScene("quest", "second"); expect(FakeAudio.instances).toHaveLength(1);
		await service.resume(); await service.followScene("quest", "second");
		expect(service.getSnapshot()).toMatchObject({ playlistId: "list", itemId: "two", trackId: "track-two", playing: true });
		await service.followScene("quest", "second"); await service.followScene("quest", "silent"); expect(FakeAudio.instances).toHaveLength(2);
		service.stop(); await service.followScene("quest", "first"); expect(FakeAudio.instances).toHaveLength(2);
		service.clear(); expect(service.getSnapshot()).toMatchObject({ trackId: null, playlistId: null }); service.dispose();
	});
	it('plays a combat-only file explicitly and keeps the previous mode when another play fails', async () => {
		const state = makeNonLoopingState(); state.tracks[0].normalAudioId = null; state.tracks[1].normalAudioId = null;
		const app = { vault: { getFileByPath: (path: string) => ({ path }), getResourcePath: (file: { path: string }) => file.path } };
		const service = new MediaPlaybackService(app as any, () => state);
		await service.playTrack("track-one", "combat");
		expect(service.getSnapshot()).toMatchObject({ playing: true, playingVariant: "combat", combatMode: true });
		await expect(service.playTrack("track-two", "normal")).rejects.toThrow();
		expect(service.getSnapshot()).toMatchObject({ trackId: "track-one", combatMode: true, playing: true }); service.dispose();
	});

});
