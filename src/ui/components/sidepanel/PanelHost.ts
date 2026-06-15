import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

export interface PanelSearchResult {
	panelKey: PanelKey;
	url: string;
	title: string;
	subtitle: string;
	item: BaseItem;
}

export interface PanelHost {
	getKey(): PanelKey;
	getRibbonIconName(): string;
	getTitle(): string;
	mount(element: Element, item?: BaseItem): Promise<unknown>;
	search(query: string): Promise<PanelSearchResult[]>;
	resolveItem(url: string): Promise<BaseItem | null>;
}
