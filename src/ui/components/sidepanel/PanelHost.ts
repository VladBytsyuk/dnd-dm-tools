import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { PanelKey } from "src/domain/settings/PluginSettings";

export interface PanelSearchResult {
	panelKey: PanelKey;
	url: string;
	title: string;
	subtitle: string;
}

export interface PanelHost {
	getKey(): PanelKey;
	getRibbonIconName(): string;
	getTitle(): string;
	getViewId(): string;
	registerView(): void;
	addRibbonIcon(): HTMLElement;
	openSeparate(item?: BaseItem): Promise<void>;
	mount(element: Element, item?: BaseItem): Promise<unknown>;
	search(query: string): Promise<PanelSearchResult[]>;
	resolveItem(url: string): Promise<BaseItem | null>;
}

