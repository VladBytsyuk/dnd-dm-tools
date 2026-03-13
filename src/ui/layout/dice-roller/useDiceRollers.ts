import { onDestroy, onMount } from "svelte";
import type { IDiceRollListener } from "src/domain/listeners/dice_roll_listener";
import { DiceRollersManager } from "./DiceRollersManager";

export function useDiceRollers(diceRollListener: IDiceRollListener) {
	const diceRollersManager = DiceRollersManager.create(diceRollListener);

	onMount(async () => {
		diceRollersManager.onMount();
	});

	onDestroy(() => {
		diceRollersManager.onDestroy();
	});

	return diceRollersManager;
}
