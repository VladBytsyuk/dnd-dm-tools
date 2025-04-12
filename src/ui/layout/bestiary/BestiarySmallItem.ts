import type { SmallMonster } from "src/domain/monster";
import BestiarySmall from "./BestiarySmall.svelte";
import { mount, unmount } from 'svelte';
import type { LayoutItemView } from '../LayoutItemView';

export class BestiarySmallItemView implements LayoutItemView {
    #smallMonster: SmallMonster;
    #component: ReturnType<typeof BestiarySmall> | undefined;

    constructor(smallMonster: SmallMonster) {
        this.#smallMonster = smallMonster;
    }

    render(): HTMLElement {
        const container = document.createElement("div");
        this.#component = mount(BestiarySmall, {
            target: container,
            props: {
                smallMonster: this.#smallMonster,
            },
        });
        return container;
    }

    destroy(): void {
        if (this.#component) {
            unmount(this.#component);
            this.#component = undefined;
        }
    }
}
