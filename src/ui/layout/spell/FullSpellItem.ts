import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "../LayoutItemView";
import LayoutFullSpell from "./LayoutFullSpell.svelte";
import { mount, unmount } from 'svelte';
import { TEXTS } from "src/res/texts_ru";
import type { HtmlLinkListener } from "src/domain/html_click";

const SPELL_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-spell-item-view';

export class FullSpellItemView implements LayoutItemView {

	// ---- fields ----
    #component: ReturnType<typeof LayoutFullSpell> | undefined;
    #spell: FullSpell;
    #htmlLinkListener: HtmlLinkListener;
    #onRoll: (label: string, value: number) => void;

    constructor(
        spell: FullSpell,
        htmlLinkListener: HtmlLinkListener,
        onRoll: (label: string, value: number) => void,
    ) {
        this.#spell = spell;
        this.#htmlLinkListener = htmlLinkListener;
        this.#onRoll = onRoll;
    }

	// ---- methods ----
    getViewType() { return SPELL_ITEM_VIEW_TYPE_EXAMPLE; }
    getDisplayText() { return TEXTS.fullSpell; }

    render(container: Element) {
        this.#component = mount(LayoutFullSpell, {
            target: container,
            props: {
                spell: this.#spell,
                onRoll: this.#onRoll,
                htmlLinkListener: this.#htmlLinkListener,
            },
        });
    }

    destroy() {
        if (this.#component) {
            unmount(this.#component);
            this.#component = undefined;
        }
    }
}