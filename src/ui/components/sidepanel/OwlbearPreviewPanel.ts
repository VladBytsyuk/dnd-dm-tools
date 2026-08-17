import { mount } from "svelte";
import { Notice } from "obsidian";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type DndStatblockPlugin from "src/main";
import OwlbearPreviewUi from "src/ui/layout/owlbear/OwlbearPreviewUi.svelte";
import type { PanelHost, PanelSearchResult } from "./PanelHost";

export class OwlbearPreviewPanel implements PanelHost {
	constructor(private readonly plugin: DndStatblockPlugin) {}

	getKey() { return "owlbear-preview" as const; }
	getRibbonIconName() { return "image"; }
	getTitle() { return "Превью Owlbear"; }
	isToolbarVisible() { return false; }

	async onBeforeClose(): Promise<boolean> {
		try {
			await this.plugin.hideOwlbearPreview();
			return true;
		} catch (error) {
			new Notice(error instanceof Error ? error.message : "Не удалось убрать изображение из Owlbear.");
			return false;
		}
	}

	async mount(element: Element): Promise<unknown> {
		return mount(OwlbearPreviewUi, { target: element, props: { plugin: this.plugin } });
	}

	async search(_query: string): Promise<PanelSearchResult[]> { return []; }
	async resolveItem(_url: string): Promise<BaseItem | null> { return null; }
}
