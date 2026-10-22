import { addIcon, FileSystemAdapter, Platform, Plugin, TFile, type Menu } from 'obsidian';
import { PluginNotice as Notice } from "src/ui/PluginNotice";
import { getCurrentTheme, registerThemeChangeListener, Theme } from './ui/theme';
import owlbearBlackLogo from 'logo/owlbear_logo_black.svg';
import owlbearWhiteLogo from 'logo/owlbear_logo_white.svg';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerMediaMdCodeBlockProcessors } from './ui/components/processor/media_md_code_block_processor';
import { registerNoteLinkProcessor } from './ui/components/processor/note_link_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import DB from './data/database/DB';
import { InitiativeTrackerPanel } from './ui/components/sidepanel/side_panel_initiative_tracker';
import { EncounterManager } from './domain/models/encounter/EncounterManager';
import type { Encounter } from './domain/models/encounter/Encounter';
import { ArsenalFeature } from './ui/components/feature/ArsenalFeature';
import type { BaseFeature } from './ui/components/feature/BaseFeature';
import { BestiaryFeature } from './ui/components/feature/BestiaryFeature';
import { SpellbookFeature } from './ui/components/feature/SpellbookFeature';
import { DmScreenFeature } from './ui/components/feature/DmScreenFeature';
import { ArmoryFeature } from './ui/components/feature/ArmoryFeature';
import { EquipmentFeature } from './ui/components/feature/EquipmentFeature';
import { ArtifactoryFeature } from './ui/components/feature/ArtifactoryFeature';
import { BackgroundFeature } from './ui/components/feature/BackgroundFeature';
import { FeatFeature } from './ui/components/feature/FeatFeature';
import { RaceFeature } from './ui/components/feature/RaceFeature';
import { ClassesFeature } from './ui/components/feature/ClassesFeature';
import { CharacterSheetFeature } from './ui/components/feature/CharacterSheetFeature';
import {
	type AssistantWorkspaceState,
} from './domain/models/assistant/AssistantWorkspace';
import {
	loadPluginSettings,
	type OwlbearSyncSettings,
	type PluginSettingsState,
} from './domain/models/settings/PluginSettings';
import {
	createOwlbearSessionResetSnapshot,
	reuseOwlbearEncounterIdentity,
	type OwlbearEncounterSnapshot,
	type OwlbearSyncDiagnostics,
	type OwlbearTokenLink,
} from './domain/models/owlbear/OwlbearSync';
import { PanelManager } from './ui/components/sidepanel/PanelManager';
import type { PanelHost } from './ui/components/sidepanel/PanelHost';
import { OwlbearPreviewPanel } from './ui/components/sidepanel/OwlbearPreviewPanel';
import { createOwlbearAuthToken, OwlbearIntegrationServer, type OwlbearServerStatus } from './data/owlbear/OwlbearIntegrationServer';
import { OwlbearSettingsTab } from './ui/settings/OwlbearSettingsTab';
import { CLOUDFLARED_VERSION, CloudflaredInstaller, type CloudflaredInstallStatus } from './data/owlbear/CloudflaredInstaller';
import { CloudflareQuickTunnel, type OwlbearTunnelStatus } from './data/owlbear/CloudflareQuickTunnel';
import type { OwlbearPreviewSnapshot } from './domain/models/owlbear/OwlbearPreview';
import {
	isSupportedOwlbearPreviewFile,
	isSupportedOwlbearPreviewUrl,
	loadOwlbearPreviewDataUrl,
	loadOwlbearPreviewRemoteImage,
	loadOwlbearPreviewVaultImage,
	type OwlbearPreviewImage,
} from './data/owlbear/OwlbearPreviewImage';
import { resolveVaultImageFile } from './domain/utils/image_utils';
import { getOwlbearExtensionInstallUrl } from './data/owlbear/OwlbearExtensionHosting';
import { clearActiveOwlbearPreview } from './data/owlbear/OwlbearPreviewLifecycle';
import { createOwlbearPairingCode } from './data/owlbear/OwlbearPairing';
import { ManualEntityArchiveService, type ManualEntityImportReport } from './data/services';
import { PluginUpdateService } from './data/services/PluginUpdateService';
import { MediaPlaybackService } from './data/services/MediaPlaybackService';
import { createDefaultMediaState, updateVaultFilePath, type MediaState } from './domain/models/media/MediaState';
import { PlayerPanel, AdventuresPanel } from './ui/components/sidepanel/MediaPanels';
import { mediaItems, mediaPanel } from './domain/models/media/MediaLibrary';
import { McpEntities } from './data/mcp/McpEntities';
import { McpIntegrationServer, type McpRuntimeStatus, mcpUnavailableReason } from './data/mcp/McpIntegrationServer';
import { randomBytes } from 'crypto';

