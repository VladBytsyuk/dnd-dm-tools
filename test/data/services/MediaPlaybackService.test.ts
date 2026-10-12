import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPlaybackService } from 'src/data/services/MediaPlaybackService';
import type { MediaState } from 'src/domain/models/media/MediaState';

class FakeAudio {
	static instances: FakeAudio[] = [];
	volume = 1;
	loop = false;
	ended = false;
	paused = true;
	play = vi.fn(async () => { this.paused = false; });
	pause = vi.fn(() => { this.paused = true; });
	load = vi.fn();
	private listeners = new Map<string, Array<() => void>>();

	constructor(public src: string) {
		FakeAudio.instances.push(this);
	}

	addEventListener(event: string, listener: () => void): void {
		this.listeners.set(event, [...this.listeners.get(event) ?? [], listener]);
	}

	removeAttribute(name: string): void {
		if (name === 'src') this.src = '';
	}

	end(): void {
		this.ended = true;
		for (const listener of this.listeners.get('ended') ?? []) listener();
	}
}

function makeState(): MediaState {
	return {
		audioFiles: [
			{ id: 'calm', path: 'Audio/calm.mp3', alias: 'Таверна' },
			{ id: 'battle', path: 'Audio/battle.mp3', alias: 'Бой' },
			{ id: 'next', path: 'Audio/next.mp3', alias: 'Дорога' },
			{ id: 'effect', path: 'Audio/effect.mp3', alias: 'Дверь' },
		],
		playlists: [{ id: 'list', name: 'Сессия', items: [
			{ id: 'one', normalAudioId: 'calm', combatAudioId: 'battle', loop: true },
			{ id: 'two', normalAudioId: 'next', combatAudioId: null, loop: false },
		] }],
		adventures: [], musicVolume: 0.6, effectsVolume: 0.3,
		activeAdventureId: null, activeSceneId: null,
	};
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
		expect(FakeAudio.instances[2].src).toContain('next.mp3');
		service.dispose();
	});

	it('uses the combat source for tracker combat and restores manual selection', async () => {
		const service = makeService(makeState());
		await service.play('list');
		await service.setManualCombat(true);
		expect(FakeAudio.instances[1].src).toContain('battle.mp3');
		await service.setTrackerCombat(true);
		await service.setManualCombat(false);
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
});
