import { describe, expect, it } from "vitest";
import {
	getTabInsertionPosition,
	normalizeTabInsertionPosition,
} from "src/ui/layout/omni/OmniTabDrag";

describe("OmniTabDrag", () => {
	it("finds insertion positions from tab midpoints", () => {
		const midpoints = [20, 60, 100];

		expect(getTabInsertionPosition(10, midpoints)).toBe(0);
		expect(getTabInsertionPosition(40, midpoints)).toBe(1);
		expect(getTabInsertionPosition(80, midpoints)).toBe(2);
		expect(getTabInsertionPosition(120, midpoints)).toBe(3);
	});

	it("adjusts forward moves after removing the source tab", () => {
		expect(normalizeTabInsertionPosition(3, 0, true, 3)).toBe(2);
		expect(normalizeTabInsertionPosition(2, 0, true, 3)).toBe(1);
	});

	it("preserves backward and cross-tile insertion positions", () => {
		expect(normalizeTabInsertionPosition(0, 2, true, 3)).toBe(0);
		expect(normalizeTabInsertionPosition(1, 2, false, 3)).toBe(1);
	});

	it("clamps positions for empty and populated targets", () => {
		expect(normalizeTabInsertionPosition(0, 0, false, 0)).toBe(0);
		expect(normalizeTabInsertionPosition(10, 0, false, 2)).toBe(2);
	});
});