export type OwlbearRuntimeStatus = {
	cloudflared: CloudflaredInstallStatus;
	tunnel: OwlbearTunnelStatus;
};

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#database: DB;

	arsenalFeature: ArsenalFeature;
	armoryFeature: ArmoryFeature;
	equipmentFeature: EquipmentFeature;
	artifactoryFeature: ArtifactoryFeature;
	backgroundFeature: BackgroundFeature;
	featFeature: FeatFeature;
	raceFeature: RaceFeature;
	classesFeature: ClassesFeature;
	characterSheetFeature: CharacterSheetFeature | null = null;
	bestiaryFeature: BestiaryFeature;
	spellbookFeature: SpellbookFeature;
	dmScreenFeature: DmScreenFeature;
	private features: BaseFeature<any, any, any>[];
	private assistantWorkspace: AssistantWorkspaceState;
	private settings: PluginSettingsState;
	panelManager: PanelManager;
	private shouldResetLegacyViews = false;
	private owlbearServer: OwlbearIntegrationServer | null = null;
	private owlbearServerStatus: OwlbearServerStatus = { running: false, port: null, connected: false };
	private cloudflaredInstaller: CloudflaredInstaller | null = null;
	private cloudflaredBinaryPath: string | null = null;
	private owlbearTunnel: CloudflareQuickTunnel | null = null;
	private owlbearReadyNoticeShown = false;
	private activeOwlbearPreview: (OwlbearPreviewSnapshot & { dataUrl: string }) | null = null;
	private lastContextImageUrl: string | null = null;
	private owlbearStartPromise: Promise<void> | null = null;
	private owlbearRuntimeStatus: OwlbearRuntimeStatus = {
		cloudflared: { state: "checking", version: CLOUDFLARED_VERSION, platform: runtimePlatform(), arch: runtimeArchitecture() },
		tunnel: { state: "stopped" },
	};
	private readonly owlbearRuntimeListeners = new Set<() => void>();
	private pluginUpdateService: PluginUpdateService;
	private mediaPlayback: MediaPlaybackService;
	private readonly encounterManager = new EncounterManager({ name: "", participants: [] });
	private readonly mediaListeners = new Set<() => void>();
	private settingsSaveQueue: Promise<void> = Promise.resolve();
	private mediaUpdateQueue: Promise<void> = Promise.resolve();
	private mediaState: MediaState = createDefaultMediaState();
	private mcpServer: McpIntegrationServer | null = null;
	private mcpStatus: McpRuntimeStatus = { running: false, port: null };
	private mcpQueue: Promise<void> = Promise.resolve();
	private readonly mcpListeners = new Set<() => void>();
	private unloading = false;

	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		const loadResult = loadPluginSettings(await this.loadData());
		this.settings = loadResult.settings;
		this.#database = new DB(this.app, this.manifest);
		await this.#database.initialize();
		this.mediaState = this.#database.media.read();
		this.mediaPlayback = new MediaPlaybackService(this.app, () => this.mediaState, (error) => new Notice(error.message));
		this.assistantWorkspace = this.settings.workspace;
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
			const tracked = this.mediaState.audioFiles.some((audio) => audio.path === oldPath || audio.path.startsWith(`${oldPath}/`))
				|| [...this.mediaState.scenes, ...this.mediaState.adventures].some((item) => item.notePath && (item.notePath === oldPath || item.notePath.startsWith(`${oldPath}/`)));
			if (!tracked) return;
			void this.updateMedia((media) => Object.assign(media, updateVaultFilePath(media, oldPath, file.path))).catch((error) => {
				new Notice(error instanceof Error ? error.message : "Не удалось обновить путь файла.");
			});
		}));
		this.registerEvent(this.app.vault.on("delete", () => this.notifyMedia()));
		this.removeStaleOwlbearPreviewTab();
		this.shouldResetLegacyViews = loadResult.shouldResetLegacyViews;
		await this.resetOwlbearSnapshotForNewSession();
		const adapter = this.app.vault.adapter;
		const pluginDirectory = Platform.isDesktopApp && adapter instanceof FileSystemAdapter
			? [adapter.getBasePath(), this.app.vault.configDir, "plugins", this.manifest.id].join("/")
			: null;
		this.pluginUpdateService = new PluginUpdateService(this.manifest.id, this.manifest.version, pluginDirectory);
		this.addSettingTab(new OwlbearSettingsTab(this));

		await this.#initialize(() => {
			registerEncounterMdCodeBlockProcessor(
				this, 
				this.bestiaryFeature.repository!,
				this.dmScreenFeature.repository!,
				this.#uiEventListener,
			);
			registerMediaMdCodeBlockProcessors(this);
			registerNoteLinkProcessor(this, this.#uiEventListener);
			registerAddEncounterCommand(this);
			registerThemeChangeListener();
			this.registerOwlbearPreviewContextMenus();
			console.log("dnd-dm-tools has been loaded.");
		});
		if (this.settings.owlbearSync.enabled) void this.prepareCloudflared();
		if (this.settings.mcp.enabled) void this.retryMcp();
	}

	onunload() {
		this.unloading = true;
		void this.mcpServer?.stop();
		this.mediaPlayback?.dispose();
		this.cloudflaredInstaller?.dispose();
		void this.stopOwlbearIntegration();
		this.#dispose();
		console.log("dnd-dm-tools has been unloaded.");
	}

	async persistAssistantWorkspace(workspace: AssistantWorkspaceState): Promise<void> {
		this.assistantWorkspace = workspace;
		await this.updateSettings({ workspace });
	}

	getSettings(): PluginSettingsState {
		return this.settings;
	}

	getMediaState(): MediaState { return this.mediaState; }
	getMediaPlayback(): MediaPlaybackService { return this.mediaPlayback; }
	getEncounterManager(): EncounterManager { return this.encounterManager; }
	async addEncounterToTracker(encounter: Encounter): Promise<void> {
		this.encounterManager.addEncounter(encounter);
		await this.panelManager.openPanel("initiative-tracker");
	}
	subscribeMedia(listener: () => void): () => void {
		this.mediaListeners.add(listener);
		return () => this.mediaListeners.delete(listener);
	}
	private notifyMedia(): void {
		this.mediaPlayback.onMediaChanged();
		for (const listener of this.mediaListeners) listener();
	}
	updateMedia(change: (media: MediaState) => void, beforeWrite?: () => void): Promise<void> {
		const operation = this.mediaUpdateQueue.catch(() => {}).then(async () => {
			if (this.unloading) throw new Error("Плагин выгружается.");
			const media = structuredClone(this.mediaState);
			change(media);
			await this.#database.media.save(media, beforeWrite);
			this.mediaState = media;
			this.notifyMedia();
		});
		this.mediaUpdateQueue = operation;
		return operation;
	}
	private persistSettings(): Promise<void> {
		this.settingsSaveQueue = this.settingsSaveQueue.catch(() => {}).then(() => this.saveData(this.settings));
		return this.settingsSaveQueue;
	}
	async activateScene(adventureId: string | null, sceneId: string): Promise<void> {
		const adventure = this.mediaState.adventures.find((item) => item.id === adventureId);
		const scene = this.mediaState.scenes.find((item) => item.id === sceneId);
		if (!scene || (adventureId !== null && !adventure?.scenes.some((item) => item.id === sceneId))) throw new Error("Сцена не найдена.");
		await this.updateMedia((media) => {
			media.activeAdventureId = adventureId;
			media.activeSceneId = sceneId;
		});
		await this.mediaPlayback.followScene(adventureId, sceneId);
	}

	async openMediaUrl(url: string): Promise<void> {
		const item = mediaItems(this.mediaState).find((entry) => entry.url === url);
		if (item) await this.panelManager.openItem(mediaPanel(item.mediaRoute.kind), item);
	}
	async openMediaNote(path: string): Promise<void> {
		const file = this.app.vault.getFileByPath(path);
		if (!file) throw new Error(`Заметка не найдена: ${path}`);
		await this.app.workspace.getLeaf("tab").openFile(file);
	}

	getMcpRuntimeStatus(): McpRuntimeStatus { return this.mcpStatus; }
	getMcpUnavailableReason(): string | null { return mcpUnavailableReason(Platform.isDesktopApp); }
	subscribeMcpRuntimeStatus(listener: () => void): () => void {
		this.mcpListeners.add(listener);
		return () => this.mcpListeners.delete(listener);
	}
	private setMcpStatus(status: McpRuntimeStatus): void {
		this.mcpStatus = status;
		for (const listener of this.mcpListeners) listener();
	}
	async setMcpEnabled(enabled: boolean): Promise<void> {
		if (enabled && this.getMcpUnavailableReason()) throw new Error(this.getMcpUnavailableReason()!);
		if (!enabled) {
			// Revoke access immediately, even while settings persistence is queued.
			const server = this.mcpServer;
			this.mcpServer = null;
			const stopped = server?.stop();
			this.mcpQueue = Promise.allSettled([this.mcpQueue, stopped]).then(() => {});
		}
		await this.updateSettings({ mcp: { ...this.settings.mcp, enabled } });
		await this.retryMcp();
	}
	retryMcp(): Promise<void> {
		const operation = this.mcpQueue.catch(() => {}).then(async () => {
			await this.mcpServer?.stop();
			this.mcpServer = null;
			this.setMcpStatus({ running: false, port: this.settings.mcp.port });
			if (this.unloading || !this.settings.mcp.enabled) return;
			try {
				const unavailable = this.getMcpUnavailableReason();
				if (unavailable) throw new Error(unavailable);
				if (!this.settings.mcp.authToken) {
					await this.updateSettings({ mcp: { ...this.settings.mcp, authToken: randomBytes(32).toString("hex") } });
				}
				if (this.unloading || !this.settings.mcp.enabled) return;
				const entities = new McpEntities({
					repositories: {
						bestiary: this.bestiaryFeature.repository!, spellbook: this.spellbookFeature.repository!,
						arsenal: this.arsenalFeature.repository!, armory: this.armoryFeature.repository!,
						equipment: this.equipmentFeature.repository!, artifactory: this.artifactoryFeature.repository!,
						backgrounds: this.backgroundFeature.repository!, feats: this.featFeature.repository!, races: this.raceFeature.repository!,
					},
					getMediaState: () => this.getMediaState(),
					getVaultAudioPaths: () => this.app.vault.getFiles().map((file) => file.path),
					updateMedia: (change, beforeWrite) => this.updateMedia(change, beforeWrite),
					onEntitySaved: (kind, url) => {
						const repositories = {
							bestiary: this.bestiaryFeature.repository, spellbook: this.spellbookFeature.repository,
							arsenal: this.arsenalFeature.repository, armory: this.armoryFeature.repository,
							equipment: this.equipmentFeature.repository, artifactory: this.artifactoryFeature.repository,
							backgrounds: this.backgroundFeature.repository, feats: this.featFeature.repository, races: this.raceFeature.repository,
						};
						if (kind in repositories) repositories[kind as keyof typeof repositories]?.notifyExternalChange?.(url);
					},
				});
				const server = new McpIntegrationServer(entities, this.manifest.version, this.settings.mcp.authToken!);
				this.mcpServer = server;
				const port = await server.start(this.settings.mcp.port ?? 0);
				if (this.unloading || !this.settings.mcp.enabled) { await server.stop(); return; }
				await this.updateSettings({ mcp: { ...this.settings.mcp, port } });
				if (this.unloading || !this.settings.mcp.enabled) { await server.stop(); return; }
				this.setMcpStatus({ running: true, port });
			} catch (error) {
				await this.mcpServer?.stop();
				this.mcpServer = null;
				this.setMcpStatus({ running: false, port: this.settings.mcp.port, error: formatOwlbearError(error) });
			}
		});
		this.mcpQueue = operation;
		return operation;
	}

	getPluginUpdateService(): PluginUpdateService { return this.pluginUpdateService; }

	async exportManualEntities(): Promise<string> {
		const archive = await this.getManualEntityArchiveService().exportArchive();
		return JSON.stringify(archive, null, 2);
	}

	async importManualEntities(json: string): Promise<ManualEntityImportReport> {
		return this.getManualEntityArchiveService().importArchive(JSON.parse(json));
	}

	async updateSettings(patch: Partial<PluginSettingsState>): Promise<void> {
		this.settings = {
			...this.settings,
			...patch,
			schemaVersion: 8,
		};
		this.assistantWorkspace = this.settings.workspace;
		await this.persistSettings();
	}

	async persistLatestOwlbearSnapshot(snapshot: OwlbearEncounterSnapshot): Promise<void> {
		const { assetBaseUrl: _transportOnlyAssetBaseUrl, ...persistedSnapshot } = snapshot;
		await this.updateSettings({
			owlbearSync: {
				...(this.settings.owlbearSync ?? {}),
				latestSnapshot: persistedSnapshot,
			},
		});
	}

	getOwlbearServerStatus(): OwlbearServerStatus { return this.owlbearServerStatus; }
	isOwlbearIntegrationEnabled(): boolean { return this.settings.owlbearSync.enabled; }
	getOwlbearRuntimeStatus(): OwlbearRuntimeStatus { return this.owlbearRuntimeStatus; }
	subscribeOwlbearRuntimeStatus(listener: () => void): () => void {
		this.owlbearRuntimeListeners.add(listener);
		return () => this.owlbearRuntimeListeners.delete(listener);
	}
	getOwlbearInstallLink(): string {
		return getOwlbearExtensionInstallUrl(__DND_DM_TOOLS_DEV__);
	}
	getOwlbearPairingCode(): string {
		const authToken = this.settings.owlbearSync.authToken;
		const websocketUrl = this.owlbearServer?.getPublicWebSocketUrl();
		return websocketUrl && authToken ? createOwlbearPairingCode(websocketUrl, authToken) : "";
	}

	async setOwlbearIntegrationEnabled(enabled: boolean): Promise<void> {
		await this.updateOwlbearSettings({ enabled });
		this.notifyOwlbearRuntimeStatus();
		if (!enabled) {
			this.cloudflaredInstaller?.dispose();
			await this.stopOwlbearIntegration();
			return;
		}
		if (!Platform.isDesktopApp) {
			this.owlbearServerStatus = { running: false, port: null, connected: false, error: "Интеграция Owlbear доступна только в desktop Obsidian." };
			return;
		}
		if (this.owlbearRuntimeStatus.cloudflared.state === "ready") await this.startOwlbearIntegration();
		else void this.prepareCloudflared();
	}

	async setOwlbearPort(port: number | null): Promise<void> {
		if (port !== null && (!Number.isInteger(port) || port < 1024 || port > 65535)) {
			new Notice("Порт Owlbear должен быть числом от 1024 до 65535.");
			return;
		}
		await this.updateOwlbearSettings({ port });
		if (this.settings.owlbearSync.enabled && Platform.isDesktopApp) await this.startOwlbearIntegration();
	}

	async setOwlbearDevelopmentExtensionPath(path: string): Promise<void> {
		await this.updateOwlbearSettings({ developmentExtensionPath: path.trim() || undefined });
		if (this.settings.owlbearSync.enabled && Platform.isDesktopApp) await this.startOwlbearIntegration();
	}

	async retryCloudflaredDownload(): Promise<void> {
		await this.stopOwlbearIntegration();
		this.cloudflaredBinaryPath = null;
		await this.prepareCloudflared(true);
	}

	async restartOwlbearTunnel(): Promise<void> {
		if (this.owlbearTunnel) await this.owlbearTunnel.restart();
		else if (this.settings.owlbearSync.enabled) await this.startOwlbearIntegration();
	}

	async publishOwlbearSnapshot(snapshot: OwlbearEncounterSnapshot): Promise<void> {
		const snapshotToPublish = reuseOwlbearEncounterIdentity(snapshot, this.settings.owlbearSync.latestSnapshot);
		if (!this.settings.owlbearSync.enabled) throw new Error("Интеграция с Owlbear выключена. Включите её в настройках плагина.");
		const server = this.owlbearServer;
		if (!server?.getStatus().running) throw new Error("Локальный сервер Owlbear не запущен.");
		if (!server.getAssetBaseUrl()) throw new Error("Публичный туннель изображений Owlbear ещё не готов.");
		const prepared = await server.materializeSnapshot(snapshotToPublish, this.settings.owlbearSync.latestSnapshot);
		await this.persistLatestOwlbearSnapshot(prepared);
		server.publishPrepared(prepared);
	}

	async publishOwlbearTurnSnapshot(snapshot: OwlbearEncounterSnapshot): Promise<void> {
		const previous = this.settings.owlbearSync.latestSnapshot;
		if (!previous || (snapshot.participants.length > 0 && !hasOwlbearParticipantOverlap(previous, snapshot))) return;
		const server = this.owlbearServer;
		if (!this.settings.owlbearSync.enabled || !server?.getStatus().connected || !server.getAssetBaseUrl()) return;
		const snapshotToPublish = { ...snapshot, encounterId: previous.encounterId, tokenLinks: previous.tokenLinks };
		const prepared = await server.materializeSnapshot(snapshotToPublish, previous);
		await this.persistLatestOwlbearSnapshot(prepared);
		server.publishPrepared(prepared);
	}

	getActiveOwlbearPreview(): (OwlbearPreviewSnapshot & { dataUrl: string }) | null {
		return this.activeOwlbearPreview;
	}

	async publishOwlbearPreviewFromFile(file: TFile): Promise<void> {
		const image = await loadOwlbearPreviewVaultImage(this.app, file);
		await this.publishOwlbearPreview(image.name, image.mime, image.width, image.height, image.dataUrl);
	}

	async publishOwlbearPreviewFromUrl(url: string): Promise<void> {
		const image = await loadOwlbearPreviewRemoteImage(url);
		await this.publishOwlbearPreview(image.name, image.mime, image.width, image.height, image.dataUrl);
	}

	async publishOwlbearPreviewFromImage(source: string, name: string): Promise<void> {
		let image: OwlbearPreviewImage;
		if (isSupportedOwlbearPreviewUrl(source)) image = await loadOwlbearPreviewRemoteImage(source);
		else if (source.startsWith("data:")) image = await loadOwlbearPreviewDataUrl(name, source);
		else {
			const file = resolveVaultImageFile(this.app, source);
			if (!file) throw new Error("Файл изображения не найден внутри vault.");
			image = await loadOwlbearPreviewVaultImage(this.app, file);
		}
		await this.publishOwlbearPreview(name || image.name, image.mime, image.width, image.height, image.dataUrl);
		this.panelManager.discardPanel("owlbear-preview");
		await this.panelManager.openPanel("owlbear-preview");
	}

	async hideOwlbearPreview(): Promise<void> {
		const preview = this.activeOwlbearPreview;
		if (!preview) return;
		await clearActiveOwlbearPreview(preview, this.owlbearServer);
		this.activeOwlbearPreview = null;
	}

	private async publishOwlbearPreview(name: string, imageMime: string, imageWidth: number, imageHeight: number, dataUrl: string): Promise<void> {
		if (!this.settings.owlbearSync.enabled) throw new Error("Интеграция с Owlbear выключена. Включите её в настройках плагина.");
		const server = this.owlbearServer;
		if (!server?.getStatus().connected) throw new Error("Расширение Owlbear не подключено.");
		if (!server.getAssetBaseUrl()) throw new Error("Публичный туннель изображений Owlbear ещё не готов.");
		const preview: OwlbearPreviewSnapshot = {
			schemaVersion: 1,
			previewId: crypto.randomUUID(),
			name,
			createdAt: new Date().toISOString(),
			imageMime,
			imageWidth,
			imageHeight,
			imageDataUrl: dataUrl,
		};
		const prepared = await server.publishPreview(preview);
		this.activeOwlbearPreview = { ...prepared, dataUrl };
	}

	private async updateOwlbearSettings(patch: Partial<OwlbearSyncSettings>): Promise<void> {
		await this.updateSettings({ owlbearSync: { ...this.settings.owlbearSync, ...patch } });
	}

	private getManualEntityArchiveService(): ManualEntityArchiveService {
		return new ManualEntityArchiveService(this.#database.entityOriginDao, {
			bestiary: this.bestiaryFeature.repository!,
			spellbook: this.spellbookFeature.repository!,
			"dm-screen": this.dmScreenFeature.repository!,
			arsenal: this.arsenalFeature.repository!,
			armory: this.armoryFeature.repository!,
			equipment: this.equipmentFeature.repository!,
			artifactory: this.artifactoryFeature.repository!,
			backgrounds: this.backgroundFeature.repository!,
			feats: this.featFeature.repository!,
			races: this.raceFeature.repository!,
			classes: this.classesFeature.repository!,
		}, this.manifest.version);
	}

	private async resetOwlbearSnapshotForNewSession(): Promise<void> {
		const previous = this.settings.owlbearSync.latestSnapshot;
		if (!previous || previous.participants.length === 0) return;
		await this.updateOwlbearSettings({ latestSnapshot: createOwlbearSessionResetSnapshot(previous) });
	}

	private startOwlbearIntegration(): Promise<void> {
		if (this.owlbearStartPromise) return this.owlbearStartPromise;
		this.owlbearStartPromise = this.doStartOwlbearIntegration().finally(() => { this.owlbearStartPromise = null; });
		return this.owlbearStartPromise;
	}

	private async doStartOwlbearIntegration(): Promise<void> {
		if (!Platform.isDesktopApp || !this.cloudflaredBinaryPath) return;
		const sync = this.settings.owlbearSync;
		await this.stopOwlbearIntegration();
		const authToken = createOwlbearAuthToken();
		await this.updateOwlbearSettings({ authToken });
		let server: OwlbearIntegrationServer | null = null;
		try {
			server = new OwlbearIntegrationServer(
				this.getOwlbearExtensionDirectories(),
				this.getOwlbearImageCacheDirectory(),
				() => authToken,
				() => this.settings.owlbearSync.latestSnapshot,
				() => this.activeOwlbearPreview ?? undefined,
				(snapshotId, links, diagnostics) => this.persistOwlbearApplied(snapshotId, links, diagnostics),
				(status) => { this.owlbearServerStatus = status; this.notifyOwlbearRuntimeStatus(); this.notifyOwlbearReady(); },
			);
			const port = await server.start(__DND_DM_TOOLS_DEV__ ? sync.port ?? 0 : 0);
			this.owlbearServer = server;
			const latestSnapshot = this.settings.owlbearSync.latestSnapshot;
			if (latestSnapshot) {
				const migrated = await server.materializeSnapshot(latestSnapshot);
				await this.persistLatestOwlbearSnapshot(migrated);
			}
			if (port !== sync.port) await this.updateOwlbearSettings({ port });
			const assetPort = server.getPublicAssetPort();
			if (!assetPort) throw new Error("Asset-сервер Owlbear не запущен.");
			const activeServer = server;
			const tunnel = new CloudflareQuickTunnel(
				this.cloudflaredBinaryPath,
				assetPort,
				this.getCloudflaredDirectory(),
				activeServer.getPublicAssetPath(),
				async (origin) => {
					if (this.owlbearServer !== activeServer) return;
					activeServer.setPublicAssetOrigin(origin);
					const current = this.settings.owlbearSync.latestSnapshot;
					if (current && activeServer.getStatus().connected) activeServer.publishPrepared(current);
					const preview = this.activeOwlbearPreview;
					if (preview && activeServer.getStatus().connected) {
						try {
							const prepared = await activeServer.publishPreview(preview);
							this.activeOwlbearPreview = { ...prepared, dataUrl: preview.dataUrl };
						} catch { /* the current preview will be retried on reconnect */ }
					}
				},
				() => activeServer.clearPublicAssetOrigin(),
				(status) => {
					this.owlbearRuntimeStatus = { ...this.owlbearRuntimeStatus, tunnel: status };
					this.notifyOwlbearRuntimeStatus();
					this.notifyOwlbearReady();
				},
			);
			this.owlbearTunnel = tunnel;
			tunnel.start();
		} catch (error) {
			if (server) await server.stop();
			this.owlbearServer = null;
			this.owlbearServerStatus = { running: false, port: sync.port, connected: false, error: formatOwlbearError(error) };
			this.owlbearRuntimeStatus = { ...this.owlbearRuntimeStatus, tunnel: { state: "error", error: formatOwlbearError(error) } };
			this.notifyOwlbearRuntimeStatus();
			new Notice(`Не удалось запустить Owlbear: ${this.owlbearServerStatus.error}`);
		}
	}

	private async stopOwlbearIntegration(): Promise<void> {
		const server = this.owlbearServer;
		const hadRunningIntegration = Boolean(server || this.owlbearTunnel);
		this.owlbearReadyNoticeShown = false;
		if (server) {
			try {
				await server.clearManagedScene();
			} catch (error) {
				new Notice(`Не удалось подтвердить очистку сцены Owlbear: ${formatOwlbearError(error)}`);
			}
		}
		this.activeOwlbearPreview = null;
		if (hadRunningIntegration) {
			await this.panelManager.closePanel("owlbear-preview");
			const snapshot = this.settings.owlbearSync.latestSnapshot;
			if (snapshot) await this.updateOwlbearSettings({ latestSnapshot: createOwlbearSessionResetSnapshot(snapshot) });
		} else {
			this.removeStaleOwlbearPreviewTab();
		}
		const tunnel = this.owlbearTunnel;
		this.owlbearTunnel = null;
		if (tunnel) await tunnel.stop();
		this.owlbearServer = null;
		if (server) await server.stop();
		this.owlbearRuntimeStatus = { ...this.owlbearRuntimeStatus, tunnel: { state: "stopped" } };
		this.notifyOwlbearRuntimeStatus();
	}

	private notifyOwlbearReady(): void {
		const ready = this.settings.owlbearSync.enabled
			&& this.owlbearServerStatus.running
			&& this.owlbearServerStatus.connected
			&& this.owlbearRuntimeStatus.tunnel.state === "ready";
		if (!ready) return;
		if (this.owlbearReadyNoticeShown) return;
		this.owlbearReadyNoticeShown = true;
		new Notice("Интеграция с Owlbear готова к работе.");
	}

	private async prepareCloudflared(force = false): Promise<void> {
		if (!this.settings.owlbearSync.enabled) return;
		if (!Platform.isDesktopApp) {
			this.owlbearRuntimeStatus = { ...this.owlbearRuntimeStatus, cloudflared: { state: "unsupported", version: CLOUDFLARED_VERSION, platform: runtimePlatform(), arch: runtimeArchitecture(), error: "cloudflared доступен только в desktop Obsidian." } };
			this.notifyOwlbearRuntimeStatus();
			return;
		}
		try {
			if (!this.cloudflaredInstaller) {
				this.cloudflaredInstaller = new CloudflaredInstaller(this.getCloudflaredDirectory(), (status) => {
					this.owlbearRuntimeStatus = { ...this.owlbearRuntimeStatus, cloudflared: status };
					this.notifyOwlbearRuntimeStatus();
				});
			}
			const binaryPath = await this.cloudflaredInstaller.ensureInstalled(force);
			this.cloudflaredBinaryPath = binaryPath;
			if (binaryPath && this.settings.owlbearSync.enabled) await this.startOwlbearIntegration();
		} catch (error) {
			this.owlbearRuntimeStatus = { ...this.owlbearRuntimeStatus, cloudflared: { state: "error", version: CLOUDFLARED_VERSION, platform: runtimePlatform(), arch: runtimeArchitecture(), error: formatOwlbearError(error) } };
			this.notifyOwlbearRuntimeStatus();
		}
	}

	private notifyOwlbearRuntimeStatus(): void {
		for (const listener of this.owlbearRuntimeListeners) listener();
	}

	private async persistOwlbearApplied(snapshotId: string, links: OwlbearTokenLink[], diagnostics: OwlbearSyncDiagnostics): Promise<void> {
		const snapshot = this.settings.owlbearSync.latestSnapshot;
		if (!snapshot || snapshot.snapshotId !== snapshotId) return;
		await this.updateOwlbearSettings({ latestSnapshot: { ...snapshot, tokenLinks: links, diagnostics } });
	}

	private getOwlbearExtensionDirectories(): string[] {
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) throw new Error("Локальный путь плагина недоступен.");
		const installedDirectory = [adapter.getBasePath(), this.app.vault.configDir, "plugins", this.manifest.id, "owlbear-extension"].join("/");
		if (__DND_DM_TOOLS_DEV__) {
			const developmentDirectory = this.settings.owlbearSync.developmentExtensionPath;
			if (!developmentDirectory) throw new Error("Для dev-сборки укажите developmentExtensionPath к owlbear-extension/dist.");
			return [developmentDirectory];
		}
		return [installedDirectory];
	}

	private getOwlbearImageCacheDirectory(): string {
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) throw new Error("Локальный путь плагина недоступен.");
		return [adapter.getBasePath(), this.app.vault.configDir, "plugins", this.manifest.id, "owlbear-cache", "token-images"].join("/");
	}

	private getCloudflaredDirectory(): string {
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) throw new Error("Локальный путь плагина недоступен.");
		return [adapter.getBasePath(), this.app.vault.configDir, "plugins", this.manifest.id, "cloudflared"].join("/");
	}

	private removeStaleOwlbearPreviewTab(): void {
		for (const tile of this.assistantWorkspace.tiles) {
			const index = tile.tabs.indexOf("owlbear-preview");
			if (index < 0) continue;
			tile.tabs = tile.tabs.filter((key) => key !== "owlbear-preview");
			if (tile.activeTab === "owlbear-preview") tile.activeTab = tile.tabs[Math.min(index, tile.tabs.length - 1)] ?? null;
		}
	}

	private registerOwlbearPreviewContextMenus(): void {
		for (const [variant, svg] of Object.entries({ black: owlbearBlackLogo, white: owlbearWhiteLogo })) {
			const content = svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
			addIcon(`dnd-dm-tools-owlbear-${variant}`, `<g fill="none" transform="scale(${100 / 512})">${content}</g>`);
		}
		this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
			if (!(file instanceof TFile) || !isSupportedOwlbearPreviewFile(file)) return;
			this.addOwlbearPreviewMenuItem(menu, () => this.publishOwlbearPreviewFromFile(file));
		}));
		this.registerEvent(this.app.workspace.on("url-menu", (menu, url) => {
			if (url !== this.lastContextImageUrl || !isSupportedOwlbearPreviewUrl(url)) return;
			this.addOwlbearPreviewMenuItem(menu, () => this.publishOwlbearPreviewFromUrl(url));
		}));
		const registerDocument = (document: Document) => this.registerDomEvent(document, "contextmenu", (event) => {
			const target = event.target instanceof Element ? event.target : null;
			const image = target instanceof HTMLImageElement
				? target
				: target?.closest(".image-embed, .internal-embed")?.querySelector("img") ?? null;
			this.lastContextImageUrl = image && /^https:\/\//i.test(image.src) ? image.src : null;
		}, true);
		registerDocument(document);
		this.registerEvent(this.app.workspace.on("window-open", (_workspaceWindow, window) => registerDocument(window.document)));
	}

	private addOwlbearPreviewMenuItem(menu: Menu, action: () => Promise<void>): void {
		if (!this.settings.owlbearSync.enabled) return;
		menu.addItem((item) => item
			.setTitle("Отправить в Owlbear")
			.setIcon(getCurrentTheme() === Theme.Light ? "dnd-dm-tools-owlbear-black" : "dnd-dm-tools-owlbear-white")
			.onClick(() => void action().then(async () => {
				this.panelManager.discardPanel("owlbear-preview");
				await this.panelManager.openPanel("owlbear-preview");
				new Notice("Изображение отправлено в Owlbear.");
			}).catch((error) => {
				new Notice(error instanceof Error ? error.message : "Не удалось отправить изображение в Owlbear.");
			})));
	}

	// ---- private methods ----
	async #initialize(
		callback: () => void,
	) {
		this.#uiEventListener = new UiEventListener(
			this.app,
			() => this.bestiaryFeature,
			() => this.spellbookFeature,
			() => this.arsenalFeature,
			() => this.armoryFeature,
			() => this.equipmentFeature,
			() => this.artifactoryFeature,
			() => this.backgroundFeature,
			() => this.featFeature,
			() => this.raceFeature,
			() => this.classesFeature,
			() => this.characterSheetFeature,
			() => this.dmScreenFeature,
			(source, name) => this.publishOwlbearPreviewFromImage(source, name),
			() => this.isOwlbearIntegrationEnabled(),
			(listener) => this.subscribeOwlbearRuntimeStatus(listener),
		);
		this.#uiEventListener.onMediaClick = (url) => this.openMediaUrl(url);

		this.bestiaryFeature = new BestiaryFeature(this, this.#database, this.#uiEventListener);
		this.spellbookFeature = new SpellbookFeature(this, this.#database, this.#uiEventListener);
		this.dmScreenFeature = new DmScreenFeature(this, this.#database, this.#uiEventListener);
		this.arsenalFeature = new ArsenalFeature(this, this.#database, this.#uiEventListener);
		this.armoryFeature = new ArmoryFeature(this, this.#database, this.#uiEventListener);
		this.equipmentFeature = new EquipmentFeature(this, this.#database, this.#uiEventListener);
		this.artifactoryFeature = new ArtifactoryFeature(this, this.#database, this.#uiEventListener);
		this.backgroundFeature = new BackgroundFeature(this, this.#database, this.#uiEventListener);
		this.featFeature = new FeatFeature(this, this.#database, this.#uiEventListener);
		this.raceFeature = new RaceFeature(this, this.#database, this.#uiEventListener);
		this.classesFeature = new ClassesFeature(this, this.#database, this.#uiEventListener);
		this.characterSheetFeature = new CharacterSheetFeature(this, this.#database, this.#uiEventListener);
		this.features = [
			this.bestiaryFeature,
			this.spellbookFeature,
			this.dmScreenFeature,
			this.arsenalFeature,
			this.armoryFeature,
			this.equipmentFeature,
			this.artifactoryFeature,
			this.backgroundFeature,
			this.featFeature,
			this.raceFeature,
			this.classesFeature,
			this.characterSheetFeature,
		];
		await Promise.all(this.features.map(feature => feature.initialize()));

		this.panelManager = new PanelManager(
			this,
			() => this.assistantWorkspace,
			(workspace) => this.persistAssistantWorkspace(workspace),
		);
		const panels: PanelHost[] = this.features
			.map((feature) => feature.sidePanel)
			.filter((panel): panel is NonNullable<typeof panel> => Boolean(panel));
		panels.push(new InitiativeTrackerPanel(this, this.#uiEventListener));
		panels.push(new PlayerPanel(this));
		panels.push(new AdventuresPanel(this));
		panels.push(new OwlbearPreviewPanel(this));
		await this.panelManager.register(panels, this.shouldResetLegacyViews);
		await this.persistAssistantWorkspace(this.assistantWorkspace);
		
		callback();
	}

	#dispose() {
		this.panelManager?.dispose();
		const disposedFeatures = this.features?.map(feature => feature.dispose()) ?? [];
		void Promise.allSettled([...disposedFeatures, this.mediaUpdateQueue, this.mcpQueue, this.mcpServer?.stop()])
			.then(() => this.#database.dispose());
	}
}

function hasOwlbearParticipantOverlap(left: OwlbearEncounterSnapshot, right: OwlbearEncounterSnapshot): boolean {
	const leftParticipantIds = new Set(left.participants.map((participant) => participant.participantId));
	return right.participants.some((participant) => leftParticipantIds.has(participant.participantId));
}

function formatOwlbearError(error: unknown): string {
	if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "EADDRINUSE") return "Этот порт уже занят.";
	return error instanceof Error ? error.message : String(error);
}

function runtimePlatform(): string { return typeof process === "undefined" ? "unknown" : process.platform; }
function runtimeArchitecture(): string { return typeof process === "undefined" ? "unknown" : process.arch; }
