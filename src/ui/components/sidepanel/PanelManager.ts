import { ItemView, type WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import {
	PANEL_KEYS,
	type PanelKey,
	type PluginMode,
	type PluginSettings,
} from "src/domain/settings/PluginSettings";
import type DndStatblockPlugin from "src/main";
import OmniPanelUi from "src/ui/layout/omni/OmniPanelUi.svelte";
import type { PanelHost, PanelSearchResult } from "./PanelHost";

export const OMNI_VIEW_ID = "dnd-dm-tools-omni";

export class PanelManager {
	private panels = new Map<PanelKey, PanelHost>();
	private ribbonElements: HTMLElement[] = [];
	private currentItems = new Map<PanelKey, BaseItem>();
	private activeSeparatePanel: PanelKey | null = null;
	private omniView: OmniItemView | null = null;

	constructor(
		private plugin: DndStatblockPlugin,
		private getSettings: () => PluginSettings,
		private saveSettings: () => Promise<void>,
	) {}

	register(panels: PanelHost[]): void {
		for (const panel of panels) {
			if (this.panels.has(panel.getKey())) throw new Error(`Duplicate panel key: ${panel.getKey()}`);
			this.panels.set(panel.getKey(), panel);
			panel.registerView();
		}
		this.plugin.registerView(OMNI_VIEW_ID, (leaf) => {
			this.omniView = new OmniItemView(leaf, this);
			return this.omniView;
		});
		this.rebuildRibbons();
	}

	getPanel(key: PanelKey): PanelHost | undefined {
		return this.panels.get(key);
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

	getWorkspace(): PluginSettings["omniWorkspace"] {
		return this.getSettings().omniWorkspace;
	}

	async setMode(mode: PluginMode): Promise<void> {
		const settings = this.getSettings();
		if (settings.mode === mode) return;
		settings.mode = mode;
		if (mode === "omni" && this.activeSeparatePanel) {
			this.addTabToFocusedTile(this.activeSeparatePanel);
		}
		await this.saveSettings();
		this.detachIncompatibleViews(mode);
		this.rebuildRibbons();
		if (mode === "omni") {
			await this.openOmni();
		} else if (this.activeSeparatePanel) {
			await this.openPanel(this.activeSeparatePanel);
		}
	}

	async updateSeparatePanel(_key: PanelKey): Promise<void> {
		await this.saveSettings();
		if (this.getSettings().mode === "separate") this.rebuildRibbons();
	}

	async openPanel(key: PanelKey): Promise<void> {
		const panel = this.panels.get(key);
		if (!panel) return;
		if (this.getSettings().mode === "separate") {
			this.activeSeparatePanel = key;
			await panel.openSeparate();
			return;
		}
		this.addTabToFocusedTile(key);
		await this.saveSettings();
		await this.openOmni();
		this.omniView?.refresh();
	}

	async openItem(key: PanelKey, item?: BaseItem): Promise<void> {
		if (item) this.currentItems.set(key, item);
		if (this.getSettings().mode === "separate") {
			this.activeSeparatePanel = key;
			await this.panels.get(key)?.openSeparate(item);
			return;
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
		return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
	}

	async openSearchResult(result: PanelSearchResult): Promise<void> {
		await this.openItemByUrl(result.panelKey, result.url);
	}

	async mountPanel(key: PanelKey, element: Element): Promise<() => void> {
		const panel = this.panels.get(key);
		if (!panel) return () => {};
		const item = this.currentItems.get(key);
		const component = await panel.mount(element, item);
		return () => {
			if (component) unmount(component);
		};
	}

	async saveWorkspace(workspace: PluginSettings["omniWorkspace"]): Promise<void> {
		this.getSettings().omniWorkspace = workspace;
		await this.saveSettings();
	}

	refresh(): void {
		this.rebuildRibbons();
		this.omniView?.refresh();
	}

	private addTabToFocusedTile(key: PanelKey): void {
		const workspace = this.getSettings().omniWorkspace;
		for (const tile of workspace.tiles) {
			const index = tile.tabs.indexOf(key);
			if (index >= 0) tile.tabs.splice(index, 1);
			if (tile.activeTab === key) tile.activeTab = tile.tabs[0] ?? null;
		}
		const targetIndex = workspace.layout === "single" ? 0 : workspace.focusedTile;
		const target = workspace.tiles[targetIndex];
		target.tabs.push(key);
		target.activeTab = key;
	}

	private rebuildRibbons(): void {
		for (const element of this.ribbonElements) element.remove();
		this.ribbonElements = [];
		const settings = this.getSettings();
		if (settings.mode === "omni") {
			this.ribbonElements.push(this.plugin.addRibbonIcon("layout-dashboard", "Омни", () => this.openOmni()));
			return;
		}
		for (const [key, panel] of this.panels) {
			if (settings.separatePanels[key]) this.ribbonElements.push(panel.addRibbonIcon());
		}
	}

	private detachIncompatibleViews(mode: PluginMode): void {
		if (mode === "omni") {
			for (const panel of this.panels.values()) {
				this.plugin.app.workspace.detachLeavesOfType(panel.getViewId());
			}
			return;
		}
		this.plugin.app.workspace.detachLeavesOfType(OMNI_VIEW_ID);
	}

	private async openOmni(): Promise<void> {
		let leaf = this.plugin.app.workspace.getLeavesOfType(OMNI_VIEW_ID)[0];
		if (!leaf) leaf = this.plugin.app.workspace.getRightLeaf(true)!!;
		await leaf.setViewState({ type: OMNI_VIEW_ID });
		await this.plugin.app.workspace.revealLeaf(leaf);
	}
}

class OmniItemView extends ItemView {
	private component: unknown;

	constructor(leaf: WorkspaceLeaf, private manager: PanelManager) {
		super(leaf);
	}

	getViewType() { return OMNI_VIEW_ID; }
	getDisplayText() { return "Омни"; }
	getIcon() { return "layout-dashboard"; }

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
				saveWorkspace: (workspace: PluginSettings["omniWorkspace"]) => this.manager.saveWorkspace(workspace),
			},
		});
	}
}
