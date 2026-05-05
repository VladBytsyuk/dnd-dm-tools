import { onDestroy, onMount } from "svelte";
import type { IDiceRollListener } from "src/domain/listeners/dice_roll_listener";
import { DiceRollersManager } from "./DiceRollersManager";

export function useDiceRollers(getDiceRollListener: () => IDiceRollListener) {
	let diceRollersManager: DiceRollersManager | undefined;

	onMount(async () => {
		diceRollersManager = DiceRollersManager.create(getDiceRollListener());
		diceRollersManager.onMount();
	});

	onDestroy(() => {
		diceRollersManager?.onDestroy();
	});
}
