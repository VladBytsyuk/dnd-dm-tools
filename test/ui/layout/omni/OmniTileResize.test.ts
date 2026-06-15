import { describe, expect, it } from "vitest";
import {
	clampTileRatio,
	getTileRatioFromPointer,
} from "src/ui/layout/omni/OmniTileResize";

describe("OmniTileResize", () => {
	it("converts a pointer position to a tile ratio", () => {
		expect(getTileRatioFromPointer(300, 100, 400)).toBe(0.5);
	});

	it("clamps pointer positions to the minimum tile heights", () => {
		expect(getTileRatioFromPointer(100, 100, 400)).toBe(0.15);
		expect(getTileRatioFromPointer(500, 100, 400)).toBe(0.85);
	});

	it("falls back to an even split for a zero-height container", () => {
		expect(getTileRatioFromPointer(100, 100, 0)).toBe(0.5);
	});

	it("clamps ratios directly", () => {
		expect(clampTileRatio(0)).toBe(0.15);
		expect(clampTileRatio(0.6)).toBe(0.6);
		expect(clampTileRatio(1)).toBe(0.85);
	});
});
