import { addIcon, ItemView, type WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import omniIcon from "src/assets/icon.svg";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import {
	activateOrOpenAssistantPanel,
	PANEL_KEYS,
	type AssistantWorkspaceState,
	type PanelKey,
} from "src/domain/models/assistant/AssistantWorkspace";
import type DndStatblockPlugin from "src/main";
import OmniPanelUi from "src/ui/layout/omni/OmniPanelUi.svelte";
import type { PanelHost, PanelSearchResult } from "./PanelHost";
import { sortPanelResultsBySearchRelevance } from "./OmniSearchRanking";
import { PanelSessionCache } from "./PanelSessionCache";

export const OMNI_VIEW_ID = "dnd-dm-tools-omni";
const OMNI_ICON_ID = "dnd-dm-tools-omni";
const LEGACY_VIEW_PREFIX = "obsidian-dnd-statblock-side-panel-";

export class PanelManager {
	private panels = new Map<PanelKey, PanelHost>();
	private currentItems = new Map<PanelKey, BaseItem>();
	private assistantView: AssistantItemView | null = null;
	private panelSessions = new PanelSessionCache(
		(key, element) => this.mountPanelComponent(key, element),
		(component) => {
			void unmount(component as Record<string, any>);
		},
	);

	constructor(
		private plugin: DndStatblockPlugin,
		private getPersistedWorkspace: () => AssistantWorkspaceState,
		private persistWorkspace: (workspace: AssistantWorkspaceState) => Promise<void>,
	) {}

	async register(panels: PanelHost[], shouldResetLegacyViews: boolean): Promise<void> {
		addIcon(OMNI_ICON_ID, omniIcon);
		for (const panel of panels) {
			if (this.panels.has(panel.getKey())) throw new Error(`Duplicate panel key: ${panel.getKey()}`);
			this.panels.set(panel.getKey(), panel);
		}
		this.plugin.registerView(OMNI_VIEW_ID, (leaf) => {
			this.assistantView = new AssistantItemView(leaf, this);
			return this.assistantView;
		});
		this.plugin.addRibbonIcon(OMNI_ICON_ID, "Помощник ДМа", () => this.openAssistant());

		if (shouldResetLegacyViews) {
			this.detachLegacyViews();
			await this.openAssistant();
		}
	}

	getPanelSummaries() {
		return PANEL_KEYS.map((key) => this.panels.get(key))
			.filter((panel): panel is PanelHost => Boolean(panel))
			.map((panel) => ({
				key: panel.getKey(),
				title: panel.getTitle(),
				icon: panel.getRibbonIconName(),
			}));
	}

	getWorkspace(): AssistantWorkspaceState {
		return this.getPersistedWorkspace();
	}

	async openPanel(key: PanelKey): Promise<void> {
		if (!this.panels.has(key)) return;
		this.activateOrOpenPanelTab(key);
		await this.persistWorkspace(this.getWorkspace());
		await this.openAssistant();
		this.assistantView?.refresh();
	}

	async openItem(key: PanelKey, item?: BaseItem): Promise<void> {
		if (item) {
			this.panelSessions.discard(key);
			this.currentItems.set(key, item);
		}
		await this.openPanel(key);
	}

	async openItemByUrl(key: PanelKey, url: string): Promise<void> {
		const item = await this.panels.get(key)?.resolveItem(url);
		if (item) await this.openItem(key, item);
	}

	async search(query: string): Promise<PanelSearchResult[]> {
		const normalized = query.trim().toLocaleLowerCase("ru-RU");
		if (!normalized) return [];
		const results = await Promise.allSettled(
			Array.from(this.panels.values()).map((panel) => panel.search(normalized)),
		);
		const combined = results.flatMap((result) =>
			result.status === "fulfilled" ? result.value : []
		);
		return sortPanelResultsBySearchRelevance(combined, normalized);
	}

	async openSearchResult(result: PanelSearchResult): Promise<void> {
		await this.openItemByUrl(result.panelKey, result.url);
	}

	async mountPanel(key: PanelKey, element: Element): Promise<() => void> {
		if (!this.panels.has(key)) return () => {};
		return await this.panelSessions.attach(key, element);
	}

	discardPanel(key: PanelKey): void {
		this.panelSessions.discard(key);
		this.currentItems.delete(key);
	}

	dispose(): void {
		this.panelSessions.dispose();
		this.currentItems.clear();
	}

	private async mountPanelComponent(key: PanelKey, element: Element): Promise<unknown> {
		const panel = this.panels.get(key);
		if (!panel) return undefined;
		const item = this.currentItems.get(key);
		return await panel.mount(element, item);
	}

	async saveWorkspace(workspace: AssistantWorkspaceState): Promise<void> {
		await this.persistWorkspace(workspace);
	}

	private activateOrOpenPanelTab(key: PanelKey): void {
		activateOrOpenAssistantPanel(this.getWorkspace(), key);
	}

	private detachLegacyViews(): void {
		for (const key of PANEL_KEYS) {
			this.plugin.app.workspace.detachLeavesOfType(`${LEGACY_VIEW_PREFIX}${key}`);
		}
	}

	private async openAssistant(): Promise<void> {
		let leaf = this.plugin.app.workspace.getLeavesOfType(OMNI_VIEW_ID)[0];
		if (!leaf) leaf = this.plugin.app.workspace.getRightLeaf(true)!!;
		await leaf.setViewState({ type: OMNI_VIEW_ID });
		await this.plugin.app.workspace.revealLeaf(leaf);
	}
}
class AssistantItemView extends ItemView {
	private component: unknown;

	constructor(leaf: WorkspaceLeaf, private manager: PanelManager) {
		super(leaf);
	}

	getViewType() { return OMNI_VIEW_ID; }
	getDisplayText() { return "Помощник ДМа"; }
	getIcon() { return OMNI_ICON_ID; }

	async onOpen() {
		this.render();
	}

	async onClose() {
		if (this.component) unmount(this.component);
		this.component = undefined;
	}

	refresh(): void {
		if (this.containerEl.isConnected) this.render();
	}

	private render(): void {
		if (this.component) unmount(this.component);
		const container = this.containerEl.children[1];
		container.empty();
		this.component = mount(OmniPanelUi, {
			target: container,
			props: {
				panels: this.manager.getPanelSummaries(),
				initialWorkspace: structuredClone(this.manager.getWorkspace()),
				search: (query: string) => this.manager.search(query),
				openResult: (result: PanelSearchResult) => this.manager.openSearchResult(result),
				mountPanel: (key: PanelKey, element: Element) => this.manager.mountPanel(key, element),
				discardPanel: (key: PanelKey) => this.manager.discardPanel(key),
				saveWorkspace: (workspace: AssistantWorkspaceState) => this.manager.saveWorkspace(workspace),
			},
		});
	}
}
