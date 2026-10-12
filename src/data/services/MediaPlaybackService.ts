import type { App } from 'obsidian';
import type { AudioAsset, MediaState, Playlist, PlaylistItem } from '../../domain/models/media/MediaState';

export interface PlaybackSnapshot {
	playlistId: string | null;
	itemId: string | null;
	playing: boolean;
	paused: boolean;
	combatMode: boolean;
	manualCombat: boolean;
	title: string | null;
}

const FADE_MS = 500;

/** Owns the audio elements for one loaded plugin instance. */
export class MediaPlaybackService {
	private readonly listeners = new Set<() => void>();
	private readonly effects = new Set<HTMLAudioElement>();
	private music: HTMLAudioElement | null = null;
	private outgoing: HTMLAudioElement | null = null;
	private sourceAudioId: string | null = null;
	private sourcePath: string | null = null;
	private playlistId: string | null = null;
	private itemId: string | null = null;
	private paused = false;
	private manualCombat = false;
	private trackerCombat = false;
	private fadeTimer: ReturnType<typeof setInterval> | null = null;
	private revision = 0;
	private disposed = false;

	constructor(private readonly app: App, private readonly getMediaState: () => MediaState) {}

	getSnapshot(): PlaybackSnapshot {
		const asset = this.getSelectedAsset();
		return {
			playlistId: this.playlistId,
			itemId: this.itemId,
			playing: this.music !== null && !this.paused && !this.music.ended,
			paused: this.music !== null && this.paused,
			combatMode: this.trackerCombat || this.manualCombat,
			manualCombat: this.manualCombat,
			title: asset?.alias || (asset ? asset.path.split('/').pop() ?? asset.path : null),
		};
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	async play(playlistId: string, itemId?: string): Promise<void> {
		this.assertActive();
		const playlist = this.getMediaState().playlists.find((value) => value.id === playlistId);
		if (!playlist) throw new Error('Плейлист не найден');
		const item = itemId ? playlist.items.find((value) => value.id === itemId) : playlist.items[0];
		if (!item) throw new Error('Элемент плейлиста не найден');
		await this.replaceMusic(playlist, item, false);
	}

	pause(): void {
		if (!this.music || this.paused) return;
		this.revision++;
		this.finishFade();
		this.music.pause();
		this.paused = true;
		this.emit();
	}

	async resume(): Promise<void> {
		this.assertActive();
		if (!this.music && this.playlistId && this.itemId) {
			await this.play(this.playlistId, this.itemId);
			return;
		}
		if (!this.music || !this.paused) return;
		const revision = ++this.revision;
		try {
			await this.music.play();
		} catch (error) {
			throw new Error(`Не удалось продолжить воспроизведение: ${this.errorMessage(error)}`);
		}
		if (revision !== this.revision || this.disposed) return;
		this.paused = false;
		this.music.volume = this.musicVolume();
		this.emit();
	}

	stop(): void {
		this.revision++;
		this.finishFade();
		this.releaseMusic(this.music);
		this.music = null;
		this.sourceAudioId = null;
		this.sourcePath = null;
		this.playlistId = null;
		this.itemId = null;
		this.paused = false;
		this.emit();
	}

	async next(): Promise<void> {
		await this.move(1);
	}

	async previous(): Promise<void> {
		await this.move(-1);
	}

	async setManualCombat(value: boolean): Promise<void> {
		this.assertActive();
		if (this.manualCombat === value) return;
		const previous = this.manualCombat;
		this.manualCombat = value;
		try {
			await this.refreshSelectedSource();
		} catch (error) {
			this.manualCombat = previous;
			this.emit();
			throw error;
		}
		this.emit();
	}

	async setTrackerCombat(value: boolean): Promise<void> {
		this.assertActive();
		if (this.trackerCombat === value) return;
		const previous = this.trackerCombat;
		this.trackerCombat = value;
		try {
			await this.refreshSelectedSource();
		} catch (error) {
			this.trackerCombat = previous;
			this.emit();
			throw error;
		}
		this.emit();
	}

	async playEffect(audioId: string): Promise<void> {
		this.assertActive();
		const asset = this.getMediaState().audioFiles.find((value) => value.id === audioId);
		if (!asset) throw new Error('Звуковой файл не найден');
		const audio = new Audio(this.resourcePath(asset));
		audio.volume = this.effectsVolume();
		audio.addEventListener('ended', () => this.releaseEffect(audio), { once: true });
		this.effects.add(audio);
		try {
			await audio.play();
		} catch (error) {
			this.releaseEffect(audio);
			throw new Error(`Не удалось воспроизвести эффект: ${this.errorMessage(error)}`);
		}
		if (this.disposed) this.releaseEffect(audio);
	}

	/** Call after persisted media changes (including vault rename and volume edits). */
	onMediaChanged(): void {
		if (this.disposed) return;
		for (const effect of this.effects) effect.volume = this.effectsVolume();
		if (this.music) this.music.volume = this.fadeTimer ? this.music.volume : this.musicVolume();
		const selected = this.getSelectedItem();
		if (this.music && !selected) {
			this.stop();
			return;
		}
		if (this.music && selected) {
			try {
				const asset = this.selectAsset(selected);
				if (!this.app.vault.getFileByPath(asset.path)) {
					this.stop();
					return;
				}
				if (asset.id !== this.sourceAudioId || asset.path !== this.sourcePath) {
					void this.refreshSelectedSource().catch(() => this.stop());
				}
			} catch {
				this.stop();
				return;
			}
		}
		this.emit();
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.stop();
		for (const effect of this.effects) this.releaseEffect(effect);
		this.listeners.clear();
	}

	private async move(direction: number): Promise<void> {
		this.assertActive();
		const playlist = this.getSelectedPlaylist();
		if (!playlist) throw new Error('Плейлист не выбран');
		const index = playlist.items.findIndex((item) => item.id === this.itemId);
		const next = playlist.items[index + direction];
		if (!next) return;
		await this.replaceMusic(playlist, next, false);
	}

	private async refreshSelectedSource(): Promise<void> {
		const playlist = this.getSelectedPlaylist();
		const item = this.getSelectedItem();
		if (!playlist || !item || !this.music) return;
		const asset = this.selectAsset(item);
		if (asset.id === this.sourceAudioId && asset.path === this.sourcePath) return;
		await this.replaceMusic(playlist, item, this.paused);
	}

	private async replaceMusic(playlist: Playlist, item: PlaylistItem, startPaused: boolean): Promise<void> {
		const asset = this.selectAsset(item);
		const audio = new Audio(this.resourcePath(asset));
		audio.loop = item.loop;
		audio.volume = startPaused ? this.musicVolume() : 0;
		const revision = ++this.revision;
		if (!startPaused) {
			try {
				await audio.play();
			} catch (error) {
				this.releaseMusic(audio);
				throw new Error(`Не удалось воспроизвести музыку: ${this.errorMessage(error)}`);
			}
		}
		if (revision !== this.revision || this.disposed) {
			this.releaseMusic(audio);
			return;
		}
		this.finishFade();
		const old = this.music;
		this.music = audio;
		this.sourceAudioId = asset.id;
		this.sourcePath = asset.path;
		this.playlistId = playlist.id;
		this.itemId = item.id;
		this.paused = startPaused;
		audio.addEventListener('ended', () => {
			if (this.music !== audio || audio.loop) return;
			this.releaseMusic(audio);
			this.music = null;
			this.paused = false;
			this.emit();
		});
		if (startPaused) this.releaseMusic(old);
		else this.fadeBetween(old, audio);
		this.emit();
	}

	private fadeBetween(old: HTMLAudioElement | null, current: HTMLAudioElement): void {
		this.outgoing = old;
		const started = Date.now();
		this.fadeTimer = setInterval(() => {
			const progress = Math.min(1, (Date.now() - started) / FADE_MS);
			current.volume = this.musicVolume() * progress;
			if (old) old.volume = this.musicVolume() * (1 - progress);
			if (progress >= 1) this.finishFade();
		}, 25);
	}

	private finishFade(): void {
		if (this.fadeTimer) clearInterval(this.fadeTimer);
		this.fadeTimer = null;
		this.releaseMusic(this.outgoing);
		this.outgoing = null;
		if (this.music) this.music.volume = this.musicVolume();
	}

	private releaseMusic(audio: HTMLAudioElement | null): void {
		if (!audio) return;
		audio.pause();
		audio.removeAttribute('src');
		audio.load();
	}

	private releaseEffect(audio: HTMLAudioElement): void {
		audio.pause();
		audio.removeAttribute('src');
		audio.load();
		this.effects.delete(audio);
	}

	private getSelectedPlaylist(): Playlist | undefined {
		return this.getMediaState().playlists.find((value) => value.id === this.playlistId);
	}

	private getSelectedItem(): PlaylistItem | undefined {
		return this.getSelectedPlaylist()?.items.find((value) => value.id === this.itemId);
	}

	private getSelectedAsset(): AudioAsset | undefined {
		const item = this.getSelectedItem();
		if (!item) return undefined;
		try { return this.selectAsset(item); } catch { return undefined; }
	}

	private selectAsset(item: PlaylistItem): AudioAsset {
		const state = this.getMediaState();
		const normal = state.audioFiles.find((value) => value.id === item.normalAudioId);
		if (!normal) throw new Error('Обычный звуковой файл не найден');
		if (this.trackerCombat || this.manualCombat) {
			const combat = state.audioFiles.find((value) => value.id === item.combatAudioId);
			if (combat && this.app.vault.getFileByPath(combat.path)) return combat;
		}
		return normal;
	}

	private resourcePath(asset: AudioAsset): string {
		const file = this.app.vault.getFileByPath(asset.path);
		if (!file) throw new Error(`Аудиофайл отсутствует в хранилище: ${asset.path}`);
		return this.app.vault.getResourcePath(file);
	}

	private musicVolume(): number {
		return this.clampVolume(this.getMediaState().musicVolume);
	}

	private effectsVolume(): number {
		return this.clampVolume(this.getMediaState().effectsVolume);
	}

	private clampVolume(value: number): number {
		return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
	}

	private assertActive(): void {
		if (this.disposed) throw new Error('Плеер уже выгружен');
	}

	private errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}

	private emit(): void {
		for (const listener of this.listeners) listener();
	}
}
