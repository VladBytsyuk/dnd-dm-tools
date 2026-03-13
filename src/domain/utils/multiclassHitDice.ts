import type { ClassEntry } from "../models/character/ClassEntry";
import { getHitDieForClass } from "./classHitDice";

/**
 * Represents the current and total hit dice for a specific die type
 */
export interface HitDicePool {
	/** Current available hit dice (can be spent during short rest) */
	current: number;
	/** Total hit dice from class levels (maximum) */
	total: number;
}

/**
 * Collection of hit dice pools by die type (e.g., { "d8": { current: 2, total: 2 } })
 */
export type HitDicePools = Record<string, HitDicePool>;

/**
 * Calculate hit dice pools from character classes
 * Groups classes by hit die type and sums their levels
 *
 * @param classes - Array of character class entries
 * @returns Hit dice pools by die type
 *
 * @example
 * const classes = [
 *   { className: "Жрец", level: 2 },
 *   { className: "Варвар", level: 1 }
 * ];
 * const pools = calculateHitDicePools(classes);
 * // Returns: { "d8": { current: 2, total: 2 }, "d12": { current: 1, total: 1 } }
 */
export function calculateHitDicePools(classes: ClassEntry[]): HitDicePools {
	const pools: HitDicePools = {};

	for (const classEntry of classes) {
		// Skip invalid entries
		if (!classEntry.className || classEntry.level <= 0) {
			continue;
		}

		const dieType = getHitDieForClass(classEntry.className);
		const level = Math.floor(classEntry.level);

		if (!pools[dieType]) {
			pools[dieType] = { current: 0, total: 0 };
		}

		pools[dieType].total += level;
		pools[dieType].current += level;
	}

	return pools;
}

/**
 * Synchronize hit dice pools with current character classes
 * Preserves spent dice where possible when classes change
 *
 * @param existingPools - Current hit dice pools
 * @param classes - Updated character class entries
 * @returns Updated hit dice pools
 *
 * @example
 * const existing = { "d8": { current: 1, total: 2 } }; // 1 die spent
 * const classes = [{ className: "Жрец", level: 3 }]; // Level up
 * const synced = syncHitDiceWithClasses(existing, classes);
 * // Returns: { "d8": { current: 2, total: 3 } } // Preserves 1 spent die
 */
export function syncHitDiceWithClasses(
	existingPools: HitDicePools,
	classes: ClassEntry[],
): HitDicePools {
	const newTotals = calculateHitDicePools(classes);
	const synced: HitDicePools = {};

	// Update existing pools with new totals
	for (const [dieType, newPool] of Object.entries(newTotals)) {
		const existing = existingPools[dieType];

		if (existing) {
			// When total increases (level up): preserve spent dice count
			// When total decreases (level down): clamp current to new total
			let newCurrent: number;

			if (newPool.total > existing.total) {
				// Leveling up: add new dice to current
				const diceGained = newPool.total - existing.total;
				newCurrent = existing.current + diceGained;
			} else {
				// Leveling down or same: clamp current to new total
				newCurrent = Math.min(existing.current, newPool.total);
			}

			synced[dieType] = {
				current: newCurrent,
				total: newPool.total,
			};
		} else {
			// New die type - all dice available
			synced[dieType] = { ...newPool };
		}
	}

	// Remove die types no longer present in classes
	// (This happens automatically by only including newTotals keys)

	return synced;
}

/**
 * Spend one hit die of the specified type
 *
 * @param pools - Current hit dice pools
 * @param dieType - Type of die to spend (e.g., "d8")
 * @returns Updated pools, or null if the die cannot be spent
 *
 * @example
 * const pools = { "d8": { current: 2, total: 2 } };
 * const updated = spendHitDie(pools, "d8");
 * // Returns: { "d8": { current: 1, total: 2 } }
 */
export function spendHitDie(pools: HitDicePools, dieType: string): HitDicePools | null {
	const pool = pools[dieType];

	// Validate: die type exists and has available dice
	if (!pool || pool.current <= 0) {
		return null;
	}

	return {
		...pools,
		[dieType]: {
			...pool,
			current: pool.current - 1,
		},
	};
}

/**
 * Recover hit dice on long rest
 * D&D 5e rules: Restore up to half of total hit dice (rounded down, minimum 1)
 *
 * @param pools - Current hit dice pools
 * @returns Updated pools with dice recovered
 *
 * @example
 * const pools = {
 *   "d8": { current: 0, total: 3 },
 *   "d10": { current: 1, total: 2 }
 * };
 * const recovered = recoverHitDiceOnLongRest(pools);
 * // Total dice: 5, recover: floor(5/2) = 2
 * // Distributes proportionally: d8 gets 1-2, d10 gets 0-1
 */
export function recoverHitDiceOnLongRest(pools: HitDicePools): HitDicePools {
	// Calculate total hit dice across all pools
	const totalDice = Object.values(pools).reduce((sum, pool) => sum + pool.total, 0);

	// D&D 5e: Recover half of total (rounded down, minimum 1)
	const diceToRecover = Math.max(1, Math.floor(totalDice / 2));

	// Sort die types for consistent recovery order (by die size)
	const sortedEntries = getSortedDieTypes(pools).map((dieType) => [
		dieType,
		pools[dieType],
	] as [string, HitDicePool]);

	// Distribute recovery round-robin for fair distribution
	const recovered: HitDicePools = {};

	// Initialize recovered pools
	for (const [dieType, pool] of sortedEntries) {
		recovered[dieType] = { ...pool };
	}

	let remainingToRecover = diceToRecover;
	let madeProgress = true;

	// Round-robin distribution: give 1 die to each pool that needs it, repeat until done
	while (remainingToRecover > 0 && madeProgress) {
		madeProgress = false;

		for (const [dieType] of sortedEntries) {
			if (remainingToRecover <= 0) break;

			const pool = recovered[dieType];
			const spentDice = pool.total - pool.current;

			if (spentDice > 0) {
				pool.current += 1;
				remainingToRecover -= 1;
				madeProgress = true;
			}
		}
	}

	return recovered;
}

/**
 * Get sorted die type keys for consistent display order
 * Order: d4, d6, d8, d10, d12
 *
 * @param pools - Hit dice pools
 * @returns Sorted array of die type keys
 */
export function getSortedDieTypes(pools: HitDicePools): string[] {
	const dieOrder = ["d4", "d6", "d8", "d10", "d12"];
	return Object.keys(pools).sort((a, b) => {
		const indexA = dieOrder.indexOf(a);
		const indexB = dieOrder.indexOf(b);
		return indexA - indexB;
	});
}
