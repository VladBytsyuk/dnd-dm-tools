/** Decodes once and lets the audio renderer loop without restarting a media element. */
export class BufferedMusic extends EventTarget {
	private readonly gain: GainNode;
	private source: AudioBufferSourceNode | null = null;
	private offset = 0;
	private startedAt = 0;
	private looping = false;
	private level = 1;
	private silent = false;
	private timer: ReturnType<typeof setInterval> | null = null;
	private revision = 0;
	private disposed = false;
	ended = false;

	static async load(data: ArrayBuffer): Promise<BufferedMusic> {
		const context = new AudioContext();
		try { return new BufferedMusic(context, await context.decodeAudioData(data)); }
		catch (error) { void context.close().catch(() => {}); throw error; }
	}

	constructor(private readonly context: AudioContext, private buffer: AudioBuffer | null) {
		super();
		this.gain = context.createGain();
		this.gain.connect(context.destination);
	}

	get duration(): number { return this.buffer?.duration ?? 0; }
	get currentTime(): number {
		const time = this.offset + (this.source ? this.context.currentTime - this.startedAt : 0);
		return this.loop && this.duration ? time % this.duration : Math.min(time, this.duration);
	}
	set currentTime(time: number) {
		const playing = !!this.source;
		this.pause();
		this.offset = Number.isFinite(time) ? Math.max(0, Math.min(time, this.duration)) : 0;
		this.ended = false;
		if (playing) this.start();
		this.dispatchEvent(new Event('timeupdate'));
	}
	get loop(): boolean { return this.looping; }
	set loop(value: boolean) {
		this.offset = this.currentTime;
		this.startedAt = this.context.currentTime;
		this.looping = value;
		if (this.source) this.source.loop = value;
	}
	get volume(): number { return this.level; }
	set volume(value: number) { this.level = value; this.applyVolume(); }
	get muted(): boolean { return this.silent; }
	set muted(value: boolean) { this.silent = value; this.applyVolume(); }

	async play(): Promise<void> {
		if (this.disposed) throw new Error('Аудиобуфер уже выгружен');
		if (this.source) return;
		const revision = ++this.revision;
		await this.context.resume();
		if (revision !== this.revision || this.disposed) return;
		if (this.offset >= this.duration) this.offset = 0;
		this.start();
	}

	pause(): void {
		this.revision++;
		this.offset = this.currentTime;
		if (this.source) {
			this.source.onended = null;
			this.source.stop();
			this.source.disconnect();
			this.source = null;
		}
		this.stopTimer();
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.pause();
		this.buffer = null;
		this.gain.disconnect();
		void this.context.close().catch(() => {});
	}

	private start(): void {
		if (!this.buffer || this.disposed) return;
		const source = this.context.createBufferSource();
		source.buffer = this.buffer;
		source.loop = this.loop;
		source.connect(this.gain);
		source.onended = () => {
			if (this.source !== source) return;
			source.disconnect();
			this.source = null;
			this.offset = this.duration;
			this.ended = true;
			this.stopTimer();
			this.dispatchEvent(new Event('ended'));
		};
		source.start(0, this.offset);
		this.source = source;
		this.startedAt = this.context.currentTime;
		this.ended = false;
		// This timer updates the UI only; looping runs entirely on the audio clock.
		this.timer = setInterval(() => this.dispatchEvent(new Event('timeupdate')), 100);
	}

	private stopTimer(): void {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}
	private applyVolume(): void { this.gain.gain.value = this.muted ? 0 : this.volume; }
}
