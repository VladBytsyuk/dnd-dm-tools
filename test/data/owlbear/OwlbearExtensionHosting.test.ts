import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
	getOwlbearExtensionInstallUrl,
	isAllowedOwlbearExtensionOrigin,
	OWLBEAR_DEVELOPMENT_EXTENSION_URL,
	OWLBEAR_PRODUCTION_EXTENSION_URL,
} from "src/data/owlbear/OwlbearExtensionHosting";

describe("Owlbear extension hosting", () => {
	it("uses separate stable production and local development install URLs", () => {
		expect(getOwlbearExtensionInstallUrl(false)).toBe(OWLBEAR_PRODUCTION_EXTENSION_URL);
		expect(getOwlbearExtensionInstallUrl(true)).toBe(OWLBEAR_DEVELOPMENT_EXTENSION_URL);
	});

	it("allows production, development, and legacy local WebSocket origins", () => {
		expect(isAllowedOwlbearExtensionOrigin("https://vladbytsyuk.github.io", "http://localhost:43125")).toBe(true);
		expect(isAllowedOwlbearExtensionOrigin("http://localhost:5173", "http://localhost:43125")).toBe(true);
		expect(isAllowedOwlbearExtensionOrigin("http://localhost:43125", "http://localhost:43125")).toBe(true);
		expect(isAllowedOwlbearExtensionOrigin("https://temporary.trycloudflare.com", "http://localhost:43125")).toBe(false);
	});

	it("uses Owlbear-compatible root paths for production and development assets", async () => {
		const manifest = JSON.parse(await readFile("owlbear-extension/public/manifest.json", "utf8"));
		const assetPaths = [manifest.icon, manifest.background_url, manifest.action.icon, manifest.action.popover];
		const productionOrigin = new URL(OWLBEAR_PRODUCTION_EXTENSION_URL).origin;
		const developmentOrigin = new URL(OWLBEAR_DEVELOPMENT_EXTENSION_URL).origin;

		expect(assetPaths.map((path: string) => productionOrigin + path)).toEqual([
			"https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/icon-v2.svg",
			"https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/background.html",
			"https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/icon-v2.svg",
			"https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/index.html",
		]);
		expect(assetPaths.map((path: string) => developmentOrigin + path)).toEqual([
			"http://localhost:5173/dnd-dm-tools/owlbear-extension/icon-v2.svg",
			"http://localhost:5173/dnd-dm-tools/owlbear-extension/background.html",
			"http://localhost:5173/dnd-dm-tools/owlbear-extension/icon-v2.svg",
			"http://localhost:5173/dnd-dm-tools/owlbear-extension/index.html",
		]);
	});
});
