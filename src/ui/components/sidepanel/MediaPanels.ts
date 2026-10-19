import { mount } from "svelte";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type DndStatblockPlugin from "src/main";
import type { PanelHost, PanelSearchResult } from "./PanelHost";
import MediaLibraryUi from "src/ui/layout/media/MediaLibraryUi.svelte";
import { MediaNavigation } from "src/ui/layout/media/MediaNavigation";
import { mediaItems, mediaPanel, mediaCampaignName, type MediaItem } from "src/domain/models/media/MediaLibrary";

function searchMedia(plugin: DndStatblockPlugin, key: "player" | "adventures", query: string): PanelSearchResult[] {
	const normalized = query.toLocaleLowerCase("ru");
	return mediaItems(plugin.getMediaState()).filter((item) => mediaPanel(item.mediaRoute.kind) === key && `${item.name.rus} ${item.url} ${item.parent?.name ?? ""} ${mediaCampaignName(item)}`.toLocaleLowerCase("ru").includes(normalized)).map((item) => ({ panelKey: key, url: item.url, title: item.name.rus, subtitle: item.mediaRoute.kind === "track" ? "Трек" : item.mediaRoute.kind === "playlist" ? "Плейлист" : item.mediaRoute.kind === "scene" ? ["Сцена", item.parent?.name].filter(Boolean).join(" · ") : "Приключение", item }));
}

export class PlayerPanel implements PanelHost {
	private readonly navigation = new MediaNavigation();
	constructor(private readonly plugin: DndStatblockPlugin) {}
	getKey() { return "player" as const; }
	getRibbonIconName() { return "music-2"; }
	getTitle() { return "Музыка"; }
	async mount(element: Element): Promise<unknown> {
		return mount(MediaLibraryUi, { target: element, props: { plugin: this.plugin, navigation: this.navigation, panel: "player" } });
	}
	async search(query: string): Promise<PanelSearchResult[]> { return searchMedia(this.plugin, "player", query); }
	async resolveItem(url: string): Promise<BaseItem | null> { return searchMedia(this.plugin, "player", "").find((item) => item.url === url)?.item ?? null; }
	async openItem(item: BaseItem): Promise<boolean> { return this.navigation.open((item as MediaItem).mediaRoute); }
	async onBeforeClose(): Promise<boolean> { return await this.navigation.beforeLeave?.() ?? true; }
}

export class AdventuresPanel implements PanelHost {
	private readonly navigation = new MediaNavigation();
	constructor(private readonly plugin: DndStatblockPlugin) {}
	getKey() { return "adventures" as const; }
	getRibbonIconName() { return "map"; }
	getTitle() { return "Приключения"; }
	async mount(element: Element): Promise<unknown> {
		return mount(MediaLibraryUi, { target: element, props: { plugin: this.plugin, navigation: this.navigation, panel: "adventures" } });
	}
	async search(query: string): Promise<PanelSearchResult[]> { return searchMedia(this.plugin, "adventures", query); }
	async resolveItem(url: string): Promise<BaseItem | null> { return searchMedia(this.plugin, "adventures", "").find((item) => item.url === url)?.item ?? null; }
	async openItem(item: BaseItem): Promise<boolean> { return this.navigation.open((item as MediaItem).mediaRoute); }
	async onBeforeClose(): Promise<boolean> { return await this.navigation.beforeLeave?.() ?? true; }
}
