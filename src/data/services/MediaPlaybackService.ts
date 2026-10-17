import type { App } from 'obsidian';
import type { AudioAsset, MediaState, MediaTrack, Playlist, PlaylistItem } from '../../domain/models/media/MediaState';

type Variant = 'normal' | 'combat';
type Selection = { playlistId: string | null; itemId: string | null; trackId: string | null };

export interface PlaybackSnapshot {
	playlistId: string | null;
	itemId: string | null;
	trackId: string | null;
	playlistName: string | null;
	nextTrackName: string | null;
	hasPrevious: boolean;
	playing: boolean;
	paused: boolean;
	combatMode: boolean;
	combatModeLocked: boolean;
	manualCombat: boolean;
	trackerCombat: boolean;
	playingVariant: Variant;
	title: string | null;
	currentTime: number;
	duration: number;
	muted: boolean;
	volume: number;
}

const FADE_MS = 500;

/** Owns every audio element created during a plugin instance's lifetime. */
export class MediaPlaybackService {
	private readonly listeners = new Set<() => void>();
	private readonly effects = new Set<HTMLAudioElement>();
	private readonly musicListeners = new Map<HTMLAudioElement, Array<[string, EventListener]>>();
	private music: HTMLAudioElement | null = null;
	private outgoing: HTMLAudioElement | null = null;
	private sourceAudioId: string | null = null;
	private sourcePath: string | null = null;
	private selection: Selection = { playlistId: null, itemId: null, trackId: null };
	private paused = false;
	private stopped = false;
	private manualOverride: boolean | null = null;
	private trackerCombat = false;
	private playingVariant: Variant = 'normal';
	private muted = false;
	private volumeOverride: number | null = null;
	private fadeTimer: ReturnType<typeof setInterval> | null = null;
	private revision = 0;
	private disposed = false;

	constructor(
		private readonly app: App,
		private readonly getMediaState: () => MediaState,
		private readonly onError: (error: Error) => void = () => {},
	) {}

