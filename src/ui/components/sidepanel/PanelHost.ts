import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

export interface PanelSearchResult {
	panelKey: PanelKey;
	url: string;
	title: string;
	subtitle: string;
	item: BaseItem;
	favorite?: boolean;
}

export interface PanelHost {
	onDetach?(): void;
	isToolbarVisible?(): boolean;
	onBeforeClose?(): Promise<boolean>;
	/** Returns false when navigation was cancelled; the cached panel owns its history. */
	openItem?(item: BaseItem): Promise<boolean>;
	getKey(): PanelKey;
	getRibbonIconName(): string;
	getTitle(): string;
	mount(element: Element, item?: BaseItem): Promise<unknown>;
	search(query: string): Promise<PanelSearchResult[]>;
	resolveItem(url: string): Promise<BaseItem | null>;
}
