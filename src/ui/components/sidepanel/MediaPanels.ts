import { mount } from "svelte";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type DndStatblockPlugin from "src/main";
import PlayerUi from "src/ui/layout/media/PlayerUi.svelte";
import AdventuresUi from "src/ui/layout/media/AdventuresUi.svelte";
import type { PanelHost, PanelSearchResult } from "./PanelHost";

export class PlayerPanel implements PanelHost {
	constructor(private readonly plugin: DndStatblockPlugin) {}
	getKey() { return "player" as const; }
	getRibbonIconName() { return "music-2"; }
	getTitle() { return "Плеер"; }
	async mount(element: Element): Promise<unknown> {
		return mount(PlayerUi, { target: element, props: { plugin: this.plugin } });
	}
	async search(_query: string): Promise<PanelSearchResult[]> { return []; }
	async resolveItem(_url: string): Promise<BaseItem | null> { return null; }
}

export class AdventuresPanel implements PanelHost {
	constructor(private readonly plugin: DndStatblockPlugin) {}
	getKey() { return "adventures" as const; }
	getRibbonIconName() { return "map"; }
	getTitle() { return "Приключения"; }
	async mount(element: Element): Promise<unknown> {
		return mount(AdventuresUi, { target: element, props: { plugin: this.plugin } });
	}
	async search(_query: string): Promise<PanelSearchResult[]> { return []; }
	async resolveItem(_url: string): Promise<BaseItem | null> { return null; }
}
