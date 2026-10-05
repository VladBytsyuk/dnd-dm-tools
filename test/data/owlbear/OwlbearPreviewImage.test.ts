import { afterEach, describe, expect, it, vi } from "vitest";
import { loadOwlbearPreviewDataUrl } from "src/data/owlbear/OwlbearPreviewImage";

afterEach(() => vi.unstubAllGlobals());

describe("Owlbear preview data images", () => {
	it("converts a displayed SVG data URL into the base64 image sent to Owlbear", async () => {
		class LoadedImage {
			naturalWidth = 128;
			naturalHeight = 64;
			onload: (() => void) | null = null;
			set src(_value: string) { queueMicrotask(() => this.onload?.()); }
		}
		vi.stubGlobal("Image", LoadedImage);
		const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" />';

		const image = await loadOwlbearPreviewDataUrl("Огремох", `data:image/svg+xml,${encodeURIComponent(svg)}`);

		expect(image).toMatchObject({ name: "Огремох", mime: "image/svg+xml", width: 128, height: 64 });
		expect(image.dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(atob(image.dataUrl.split(",")[1])).toBe(svg);
	});

	it("rejects unsupported image formats", async () => {
		await expect(loadOwlbearPreviewDataUrl("Файл", "data:image/bmp;base64,AA=="))
			.rejects.toThrow("Поддерживаются PNG, JPEG, WebP, GIF и SVG.");
	});
});
