import { mount } from "svelte";
import DiceRoller from 'src/ui/layout/dice-roller/DiceRoller.svelte';
import type { IDiceRollListener } from "src/domain/listeners/dice_roll_listener";

export class DiceRollersManager {
    
    #diceRollers: DiceRoller[];
    #onRoll: (label: string, value: number) => void;

    constructor(
        onRoll: (label: string, value: number) => void,
    ) {
        this.#diceRollers = [];
        this.#onRoll = onRoll;
    }

    static create(diceRollListener: IDiceRollListener): DiceRollersManager {
        return new DiceRollersManager(diceRollListener.onDiceRoll);
    }  

    onMount() {
        const elements = document.querySelectorAll('dice-roller');
    
        elements.forEach(element => {
            const content = element.innerHTML.trim();
            element.empty();
            const component = mount(DiceRoller, {
                target: element, 
                props: {
                    formula: element.getAttribute('formula') || "",
                    label: element.getAttribute('label'),
                    content: content,
                    onRoll: this.#onRoll,
                },
            });
            this.#diceRollers.push(component);
        });
    }

    onDestroy() {
        this.#diceRollers = [];
    }
}
