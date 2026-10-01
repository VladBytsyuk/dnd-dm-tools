import { mount, unmount } from "svelte";
import DiceRoller from 'src/ui/layout/dice-roller/DiceRoller.svelte';
import type { IDiceRollListener } from "src/domain/listeners/dice_roll_listener";
import type { RollTraceResult } from "../../../domain/dice";

export class DiceRollersManager {
    
    #diceRollers: Map<Element, any>;
    #onRoll: (label: string, value: RollTraceResult) => void;
    #root: ParentNode;

    constructor(
        onRoll: (label: string, value: RollTraceResult) => void,
        root: ParentNode = document,
    ) {
        this.#diceRollers = new Map();
        this.#onRoll = onRoll;
        this.#root = root;
    }

    static create(diceRollListener: IDiceRollListener, root: ParentNode = document): DiceRollersManager {
        return new DiceRollersManager(diceRollListener.onDiceRoll, root);
    }

    onMount() {
        const elements = this.#root.querySelectorAll('dice-roller');

        elements.forEach(element => {
            if (this.#diceRollers.has(element)) return;
            const formula = element.getAttribute('formula') || "";
            const content = element.innerHTML.trim() || formula;
            element.empty();
            const component = mount(DiceRoller, {
                target: element,
                props: {
                    formula,
                    multiplier: Number(element.getAttribute('multiplier')) || 1,
                    label: element.getAttribute('label'),
                    content: content,
                    onRoll: this.#onRoll,
                },
            });
            this.#diceRollers.set(element, component);
        });
    }

    onDestroy() {
        this.#diceRollers.forEach((component) => void unmount(component));
        this.#diceRollers.clear();
    }
}
