import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "src/ui/layout/LayoutItemView";
import { App, Notice } from "obsidian";
import { FullSpellItemView } from "src/ui/layout/spell/FullSpellItem";
import type { Spellbook } from "src/data/spellbook";
import { openSidePanelSpellbook } from "../ribbon/side_panel_spellbook";
import type { HtmlLinkListener } from "src/domain/html_click";

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
    #htmlLinkListener: HtmlLinkListener;
    #cache: LayoutManagerCache[] = [];
    

    constructor(app: App, spellbook: Spellbook, htmlLinkListener: HtmlLinkListener) {
        this.#app = app;
        this.#spellbook = spellbook;
        this.#htmlLinkListener = htmlLinkListener;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        spell: FullSpell,
    ) {
        const onRoll = (label: string, value: number): void => {
            new Notice(`${label ? label + ": " : ""}${value}`);
        };
        const onSpellClick = async (url: string) => {
            const fullSpell = await this.#spellbook.getFullSpellByUrl(url);
            if (fullSpell) await openSidePanelSpellbook(this.#app.workspace, fullSpell);
        };
        this.#cache
            .find((item) => item.getContainer() == container)
            ?.getItemView()
            ?.destroy();
        container.empty();
        const viewContainer = container.createDiv("statblock-view-container");
        let itemView: LayoutItemView = new FullSpellItemView(spell, this.#htmlLinkListener, onRoll);

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
