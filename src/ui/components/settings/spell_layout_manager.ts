import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "src/ui/layout/LayoutItemView";
import { App, Notice } from "obsidian";
import { FullSpellItemView } from "src/ui/layout/spell/FullSpellItem";

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
    #cache: LayoutManagerCache[] = [];
    

    constructor(app: App) {
        this.#app = app;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        spell: FullSpell,
    ) {
        const onRoll = (label: string, value: number): void => {
            new Notice(`${label ? label + ": " : ""}${value}`);
        };
        this.#cache
            .find((item) => item.getContainer() == container)
            ?.getItemView()
            ?.destroy();
        container.empty();
        const viewContainer = container.createDiv("statblock-view-container");
        let itemView: LayoutItemView = new FullSpellItemView(spell);

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
