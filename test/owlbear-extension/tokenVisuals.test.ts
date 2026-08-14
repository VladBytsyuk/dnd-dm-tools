import { describe, expect, it } from "vitest";
import { getTokenVisualConfig, resolveTokenVisualImage } from "../../owlbear-extension/src/tokenVisuals";

describe("Owlbear token visuals", () => {
	it("keeps a living participant unchanged", () => {
		expect(getTokenVisualConfig({ hpCurrent: 1, isDead: false })).toEqual({
			state: "normal",
			darkeningOpacity: 0,
			tokenOpacity: 1,
		});
	});

	it("darkens a participant at zero or negative HP and leaves 50 percent opacity", () => {
			expect(getTokenVisualConfig({ hpCurrent: 0, isDead: false })).toEqual({
			state: "down",
			darkeningOpacity: 0.5,
			tokenOpacity: 0.75,
		});
		expect(getTokenVisualConfig({ hpCurrent: -1, isDead: false }).state).toBe("down");
	});

	it("gives death priority and leaves 20 percent opacity", () => {
		expect(getTokenVisualConfig({ hpCurrent: 10, isDead: true })).toEqual({
			state: "dead",
			darkeningOpacity: 0.8,
			tokenOpacity: 0.5,
		});
	});

	it("uses an HTTP visual variant and caps its raster size", () => {
		const image = { url: "http://localhost:34465/token-images/asset/image%2Fpng", mime: "image/png", width: 2048, height: 1024 };
		const visual = resolveTokenVisualImage({ hpCurrent: 0, isDead: false } as any, image);

		expect(visual.url).toBe(`${image.url}?visual=down&width=512&height=256`);
		expect(visual.mime).toBe("image/svg+xml");
		expect({ width: visual.width, height: visual.height }).toEqual({ width: 512, height: 256 });
		expect(resolveTokenVisualImage({ hpCurrent: 1, isDead: false } as any, image)).toBe(image);
	});
});
