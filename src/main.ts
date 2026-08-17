import { FileSystemAdapter, Notice, Platform, Plugin, TFile, type Menu } from 'obsidian';
import { registerThemeChangeListener } from './ui/theme';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerNoteLinkProcessor } from './ui/components/processor/note_link_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import DB from './data/database/DB';
import { InitiativeTrackerPanel } from './ui/components/sidepanel/side_panel_initiative_tracker';
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
	loadOwlbearPreviewRemoteImage,
	loadOwlbearPreviewVaultImage,
} from './data/owlbear/OwlbearPreviewImage';

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

	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		const loadResult = loadPluginSettings(await this.loadData());
		this.settings = loadResult.settings;
		this.assistantWorkspace = this.settings.workspace;
		this.removeStaleOwlbearPreviewTab();
		this.shouldResetLegacyViews = loadResult.shouldResetLegacyViews;
		await this.resetOwlbearSnapshotForNewSession();
		this.addSettingTab(new OwlbearSettingsTab(this));

		await this.#initialize(() => {
			registerEncounterMdCodeBlockProcessor(
				this, 
				this.bestiaryFeature.repository!,
				this.dmScreenFeature.repository!,
				this.#uiEventListener,
			);
			registerNoteLinkProcessor(this, this.#uiEventListener);
			registerAddEncounterCommand(this);
			registerThemeChangeListener();
			this.registerOwlbearPreviewContextMenus();
			console.log("dnd-dm-tools has been loaded.");
		});
	}

	onunload() {
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

	async updateSettings(patch: Partial<PluginSettingsState>): Promise<void> {
		this.settings = {
			...this.settings,
			...patch,
			schemaVersion: 3,
		};
		this.assistantWorkspace = this.settings.workspace;
		await this.saveData(this.settings);
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
	getOwlbearRuntimeStatus(): OwlbearRuntimeStatus { return this.owlbearRuntimeStatus; }
	subscribeOwlbearRuntimeStatus(listener: () => void): () => void {
		this.owlbearRuntimeListeners.add(listener);
		return () => this.owlbearRuntimeListeners.delete(listener);
	}
	getOwlbearInstallLink(): string {
		const port = this.settings.owlbearSync.port;
		return port ? `http://localhost:${port}/manifest.json` : "";
	}
	getOwlbearPairingCode(): string {
		const { port, authToken } = this.settings.owlbearSync;
		return port && authToken ? `dnd-dm-tools:v1:${port}:${authToken}` : "";
	}

	async setOwlbearIntegrationEnabled(enabled: boolean): Promise<void> {
		await this.updateOwlbearSettings({ enabled });
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

	async hideOwlbearPreview(): Promise<void> {
		const preview = this.activeOwlbearPreview;
		if (!preview) return;
		const server = this.owlbearServer;
		if (!server?.getStatus().connected) throw new Error("Расширение Owlbear не подключено.");
		await server.clearPreview(preview.previewId);
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
		const authToken = sync.authToken ?? createOwlbearAuthToken();
		if (authToken !== sync.authToken) await this.updateOwlbearSettings({ authToken });
		await this.stopOwlbearIntegration();
		let server: OwlbearIntegrationServer | null = null;
		try {
			server = new OwlbearIntegrationServer(
				this.getOwlbearExtensionDirectories(),
				this.getOwlbearImageCacheDirectory(),
				() => this.settings.owlbearSync.authToken,
				() => this.settings.owlbearSync.latestSnapshot,
				() => this.activeOwlbearPreview ?? undefined,
				(snapshotId, links, diagnostics) => this.persistOwlbearApplied(snapshotId, links, diagnostics),
				(status) => { this.owlbearServerStatus = status; this.notifyOwlbearRuntimeStatus(); this.notifyOwlbearReady(); },
			);
			const port = await server.start(sync.port ?? 0);
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
			.setIcon("send")
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
		this.#database = new DB(this.app, this.manifest);
		await this.#database.initialize();

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
		);

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
		panels.push(new OwlbearPreviewPanel(this));
		await this.panelManager.register(panels, this.shouldResetLegacyViews);
		await this.persistAssistantWorkspace(this.assistantWorkspace);
		
		callback();
	}

	#dispose() {
		this.panelManager.dispose();
		this.features.forEach(feature => feature.dispose());
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
