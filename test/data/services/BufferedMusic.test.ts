import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BufferedMusic } from 'src/data/services/BufferedMusic';

function setup() {
	const buffer = { duration: 1 } as AudioBuffer;
	const gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() };
	const sources: Array<ReturnType<typeof createSource>> = [];
	function createSource() {
		const source = {
			buffer: null as AudioBuffer | null, loop: false,
			onended: null as (() => void) | null,
			connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(),
		};
		sources.push(source);
		return source;
	}
	const context = {
		currentTime: 0, destination: {}, createGain: vi.fn(() => gain),
		createBufferSource: vi.fn(createSource), decodeAudioData: vi.fn(async () => buffer),
		resume: vi.fn(async () => {}), close: vi.fn(async () => {}),
	};
	vi.stubGlobal('AudioContext', vi.fn(() => context));
	return { context, buffer, gain, sources, load: () => BufferedMusic.load(new ArrayBuffer(4)) };
}

describe('BufferedMusic', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

	it('decodes once and loops on the audio clock without waiting for JavaScript timers', async () => {
		const test = setup();
		const music = await test.load();
		const ended = vi.fn();
		music.addEventListener('ended', ended);
		music.loop = true;
		await music.play();
		test.context.currentTime = 1000.25;
		expect(music.currentTime).toBe(0.25);
		expect(test.sources).toHaveLength(1);
		expect(test.sources[0].buffer).toBe(test.buffer);
		expect(test.sources[0].loop).toBe(true);
		expect(test.sources[0].start).toHaveBeenCalledOnce();
		expect(test.sources[0].start).toHaveBeenCalledWith(0, 0);
		expect(test.context.decodeAudioData).toHaveBeenCalledOnce();
		expect(ended).not.toHaveBeenCalled();
		music.dispose();
	});

	it('pauses and resumes from the current loop position', async () => {
		const test = setup();
		const music = await test.load();
		music.loop = true;
		await music.play();
		test.context.currentTime = 2.75;
		music.pause();
		expect(music.currentTime).toBe(0.75);
		expect(test.sources[0].stop).toHaveBeenCalledOnce();
		expect(test.sources[0].onended).toBeNull();
		test.context.currentTime = 9;
		expect(music.currentTime).toBe(0.75);
		await music.play();
		expect(test.sources[1].start).toHaveBeenCalledWith(0, 0.75);
		test.context.currentTime = 9.5;
		expect(music.currentTime).toBe(0.25);
		music.dispose();
	});

	it('seeks within a decoded buffer without decoding it again', async () => {
		const test = setup();
		const music = await test.load();
		await music.play();
		music.currentTime = 0.6;
		expect(test.sources[0].stop).toHaveBeenCalledOnce();
		expect(test.sources[1].start).toHaveBeenCalledWith(0, 0.6);
		expect(music.currentTime).toBe(0.6);
		expect(test.context.decodeAudioData).toHaveBeenCalledOnce();
		music.dispose();
	});

	it('changes loop mode on the same source and preserves its position', async () => {
		const test = setup();
		const music = await test.load();
		music.loop = true;
		await music.play();
		test.context.currentTime = 3.25;
		music.loop = false;
		expect(music.currentTime).toBe(0.25);
		expect(test.sources[0].loop).toBe(false);
		test.context.currentTime = 3.5;
		expect(music.currentTime).toBe(0.5);
		music.loop = true;
		expect(test.sources).toHaveLength(1);
		expect(test.sources[0].loop).toBe(true);
		music.dispose();
	});

	it('emits ended for a non-looping source and can restart it from the beginning', async () => {
		const test = setup();
		const music = await test.load();
		const ended = vi.fn();
		music.addEventListener('ended', ended);
		await music.play();
		test.sources[0].onended!();
		expect(music.ended).toBe(true);
		expect(music.currentTime).toBe(1);
		expect(ended).toHaveBeenCalledOnce();
		await music.play();
		expect(test.sources[1].start).toHaveBeenCalledWith(0, 0);
		expect(music.ended).toBe(false);
		music.dispose();
	});

	it('keeps the end position when seeking to the end of a non-looping track', async () => {
		const test = setup();
		const music = await test.load();
		await music.play();
		music.currentTime = 10;
		expect(test.sources[1].start).toHaveBeenCalledWith(0, 1);
		expect(music.currentTime).toBe(1);
		music.dispose();
	});

	it('applies volume and mute through gain without replacing the source', async () => {
		const test = setup();
		const music = await test.load();
		await music.play();
		music.volume = 0.4;
		expect(test.gain.gain.value).toBe(0.4);
		music.muted = true;
		music.volume = 0.2;
		expect(test.gain.gain.value).toBe(0);
		music.muted = false;
		expect(test.gain.gain.value).toBe(0.2);
		expect(test.sources).toHaveLength(1);
		music.dispose();
	});

	it('stops timeline notifications and releases nodes and the context on dispose', async () => {
		const test = setup();
		const music = await test.load();
		const update = vi.fn();
		music.addEventListener('timeupdate', update);
		await music.play();
		vi.advanceTimersByTime(100);
		expect(update).toHaveBeenCalledOnce();
		music.dispose();
		music.dispose();
		vi.advanceTimersByTime(1000);
		expect(update).toHaveBeenCalledOnce();
		expect(test.sources[0].stop).toHaveBeenCalledOnce();
		expect(test.sources[0].disconnect).toHaveBeenCalledOnce();
		expect(test.gain.disconnect).toHaveBeenCalledOnce();
		expect(test.context.close).toHaveBeenCalledOnce();
		expect(music.duration).toBe(0);
		await expect(music.play()).rejects.toThrow('Аудиобуфер уже выгружен');
	});

	it('does not start after a pending resume was paused or disposed', async () => {
		const test = setup();
		const music = await test.load();
		let resume!: () => void;
		test.context.resume.mockImplementationOnce(() => new Promise<void>((resolve) => { resume = resolve; }));
		const pending = music.play();
		music.pause();
		resume();
		await pending;
		expect(test.sources).toHaveLength(0);
		test.context.resume.mockImplementationOnce(() => new Promise<void>((resolve) => { resume = resolve; }));
		const disposed = music.play();
		music.dispose();
		resume();
		await disposed;
		expect(test.sources).toHaveLength(0);
	});

	it('closes the context when decoding fails', async () => {
		const test = setup();
		test.context.decodeAudioData.mockRejectedValueOnce(new Error('Unsupported audio'));
		await expect(test.load()).rejects.toThrow('Unsupported audio');
		expect(test.context.close).toHaveBeenCalledOnce();
		expect(test.sources).toHaveLength(0);
	});
});
