import type { FullMonster } from "src/domain/monster";
import type { DndStatblockPluginSettings } from "./settings";
import { LayoutStyle } from "./layout_style";
import { Layout5eItemView } from "src/ui/layout/5e/Layout5eItem";
import { LayoutTtgItemView } from "src/ui/layout/ttg/LayoutTtgItem";
import type DndStatblockPlugin from "src/main";
import type { LayoutItemView } from "src/ui/layout/LayoutItemView";

export class LayoutManager {

	// ---- fields ----
    #plugin: DndStatblockPlugin;
    #settings: DndStatblockPluginSettings;
    #cacheItemView: LayoutItemView | null = null;

    #cacheContainer: Element | null = null;
    #cacheMonster: FullMonster | null = null;
    #cacheIsTwoColumns: boolean = false;

    constructor(plugin: DndStatblockPlugin, settings: DndStatblockPluginSettings) {
        this.#plugin = plugin;
        this.#settings = settings;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        monster: FullMonster, 
        isTwoColumns: boolean = false,
    ) {
        this.#cacheItemView?.destroy();
        container.empty();
        const layoutStyle = this.#settings.layoutStyle;
        const viewContainer = container.createDiv("statblock-view-container");
        let itemView: LayoutItemView;
        switch (layoutStyle) {
            case LayoutStyle.Dnd5e:
                itemView = new Layout5eItemView(monster, isTwoColumns);
                break;
            case LayoutStyle.TtgClub:
                itemView = new LayoutTtgItemView(monster, isTwoColumns);
                break;
            default:
                throw new Error(`Unknown layout style: ${layoutStyle}`);
        } 
        itemView.render(viewContainer);
        this.#cacheItemView = itemView;
        this.#cacheContainer = container;
        this.#cacheMonster = monster;
        this.#cacheIsTwoColumns = isTwoColumns;
    }

    onChangeLayoutStyle() {
        if (this.#cacheItemView && this.#cacheContainer && this.#cacheMonster) {
            this.renderLayout(this.#cacheContainer, this.#cacheMonster, this.#cacheIsTwoColumns)
        }
    }
}
