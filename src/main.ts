import { FileSystemAdapter, Notice, Platform, Plugin } from 'obsidian';
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
	type OwlbearEncounterSnapshot,
	type OwlbearSyncDiagnostics,
	type OwlbearTokenLink,
} from './domain/models/owlbear/OwlbearSync';
import { PanelManager } from './ui/components/sidepanel/PanelManager';
import type { PanelHost } from './ui/components/sidepanel/PanelHost';
import { createOwlbearAuthToken, OwlbearIntegrationServer, type OwlbearServerStatus } from './data/owlbear/OwlbearIntegrationServer';
import { OwlbearSettingsTab } from './ui/settings/OwlbearSettingsTab';

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

	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		const loadResult = loadPluginSettings(await this.loadData());
		this.settings = loadResult.settings;
		this.assistantWorkspace = this.settings.workspace;
		this.shouldResetLegacyViews = loadResult.shouldResetLegacyViews;
		await this.resetOwlbearSnapshotForNewSession();
		this.addSettingTab(new OwlbearSettingsTab(this));
		if (this.settings.owlbearSync.enabled && Platform.isDesktopApp) {
			await this.startOwlbearIntegration();
		}

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
			console.log("dnd-dm-tools has been loaded.");
		});
	}

	onunload() {
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
		await this.updateSettings({
			owlbearSync: {
				...(this.settings.owlbearSync ?? {}),
				latestSnapshot: snapshot,
			},
		});
	}

	getOwlbearServerStatus(): OwlbearServerStatus { return this.owlbearServerStatus; }
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
		if (!enabled) { await this.stopOwlbearIntegration(); return; }
		if (!Platform.isDesktopApp) {
			this.owlbearServerStatus = { running: false, port: null, connected: false, error: "Интеграция Owlbear доступна только в desktop Obsidian." };
			return;
		}
		await this.startOwlbearIntegration();
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

	async publishOwlbearSnapshot(snapshot: OwlbearEncounterSnapshot): Promise<void> {
		const snapshotToPublish = this.reuseOwlbearEncounterIdentity(snapshot);
		if (!this.settings.owlbearSync.enabled) throw new Error("Интеграция с Owlbear выключена. Включите её в настройках плагина.");
		const server = this.owlbearServer;
		if (!server?.getStatus().running) throw new Error("Локальный сервер Owlbear не запущен.");
		const prepared = await server.materializeSnapshot(snapshotToPublish, this.settings.owlbearSync.latestSnapshot);
		await this.persistLatestOwlbearSnapshot(prepared);
		server.publishPrepared(prepared);
	}

	async publishOwlbearTurnSnapshot(snapshot: OwlbearEncounterSnapshot): Promise<void> {
		const previous = this.settings.owlbearSync.latestSnapshot;
		if (!previous || (snapshot.participants.length > 0 && !hasOwlbearParticipantOverlap(previous, snapshot))) return;
		const server = this.owlbearServer;
		if (!this.settings.owlbearSync.enabled || !server?.getStatus().connected) return;
		const snapshotToPublish = { ...snapshot, encounterId: previous.encounterId, tokenLinks: previous.tokenLinks };
		const prepared = await server.materializeSnapshot(snapshotToPublish, previous);
		await this.persistLatestOwlbearSnapshot(prepared);
		server.publishPrepared(prepared);
	}

	private async updateOwlbearSettings(patch: Partial<OwlbearSyncSettings>): Promise<void> {
		await this.updateSettings({ owlbearSync: { ...this.settings.owlbearSync, ...patch } });
	}

	private async resetOwlbearSnapshotForNewSession(): Promise<void> {
		const previous = this.settings.owlbearSync.latestSnapshot;
		if (!previous || previous.participants.length === 0) return;
		await this.updateOwlbearSettings({ latestSnapshot: createOwlbearSessionResetSnapshot(previous) });
	}

	private async startOwlbearIntegration(): Promise<void> {
		if (!Platform.isDesktopApp) return;
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
				(snapshotId, links, diagnostics) => this.persistOwlbearApplied(snapshotId, links, diagnostics),
				(status) => { this.owlbearServerStatus = status; },
			);
			const port = await server.start(sync.port ?? 0);
			this.owlbearServer = server;
			const latestSnapshot = this.settings.owlbearSync.latestSnapshot;
			if (latestSnapshot) {
				const migrated = await server.materializeSnapshot(latestSnapshot);
				await this.persistLatestOwlbearSnapshot(migrated);
			}
			if (port !== sync.port) await this.updateOwlbearSettings({ port });
		} catch (error) {
			if (server) await server.stop();
			this.owlbearServer = null;
			this.owlbearServerStatus = { running: false, port: sync.port, connected: false, error: formatOwlbearError(error) };
			new Notice(`Не удалось запустить Owlbear: ${this.owlbearServerStatus.error}`);
		}
	}

	private async stopOwlbearIntegration(): Promise<void> {
		const server = this.owlbearServer;
		this.owlbearServer = null;
		if (server) await server.stop();
	}

	private async persistOwlbearApplied(snapshotId: string, links: OwlbearTokenLink[], diagnostics: OwlbearSyncDiagnostics): Promise<void> {
		const snapshot = this.settings.owlbearSync.latestSnapshot;
		if (!snapshot || snapshot.snapshotId !== snapshotId) return;
		await this.updateOwlbearSettings({ latestSnapshot: { ...snapshot, tokenLinks: links, diagnostics } });
	}

	private reuseOwlbearEncounterIdentity(snapshot: OwlbearEncounterSnapshot): OwlbearEncounterSnapshot {
		const previous = this.settings.owlbearSync.latestSnapshot;
		if (!previous || !sameOwlbearParticipants(previous, snapshot)) return snapshot;
		return { ...snapshot, encounterId: previous.encounterId, tokenLinks: previous.tokenLinks };
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
		await this.panelManager.register(panels, this.shouldResetLegacyViews);
		await this.persistAssistantWorkspace(this.assistantWorkspace);
		
		callback();
	}

	#dispose() {
		this.panelManager.dispose();
		this.features.forEach(feature => feature.dispose());
	}
}

function sameOwlbearParticipants(left: OwlbearEncounterSnapshot, right: OwlbearEncounterSnapshot): boolean {
	if (left.participants.length !== right.participants.length) return false;
	const leftIds = left.participants.map((participant) => participant.participantId).sort((a, b) => a - b);
	const rightIds = right.participants.map((participant) => participant.participantId).sort((a, b) => a - b);
	return leftIds.every((participantId, index) => participantId === rightIds[index]);
}

function hasOwlbearParticipantOverlap(left: OwlbearEncounterSnapshot, right: OwlbearEncounterSnapshot): boolean {
	const leftParticipantIds = new Set(left.participants.map((participant) => participant.participantId));
	return right.participants.some((participant) => leftParticipantIds.has(participant.participantId));
}

function formatOwlbearError(error: unknown): string {
	if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "EADDRINUSE") return "Этот порт уже занят.";
	return error instanceof Error ? error.message : String(error);
}
