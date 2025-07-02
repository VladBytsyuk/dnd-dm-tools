import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "src/ui/layout/LayoutItemView";
import { App, Notice } from "obsidian";
import { FullSpellItemView } from "src/ui/layout/spell/FullSpellItem";
import type { Spellbook } from "src/data/spellbook";
import { openSidePanelSpellbook } from "../ribbon/side_panel_spellbook";
import type { UiEventListener } from "src/data/ui_event_listener";

class LayoutManagerCache {

    #itemView: LayoutItemView;
    #container: Element;
    #spell: FullSpell;

    constructor(itemView: LayoutItemView, container: Element, spell: FullSpell) {
        this.#itemView = itemView;
        this.#container = container;
        this.#spell = spell;
    }

    getItemView(): LayoutItemView { return this.#itemView; };
    getContainer(): Element { return this.#container; };
    getSpell(): FullSpell { return this.#spell; };
}

export class SpellLayoutManager {


	// ---- fields ----
    #app: App;
    #spellbook: Spellbook;
    #uiEventListener: UiEventListener;
    #cache: LayoutManagerCache[] = [];
    

    constructor(app: App, spellbook: Spellbook, uiEventListener: UiEventListener) {
        this.#app = app;
        this.#spellbook = spellbook;
        this.#uiEventListener = uiEventListener;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        spell: FullSpell,
    ) {
        this.#cache
            .find((item) => item.getContainer() == container)
            ?.getItemView()
            ?.destroy();
        container.empty();
        const viewContainer = container.createDiv("statblock-view-container");
        let itemView: LayoutItemView = new FullSpellItemView(spell, this.#uiEventListener);

        itemView.render(viewContainer);
        const cacheItem = new LayoutManagerCache(itemView, container, spell);
        this.#cache.push(cacheItem);
    }

    onChangeLayoutStyle() {
        this.#cache
            .filter((item) => item.getContainer().isActiveElement)
            .forEach((item) => this.renderLayout(item.getContainer(), item.getSpell()));
    }

    dispose() {
        this.#cache = [];
    }
}
