import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type DndStatblockPlugin from "src/main";
import InitiativeTracker from "src/ui/layout/tracker/InitiativeTracker.svelte";
import { mount } from "svelte";
import type { PanelHost, PanelSearchResult } from "./PanelHost";

export const INITIATIVE_TRACKER_DETACH_EVENT = "dnd-dm-tools:initiative-tracker-detach";

export class InitiativeTrackerPanel implements PanelHost {
	constructor(
		private plugin: DndStatblockPlugin,
		private uiEventListener: IUiEventListener,
	) {}

	getKey() { return "initiative-tracker" as const; }
	getRibbonIconName() { return "swords"; }
	getTitle() { return "Трекер инициативы"; }

	onDetach(): void {
		document.dispatchEvent(new CustomEvent(INITIATIVE_TRACKER_DETACH_EVENT));
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
