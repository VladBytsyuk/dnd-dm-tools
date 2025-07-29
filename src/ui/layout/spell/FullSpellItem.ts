import type { FullSpell } from "src/domain/spell";
import type { LayoutItemView } from "../LayoutItemView";
import LayoutFullSpell from "./LayoutFullSpell.svelte";
import { mount, unmount } from 'svelte';
import { TEXTS } from "src/res/texts_ru";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";

const SPELL_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-spell-item-view';

export class FullSpellItemView implements LayoutItemView {

	// ---- fields ----
    #component: ReturnType<typeof LayoutFullSpell> | undefined;
    #spell: FullSpell;
    #uiEventListener: IUiEventListener;

    constructor(
        spell: FullSpell,
        uiEventListener: IUiEventListener,
    ) {
        this.#spell = spell;
        this.#uiEventListener = uiEventListener;
    }

	// ---- methods ----
    getViewType() { return SPELL_ITEM_VIEW_TYPE_EXAMPLE; }
    getDisplayText() { return TEXTS.fullSpell; }

    render(container: Element) {
        this.#component = mount(LayoutFullSpell, {
            target: container,
            props: {
                spell: this.#spell,
                uiEventListener: this.#uiEventListener,
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