	getSnapshot(): PlaybackSnapshot {
		const playlist = this.getSelectedPlaylist();
		const item = this.getSelectedItem();
		const track = this.getTrack(this.selection.trackId);
		const asset = this.getSelectedAsset();
		const index = playlist?.items.findIndex((entry) => entry.id === item?.id) ?? -1;
		const nextItem = index >= 0 ? playlist?.items[index + 1] : undefined;
		const nextTrack = nextItem?.trackId ? this.getTrack(nextItem.trackId) : undefined;
		return {
			...this.selection,
			playlistName: playlist?.name ?? null,
			nextTrackName: nextTrack?.name ?? null,
			hasPrevious: index > 0,
			playing: !!this.music && !this.paused && !this.stopped && !this.music.ended,
			paused: !!this.music && this.paused,
			combatMode: this.combatMode(),
			combatModeLocked: this.isCombatOnly(track),
			manualCombat: this.manualOverride === true,
			trackerCombat: this.trackerCombat,
			playingVariant: this.playingVariant,
			title: track?.name ?? asset?.alias ?? (asset ? asset.path.split('/').pop() ?? asset.path : null),
			currentTime: this.finiteTime(this.music?.currentTime),
			duration: this.finiteTime(this.music?.duration),
			muted: this.muted,
			volume: this.musicVolume(),
		};
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	async play(playlistId: string, itemId?: string): Promise<void> {
		this.assertActive();
		const playlist = this.getMediaState().playlists.find((entry) => entry.id === playlistId);
		if (!playlist) throw new Error('Плейлист не найден');
		const item = itemId ? playlist.items.find((entry) => entry.id === itemId) : playlist.items[0];
		if (!item) throw new Error('Элемент плейлиста не найден');
		await this.replaceMusic({ playlistId, itemId: item.id, trackId: item.trackId }, false, false);
	}

	async playTrack(trackId: string, variant?: Variant): Promise<void> {
		this.assertActive();
		const track = this.getTrack(trackId);
		if (!track) throw new Error('Трек не найден');
		const oldOverride = this.manualOverride;
		const combatLocked = this.isCombatOnly(track) || this.isCombatOnly(this.getTrack(this.selection.trackId));
		if (variant && !combatLocked) {
			this.manualOverride = variant === 'combat';
		}
		try { await this.replaceMusic({ playlistId: null, itemId: null, trackId }, false, false); }
		catch (error) { this.manualOverride = oldOverride; this.emit(); throw error; }
	}

	/** Following a scene never starts a paused, stopped or empty player. */
	async followScene(adventureId: string, sceneId: string): Promise<void> {
		const before = this.getSnapshot();
		if (!before.playing) return;
		const state = this.getMediaState();
		const adventure = state.adventures.find((entry) => entry.id === adventureId);
		const scene = adventure?.scenes.find((entry) => entry.id === sceneId);
		if (!scene?.trackId || before.trackId === scene.trackId) return;
		const playlist = state.playlists.find((entry) => entry.id === adventure?.playlistId);
		const item = playlist?.items.find((entry) => entry.trackId === scene.trackId);
		if (playlist && item) await this.play(playlist.id, item.id);
		else await this.playTrack(scene.trackId);
	}

	pause(): void {
		if (!this.music || this.paused || this.stopped) return;
		this.revision++;
		this.finishFade();
		this.music.pause();
		this.paused = true;
		this.emit();
	}

	async resume(): Promise<void> {
		this.assertActive();
		if (!this.music && (this.selection.itemId || this.selection.trackId)) {
			await this.replaceMusic(this.selection, false, false);
			return;
		}
		if (!this.music || (!this.paused && !this.stopped)) return;
		const music = this.music;
		const revision = ++this.revision;
		try {
			await music.play();
		} catch (error) {
			throw new Error(`Не удалось продолжить воспроизведение: ${this.errorMessage(error)}`);
		}
		if (revision !== this.revision || this.disposed) return;
		this.paused = false;
		this.stopped = false;
		music.volume = this.effectiveMusicVolume();
		this.emit();
	}

	stop(): void {
		this.revision++;
		this.finishFade();
		this.music?.pause();
		if (this.music) this.music.currentTime = 0;
		this.paused = false;
		this.stopped = true;
		this.emit();
	}

	/** Unload the selection and all music resources. Effects continue until dispose. */
	clear(): void {
		this.revision++;
		this.finishFade();
		this.releaseMusic(this.music);
		this.music = null;
		this.sourceAudioId = null;
		this.sourcePath = null;
		this.selection = { playlistId: null, itemId: null, trackId: null };
		this.paused = false;
		this.stopped = false;
		this.emit();
	}

	async next(): Promise<void> { await this.move(1); }
	async previous(): Promise<void> { await this.move(-1); }

	seek(time: number): void {
		if (!this.music || !Number.isFinite(time)) return;
		const duration = this.finiteTime(this.music.duration);
		this.music.currentTime = Math.max(0, Math.min(time, duration || time));
		this.emit();
	}

	setMuted(value: boolean): void {
		this.muted = value;
		this.applyVolumes();
		this.emit();
	}

	/** Runtime volume; persist MediaState.musicVolume in the caller when desired. */
	setVolume(value: number): void {
		this.volumeOverride = this.clampVolume(value);
		this.applyVolumes();
		this.emit();
	}

	async setManualCombat(value: boolean): Promise<void> {
		this.assertActive();
		if (this.isCombatOnly(this.getTrack(this.selection.trackId))) return;
		const oldOverride = this.manualOverride;
		this.manualOverride = value;
		try { await this.refreshSelectedSource(); }
		catch (error) {
			this.manualOverride = oldOverride;
			this.emit();
			throw error;
		}
		this.emit();
	}

	async setTrackerCombat(value: boolean): Promise<void> {
		this.assertActive();
		if (this.trackerCombat === value) return;
		const oldTracker = this.trackerCombat;
		const oldOverride = this.manualOverride;
		this.trackerCombat = value;
		// Preserve the previous mode until the combat-only track is replaced.
		this.manualOverride = this.isCombatOnly(this.getTrack(this.selection.trackId)) ? oldOverride ?? oldTracker : null;
		try { await this.refreshSelectedSource(); }
		catch (error) {
			this.trackerCombat = oldTracker;
			this.manualOverride = oldOverride;
			this.emit();
			throw error;
		}
		this.emit();
	}

	async playEffect(audioId: string): Promise<void> {
		this.assertActive();
		const asset = this.findAsset(audioId);
		if (!asset) throw new Error('Звуковой файл не найден');
		const audio = new Audio(this.resourcePath(asset));
		audio.volume = this.effectsVolume();
		const ended = () => this.releaseEffect(audio);
		audio.addEventListener('ended', ended, { once: true });
		this.effects.add(audio);
		try { await audio.play(); }
		catch (error) {
			this.releaseEffect(audio);
			throw new Error(`Не удалось воспроизвести эффект: ${this.errorMessage(error)}`);
		}
		if (this.disposed) this.releaseEffect(audio);
	}

	/** Refresh persisted edits, volume changes, and renamed vault resources. */
	onMediaChanged(): void {
		if (this.disposed) return;
		this.volumeOverride = null;
		this.applyVolumes();
		const item = this.getSelectedItem();
		if (item?.trackId) this.selection.trackId = item.trackId;
		if (!this.music) { this.emit(); return; }
		try {
			const source = this.resolveSource(this.selection);
			if (source.asset.id !== this.sourceAudioId || source.asset.path !== this.sourcePath || source.variant !== this.playingVariant) {
				void this.refreshSelectedSource().catch((error) => {
					this.clear();
					this.report(error);
				});
			}
		} catch (error) {
			this.clear();
			this.report(error);
			return;
		}
		this.music.loop = this.resolveSource(this.selection).loop;
		this.emit();
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.clear();
		for (const effect of [...this.effects]) this.releaseEffect(effect);
		this.listeners.clear();
	}

	private async move(direction: number): Promise<void> {
		this.assertActive();
		const playlist = this.getSelectedPlaylist();
		if (!playlist) throw new Error('Плейлист не выбран');
		const index = playlist.items.findIndex((item) => item.id === this.selection.itemId);
		const item = playlist.items[index + direction];
		if (item) await this.replaceMusic({ playlistId: playlist.id, itemId: item.id, trackId: item.trackId }, false, false);
	}

	private async refreshSelectedSource(): Promise<void> {
		if (!this.music) return;
		const source = this.resolveSource(this.selection);
		if (source.asset.id === this.sourceAudioId && source.asset.path === this.sourcePath && source.variant === this.playingVariant) return;
		await this.replaceMusic(this.selection, this.paused || this.stopped, true);
	}

	private async replaceMusic(selection: Selection, startPaused: boolean, preservePosition: boolean): Promise<void> {
		const source = this.resolveSource(selection);
		const audio = new Audio(this.resourcePath(source.asset));
		audio.loop = source.loop;
		audio.muted = this.muted;
		audio.volume = startPaused ? this.effectiveMusicVolume() : 0;
		if (preservePosition && this.music) {
			const oldTime = this.finiteTime(this.music.currentTime);
			const oldDuration = this.finiteTime(this.music.duration);
			const applyPosition = () => {
				const newDuration = this.finiteTime(audio.duration);
				audio.currentTime = oldDuration && newDuration
					? Math.min(newDuration, oldTime / oldDuration * newDuration)
					: oldTime;
			};
			try { applyPosition(); } catch { audio.addEventListener('loadedmetadata', applyPosition, { once: true }); }
		}
		const revision = ++this.revision;
		if (!startPaused) {
			try { await audio.play(); }
			catch (error) {
				this.releaseMusic(audio);
				throw new Error(`Не удалось воспроизвести музыку: ${this.errorMessage(error)}`);
			}
		}
		if (revision !== this.revision || this.disposed) { this.releaseMusic(audio); return; }
		this.finishFade();
		const old = this.music;
		this.music = audio;
		this.selection = selection;
		this.sourceAudioId = source.asset.id;
		this.sourcePath = source.asset.path;
		this.playingVariant = source.variant;
		this.paused = startPaused && !this.stopped;
		this.stopped = startPaused && this.stopped;
		this.bindMusicListeners(audio);
		if (startPaused) this.releaseMusic(old);
		else this.fadeBetween(old, audio);
		this.emit();
	}

	private bindMusicListeners(audio: HTMLAudioElement): void {
		const events: Array<[string, EventListener]> = [
			['timeupdate', () => { if (this.music === audio) this.emit(); }],
			['loadedmetadata', () => { if (this.music === audio) this.emit(); }],
			['durationchange', () => { if (this.music === audio) this.emit(); }],
			['ended', () => {
				if (this.music !== audio || audio.loop) return;
				const playlist = this.getSelectedPlaylist();
				const index = playlist?.items.findIndex((entry) => entry.id === this.selection.itemId) ?? -1;
				if (playlist && index >= 0 && index < playlist.items.length - 1) {
					void this.next().catch((error) => { this.stop(); this.report(error); });
				} else this.stop();
			}],
		];
		for (const [name, listener] of events) audio.addEventListener(name, listener);
		this.musicListeners.set(audio, events);
	}

	private fadeBetween(old: HTMLAudioElement | null, current: HTMLAudioElement): void {
		this.outgoing = old;
		const started = Date.now();
		this.fadeTimer = setInterval(() => {
			const progress = Math.min(1, (Date.now() - started) / FADE_MS);
			current.volume = this.effectiveMusicVolume() * progress;
			if (old) old.volume = this.effectiveMusicVolume() * (1 - progress);
			if (progress >= 1) this.finishFade();
		}, 25);
	}

	private finishFade(): void {
		if (this.fadeTimer) clearInterval(this.fadeTimer);
		this.fadeTimer = null;
		this.releaseMusic(this.outgoing);
		this.outgoing = null;
		if (this.music) this.music.volume = this.effectiveMusicVolume();
	}

	private releaseMusic(audio: HTMLAudioElement | null): void {
		if (!audio) return;
		for (const [name, listener] of this.musicListeners.get(audio) ?? []) audio.removeEventListener(name, listener);
		this.musicListeners.delete(audio);
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
		return this.getMediaState().playlists.find((entry) => entry.id === this.selection.playlistId);
	}

	private getSelectedItem(): PlaylistItem | undefined {
		return this.getSelectedPlaylist()?.items.find((entry) => entry.id === this.selection.itemId);
	}

	private getTrack(trackId: string | null): MediaTrack | undefined {
		return this.getMediaState().tracks.find((track) => track.id === trackId);
	}

	private getSelectedAsset(): AudioAsset | undefined {
		try { return this.resolveSource(this.selection).asset; } catch { return undefined; }
	}

	private resolveSource(selection: Selection): { asset: AudioAsset; loop: boolean; variant: Variant } {
		const item = selection.playlistId
			? this.getMediaState().playlists.find((playlist) => playlist.id === selection.playlistId)?.items.find((entry) => entry.id === selection.itemId)
			: undefined;
		if (selection.playlistId && !item) throw new Error('Элемент плейлиста не найден');
		const track = this.getTrack(selection.trackId ?? item?.trackId ?? null);
		if ((selection.trackId || item?.trackId) && !track) throw new Error('Трек не найден');
		const normalId = track?.normalAudioId;
		const combatId = track?.combatAudioId;
		const normal = this.findAsset(normalId ?? null);
		if (this.combatMode(track) && combatId) {
			const combat = this.findAsset(combatId);
			if (combat && this.app.vault.getFileByPath(combat.path)) return { asset: combat, loop: track?.loop ?? true, variant: 'combat' };
		}
		if (!normal) throw new Error('Обычный звуковой файл не найден');
		return { asset: normal, loop: track?.loop ?? true, variant: 'normal' };
	}

	private findAsset(id: string | null): AudioAsset | undefined {
		return this.getMediaState().audioFiles.find((asset) => asset.id === id);
	}

	private resourcePath(asset: AudioAsset): string {
		const file = this.app.vault.getFileByPath(asset.path);
		if (!file) throw new Error(`Аудиофайл отсутствует в хранилище: ${asset.path}`);
		return this.app.vault.getResourcePath(file);
	}

	private isCombatOnly(track: MediaTrack | undefined): boolean {
		return !!track?.combatAudioId && !track.normalAudioId;
	}

	private combatMode(track = this.getTrack(this.selection.trackId)): boolean {
		return this.isCombatOnly(track) || (this.manualOverride ?? this.trackerCombat);
	}

	private musicVolume(): number {
		return this.volumeOverride ?? this.clampVolume(this.getMediaState().musicVolume);
	}

	private effectiveMusicVolume(): number { return this.muted ? 0 : this.musicVolume(); }
	private effectsVolume(): number { return this.clampVolume(this.getMediaState().effectsVolume); }
	private applyVolumes(): void {
		if (this.music) { this.music.muted = this.muted; if (!this.fadeTimer) this.music.volume = this.effectiveMusicVolume(); }
		if (this.outgoing) this.outgoing.muted = this.muted;
		for (const effect of this.effects) effect.volume = this.effectsVolume();
	}
	private clampVolume(value: number): number { return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1; }
	private finiteTime(value: number | undefined): number { return value !== undefined && Number.isFinite(value) && value > 0 ? value : 0; }
	private assertActive(): void { if (this.disposed) throw new Error('Плеер уже выгружен'); }
	private errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
	private report(error: unknown): void { this.onError(error instanceof Error ? error : new Error(String(error))); }
	private emit(): void { for (const listener of this.listeners) listener(); }
}
