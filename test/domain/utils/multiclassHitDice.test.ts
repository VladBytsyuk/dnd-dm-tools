import { describe, it, expect } from "vitest";
import type { ClassEntry } from "@/domain/models/character/ClassEntry";
import {
	calculateHitDicePools,
	syncHitDiceWithClasses,
	spendHitDie,
	recoverHitDiceOnLongRest,
	getSortedDieTypes,
	type HitDicePools,
} from "@/domain/utils/multiclassHitDice";

describe("multiclassHitDice utilities", () => {
	describe("calculateHitDicePools", () => {
		it("should calculate pools for single class", () => {
			const classes: ClassEntry[] = [{ className: "Воин", level: 5 }];

			const pools = calculateHitDicePools(classes);

			expect(pools).toEqual({
				d10: { current: 5, total: 5 },
			});
		});

		it("should calculate pools for multiclass with different die types", () => {
			const classes: ClassEntry[] = [
				{ className: "Жрец", level: 2 },
				{ className: "Варвар", level: 1 },
			];

			const pools = calculateHitDicePools(classes);

			expect(pools).toEqual({
				d8: { current: 2, total: 2 },
				d12: { current: 1, total: 1 },
			});
		});

		it("should combine levels for multiclass with same die type", () => {
			const classes: ClassEntry[] = [
				{ className: "Воин", level: 3 },
				{ className: "Паладин", level: 2 },
			];

			const pools = calculateHitDicePools(classes);

			// Both Fighter (Воин) and Paladin (Паладин) use d10
			expect(pools).toEqual({
				d10: { current: 5, total: 5 },
			});
		});

		it("should handle three different die types", () => {
			const classes: ClassEntry[] = [
				{ className: "Варвар", level: 2 }, // d12
				{ className: "Воин", level: 3 }, // d10
				{ className: "Волшебник", level: 1 }, // d6
			];

			const pools = calculateHitDicePools(classes);

			expect(pools).toEqual({
				d12: { current: 2, total: 2 },
				d10: { current: 3, total: 3 },
				d6: { current: 1, total: 1 },
			});
		});

		it("should skip invalid class entries", () => {
			const classes: ClassEntry[] = [
				{ className: "", level: 2 }, // Empty name
				{ className: "Воин", level: 0 }, // Zero level
				{ className: "Жрец", level: -1 }, // Negative level
				{ className: "Варвар", level: 3 }, // Valid
			];

			const pools = calculateHitDicePools(classes);

			expect(pools).toEqual({
				d12: { current: 3, total: 3 },
			});
		});

		it("should use default d8 for unknown class names", () => {
			const classes: ClassEntry[] = [{ className: "НеизвестныйКласс", level: 4 }];

			const pools = calculateHitDicePools(classes);

			expect(pools).toEqual({
				d8: { current: 4, total: 4 },
			});
		});

		it("should handle empty classes array", () => {
			const pools = calculateHitDicePools([]);

			expect(pools).toEqual({});
		});

		it("should floor fractional levels", () => {
			const classes: ClassEntry[] = [{ className: "Воин", level: 3.7 }];

			const pools = calculateHitDicePools(classes);

			expect(pools).toEqual({
				d10: { current: 3, total: 3 },
			});
		});
	});

	describe("syncHitDiceWithClasses", () => {
		it("should preserve spent dice when leveling up", () => {
			const existing: HitDicePools = {
				d8: { current: 1, total: 2 }, // 1 die spent
			};
			const classes: ClassEntry[] = [{ className: "Жрец", level: 3 }];

			const synced = syncHitDiceWithClasses(existing, classes);

			// Should have 3 total, with 1 still spent
			expect(synced).toEqual({
				d8: { current: 2, total: 3 },
			});
		});

		it("should clamp current to new total when leveling down", () => {
			const existing: HitDicePools = {
				d10: { current: 4, total: 5 },
			};
			const classes: ClassEntry[] = [{ className: "Воин", level: 3 }];

			const synced = syncHitDiceWithClasses(existing, classes);

			// Current should be clamped to new total of 3
			expect(synced).toEqual({
				d10: { current: 3, total: 3 },
			});
		});

		it("should add new die types when multiclassing", () => {
			const existing: HitDicePools = {
				d8: { current: 3, total: 3 },
			};
			const classes: ClassEntry[] = [
				{ className: "Жрец", level: 3 },
				{ className: "Варвар", level: 1 }, // New class
			];

			const synced = syncHitDiceWithClasses(existing, classes);

			expect(synced).toEqual({
				d8: { current: 3, total: 3 },
				d12: { current: 1, total: 1 }, // New die type
			});
		});

		it("should remove die types when class is removed", () => {
			const existing: HitDicePools = {
				d8: { current: 2, total: 2 },
				d12: { current: 1, total: 1 },
			};
			const classes: ClassEntry[] = [
				{ className: "Жрец", level: 2 }, // Barbarian removed
			];

			const synced = syncHitDiceWithClasses(existing, classes);

			expect(synced).toEqual({
				d8: { current: 2, total: 2 },
				// d12 removed
			});
		});

		it("should handle complete class change", () => {
			const existing: HitDicePools = {
				d10: { current: 2, total: 4 }, // 2 spent
			};
			const classes: ClassEntry[] = [{ className: "Волшебник", level: 3 }];

			const synced = syncHitDiceWithClasses(existing, classes);

			// Old d10 pool removed, new d6 pool added with all dice available
			expect(synced).toEqual({
				d6: { current: 3, total: 3 },
			});
		});

		it("should handle multiclass to same die type", () => {
			const existing: HitDicePools = {
				d10: { current: 2, total: 3 }, // Fighter with 1 spent
			};
			const classes: ClassEntry[] = [
				{ className: "Воин", level: 3 },
				{ className: "Паладин", level: 2 }, // Both use d10
			];

			const synced = syncHitDiceWithClasses(existing, classes);

			// Should have 5 total d10, with 1 still spent
			expect(synced).toEqual({
				d10: { current: 4, total: 5 },
			});
		});

		it("should handle empty existing pools", () => {
			const existing: HitDicePools = {};
			const classes: ClassEntry[] = [
				{ className: "Жрец", level: 2 },
				{ className: "Варвар", level: 1 },
			];

			const synced = syncHitDiceWithClasses(existing, classes);

			expect(synced).toEqual({
				d8: { current: 2, total: 2 },
				d12: { current: 1, total: 1 },
			});
		});

		it("should prevent negative current values", () => {
			const existing: HitDicePools = {
				d8: { current: 0, total: 5 }, // All spent
			};
			const classes: ClassEntry[] = [{ className: "Жрец", level: 2 }];

			const synced = syncHitDiceWithClasses(existing, classes);

			// Spent 5, but now only have 2 total - current should be 0
			expect(synced).toEqual({
				d8: { current: 0, total: 2 },
			});
		});
	});

	describe("spendHitDie", () => {
		it("should spend one hit die", () => {
			const pools: HitDicePools = {
				d8: { current: 3, total: 3 },
			};

			const updated = spendHitDie(pools, "d8");

			expect(updated).toEqual({
				d8: { current: 2, total: 3 },
			});
		});

		it("should return null when no dice available", () => {
			const pools: HitDicePools = {
				d8: { current: 0, total: 3 },
			};

			const updated = spendHitDie(pools, "d8");

			expect(updated).toBeNull();
		});

		it("should return null for non-existent die type", () => {
			const pools: HitDicePools = {
				d8: { current: 2, total: 2 },
			};

			const updated = spendHitDie(pools, "d12");

			expect(updated).toBeNull();
		});

		it("should not modify other die types", () => {
			const pools: HitDicePools = {
				d8: { current: 2, total: 2 },
				d12: { current: 1, total: 1 },
			};

			const updated = spendHitDie(pools, "d8");

			expect(updated).toEqual({
				d8: { current: 1, total: 2 },
				d12: { current: 1, total: 1 }, // Unchanged
			});
		});
	});

	describe("recoverHitDiceOnLongRest", () => {
		it("should recover half of total hit dice (rounded down)", () => {
			const pools: HitDicePools = {
				d8: { current: 0, total: 5 },
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// 5 total → recover floor(5/2) = 2
			expect(recovered).toEqual({
				d8: { current: 2, total: 5 },
			});
		});

		it("should recover minimum 1 die", () => {
			const pools: HitDicePools = {
				d8: { current: 0, total: 1 },
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// 1 total → recover max(1, floor(1/2)) = 1
			expect(recovered).toEqual({
				d8: { current: 1, total: 1 },
			});
		});

		it("should distribute recovery across multiple die types", () => {
			const pools: HitDicePools = {
				d8: { current: 0, total: 3 },
				d10: { current: 0, total: 2 },
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// Total: 5 → recover floor(5/2) = 2
			// Distribute to most depleted first
			expect(recovered.d8.current + recovered.d10.current).toBe(2);
			expect(recovered.d8.total).toBe(3);
			expect(recovered.d10.total).toBe(2);
		});

		it("should not exceed spent dice for each type", () => {
			const pools: HitDicePools = {
				d8: { current: 2, total: 3 }, // 1 spent
				d12: { current: 0, total: 2 }, // 2 spent
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// Total: 5 → recover floor(5/2) = 2
			// d8 can recover 1, d12 can recover 2 → both get recovered
			expect(recovered).toEqual({
				d8: { current: 3, total: 3 },
				d12: { current: 1, total: 2 },
			});
		});

		it("should handle no dice spent", () => {
			const pools: HitDicePools = {
				d8: { current: 3, total: 3 },
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// No dice to recover
			expect(recovered).toEqual({
				d8: { current: 3, total: 3 },
			});
		});

		it("should handle multiple die types with partial spending", () => {
			const pools: HitDicePools = {
				d6: { current: 1, total: 2 }, // 1 spent
				d8: { current: 1, total: 2 }, // 1 spent
				d12: { current: 2, total: 3 }, // 1 spent
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// Total: 7 → recover floor(7/2) = 3
			// All 3 spent dice should be recovered
			expect(recovered).toEqual({
				d6: { current: 2, total: 2 },
				d8: { current: 2, total: 2 },
				d12: { current: 3, total: 3 },
			});
		});

		it("should prioritize recovery in sorted order", () => {
			const pools: HitDicePools = {
				d12: { current: 0, total: 2 },
				d6: { current: 0, total: 2 },
			};

			const recovered = recoverHitDiceOnLongRest(pools);

			// Total: 4 → recover floor(4/2) = 2
			// Should recover in alphabetical order: d12, then d6
			// Both have 2 spent, so both get 1
			expect(recovered.d12.current).toBe(1);
			expect(recovered.d6.current).toBe(1);
		});
	});

	describe("getSortedDieTypes", () => {
		it("should sort die types in correct order", () => {
			const pools: HitDicePools = {
				d12: { current: 1, total: 1 },
				d6: { current: 2, total: 2 },
				d10: { current: 3, total: 3 },
				d8: { current: 1, total: 1 },
			};

			const sorted = getSortedDieTypes(pools);

			expect(sorted).toEqual(["d6", "d8", "d10", "d12"]);
		});

		it("should handle single die type", () => {
			const pools: HitDicePools = {
				d8: { current: 3, total: 3 },
			};

			const sorted = getSortedDieTypes(pools);

			expect(sorted).toEqual(["d8"]);
		});

		it("should handle empty pools", () => {
			const pools: HitDicePools = {};

			const sorted = getSortedDieTypes(pools);

			expect(sorted).toEqual([]);
		});

		it("should include d4 if present", () => {
			const pools: HitDicePools = {
				d8: { current: 2, total: 2 },
				d4: { current: 1, total: 1 },
			};

			const sorted = getSortedDieTypes(pools);

			expect(sorted).toEqual(["d4", "d8"]);
		});
	});

	describe("integration scenarios", () => {
		it("should handle full character lifecycle", () => {
			// Start: Level 3 Cleric
			let classes: ClassEntry[] = [{ className: "Жрец", level: 3 }];
			let pools = calculateHitDicePools(classes);
			expect(pools).toEqual({ d8: { current: 3, total: 3 } });

			// Spend 2 hit dice during short rest
			pools = spendHitDie(pools, "d8")!;
			pools = spendHitDie(pools, "d8")!;
			expect(pools).toEqual({ d8: { current: 1, total: 3 } });

			// Level up to 4
			classes = [{ className: "Жрец", level: 4 }];
			pools = syncHitDiceWithClasses(pools, classes);
			expect(pools).toEqual({ d8: { current: 2, total: 4 } }); // 2 still spent

			// Multiclass: Add 1 level of Barbarian
			classes = [
				{ className: "Жрец", level: 4 },
				{ className: "Варвар", level: 1 },
			];
			pools = syncHitDiceWithClasses(pools, classes);
			expect(pools).toEqual({
				d8: { current: 2, total: 4 },
				d12: { current: 1, total: 1 },
			});

			// Long rest: Recover dice
			pools = recoverHitDiceOnLongRest(pools);
			// Total: 5 → recover floor(5/2) = 2
			// d8 has 2 spent, d12 has 0 spent → d8 gets 2
			expect(pools).toEqual({
				d8: { current: 4, total: 4 },
				d12: { current: 1, total: 1 },
			});
		});

		it("should handle edge case: all dice spent before long rest", () => {
			let pools: HitDicePools = {
				d8: { current: 0, total: 2 },
				d12: { current: 0, total: 1 },
			};

			pools = recoverHitDiceOnLongRest(pools);

			// Total: 3 → recover floor(3/2) = 1
			// Should recover at least 1 die
			expect(pools.d8.current + pools.d12.current).toBe(1);
		});
	});
});
