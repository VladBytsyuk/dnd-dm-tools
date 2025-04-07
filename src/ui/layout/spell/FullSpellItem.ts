import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "../LayoutItemView";
import LayoutFullSpell from "./LayoutFullSpell.svelte";
import { mount, unmount } from 'svelte';
import { TEXTS } from "src/res/texts_ru";

const SPELL_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-spell-item-view';

export class FullSpellItemView implements LayoutItemView {

	// ---- fields ----
    #component: ReturnType<typeof LayoutFullSpell> | undefined;
    #spell: FullSpell;
    #onRoll: (label: string, value: number) => void;
    #onSpellHover: (url: string) => void;

    constructor(
        spell: FullSpell,
        onRoll: (label: string, value: number) => void,
        onSpellHover: (url: string) => void,
    ) {
        this.#spell = spell;
        this.#onRoll = onRoll;
        this.#onSpellHover = onSpellHover;
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
                onSpellHover: this.#onSpellHover,
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