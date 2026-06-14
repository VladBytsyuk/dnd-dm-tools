import { ItemView, type WorkspaceLeaf } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type DndStatblockPlugin from "src/main";
import InitiativeTracker from "src/ui/layout/tracker/InitiativeTracker.svelte";
import { mount } from "svelte";
import type { PanelHost, PanelSearchResult } from "./PanelHost";

const VIEW_ID = "obsidian-dnd-statblock-side-panel-initiative-tracker";

export class InitiativeTrackerPanel implements PanelHost {
	constructor(
		private plugin: DndStatblockPlugin,
		private uiEventListener: IUiEventListener,
	) {}

	getKey() { return "initiative-tracker" as const; }
	getRibbonIconName() { return "swords"; }
	getTitle() { return "Трекер инициативы"; }
	getViewId() { return VIEW_ID; }

	registerView(): void {
		this.plugin.registerView(
			VIEW_ID,
			(leaf: WorkspaceLeaf) => new InitiativeTrackerView(leaf, this),
		);
	}

	addRibbonIcon(): HTMLElement {
		return this.plugin.addRibbonIcon(
			this.getRibbonIconName(),
			this.getTitle(),
			async () => this.plugin.panelManager.openPanel(this.getKey()),
		);
	}

	async openSeparate(): Promise<void> {
		let leaf = this.plugin.app.workspace.getLeavesOfType(VIEW_ID)[0];
		if (!leaf) leaf = this.plugin.app.workspace.getRightLeaf(true)!!;
		await leaf.setViewState({ type: VIEW_ID });
		await this.plugin.app.workspace.revealLeaf(leaf);
	}

	async mount(element: Element): Promise<unknown> {
		return mount(InitiativeTracker, {
			target: element,
			props: {
				app: this.plugin.app,
				encounter: { name: "", participants: [] },
				isEditable: true,
				onPortraitClick: this.uiEventListener.onBeastClick,
				onConditionClick: this.uiEventListener.onScreenItemClick,
				onImageRequested: async (url: string) => this.uiEventListener.onImageRequested(url),
			},
		});
	}

	async search(_query: string): Promise<PanelSearchResult[]> {
		return [];
	}

	async resolveItem(_url: string): Promise<BaseItem | null> {
		return null;
	}
}
class InitiativeTrackerView extends ItemView {
	private component: unknown;

	constructor(leaf: WorkspaceLeaf, private panel: InitiativeTrackerPanel) {
		super(leaf);
	}

	getViewType() { return VIEW_ID; }
	getDisplayText() { return this.panel.getTitle(); }
	getIcon() { return this.panel.getRibbonIconName(); }

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		this.component = await this.panel.mount(container);
	}

	async onClose() {
		if (this.component) {
			const { unmount } = await import("svelte");
			unmount(this.component);
			this.component = undefined;
		}
	}
}
