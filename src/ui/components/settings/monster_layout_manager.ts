import type { FullMonster } from "src/domain/monster";
import type { DndStatblockPluginSettings } from "./settings";
import { LayoutStyle } from "./layout_style";
import { Layout5eItemView } from "src/ui/layout/statblock/5e/Layout5eItem";
import { LayoutTtgItemView } from "src/ui/layout/statblock/ttg/LayoutTtgItem";
import type { LayoutItemView } from "src/ui/layout/LayoutItemView";
import { App, Notice } from "obsidian";
import type { Spellbook } from "src/data/spellbook";
import type { UiEventListener } from "src/data/ui_event_listener";

class LayoutManagerCache {

    #itemView: LayoutItemView;
    #container: Element;
    #monster: FullMonster;
    #isTwoColumns: boolean;

    constructor(itemView: LayoutItemView, container: Element, monster: FullMonster, isTwoColumns: boolean) {
        this.#itemView = itemView;
        this.#container = container;
        this.#monster = monster;
        this.#isTwoColumns = isTwoColumns;
    }

    getItemView(): LayoutItemView { return this.#itemView; };
    getContainer(): Element { return this.#container; };
    getMonster(): FullMonster { return this.#monster; };
    getIsTwoColumns(): boolean { return this.#isTwoColumns; };
}

export class MonsterLayoutManager {

	// ---- fields ----
    #app: App;
    #settings: DndStatblockPluginSettings;
    #spellbook: Spellbook;
    #uiEventListener: UiEventListener;
    #cache: LayoutManagerCache[] = [];
    

    constructor(
        app: App, 
        settings: DndStatblockPluginSettings, 
        spellbook: Spellbook, 
        uiEventListener: UiEventListener,
) {
        this.#app = app;
        this.#settings = settings;
        this.#spellbook = spellbook;
        this.#uiEventListener = uiEventListener;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        monster: FullMonster, 
        isTwoColumns: boolean = false,
    ) {
        this.#cache
            .find((item) => item.getContainer() == container)
            ?.getItemView()
            ?.destroy();
        container.empty();
        const layoutStyle = this.#settings.layoutStyle;
        const viewContainer = container.createDiv("statblock-view-container");
        let itemView: LayoutItemView;
        switch (layoutStyle) {
            case LayoutStyle.Dnd5e:
                itemView = new Layout5eItemView(monster, isTwoColumns, this.#uiEventListener);
                break;
            case LayoutStyle.TtgClub:
                itemView = new LayoutTtgItemView(this.#app, monster, isTwoColumns, this.#uiEventListener);
                break;
            default:
                throw new Error(`Unknown layout style: ${layoutStyle}`);
        } 
        itemView.render(viewContainer);
        const cacheItem = new LayoutManagerCache(itemView, container, monster, isTwoColumns);
        this.#cache.push(cacheItem);
    }

    onChangeLayoutStyle() {
        this.#cache
            .filter((item) => item.getContainer().isActiveElement)
            .forEach((item) => this.renderLayout(item.getContainer(), item.getMonster(), item.getIsTwoColumns()));
    }

    dispose() {
        this.#cache = [];
    }
}
