import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "../LayoutItemView";
import LayoutFullSpell from "./LayoutFullSpell.svelte";
import { mount, unmount } from 'svelte';
import { TEXTS } from "src/res/texts_ru";

const SPELL_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-spell-item-view';

export class SpellTooltipItemView implements LayoutItemView {

	// ---- fields ----
    #component: ReturnType<typeof LayoutFullSpell> | undefined;
    #spell: FullSpell;
    #x: number;
    #y: number;
    #onRoll: (label: string, value: number) => void;
    #onSpellRelease: () => void;

    constructor(
        spell: FullSpell,
        x: number,
        y: number,
        onRoll: (label: string, value: number) => void,
        onSpellRelease: () => void,
    ) {
        this.#spell = spell;
        this.#x = x;
        this.#y = y;
        this.#onRoll = onRoll;
        this.#onSpellRelease = onSpellRelease;
    }

	// ---- methods ----
    getViewType() { return SPELL_ITEM_VIEW_TYPE_EXAMPLE; }
    getDisplayText() { return TEXTS.fullSpell; }

    render(container: HTMLElement) {
        container.style["left"] = this.#x + "px";
        container.style["top"] = this.#y + "px";
        container.addEventListener('click', this.#onSpellRelease);
        this.#component = mount(LayoutFullSpell, {
            target: container,
            props: {
                spell: this.#spell,
                onRoll: this.#onRoll,
            },
        });
    }

    destroy() {
        if (this.#component) {
            this.#onSpellRelease();
            unmount(this.#component);
            this.#component = undefined;
        }
    }
}