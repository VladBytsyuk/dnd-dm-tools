import { App, TFile } from "obsidian";
import { describe, expect, it } from "vitest";
import {
	assertOwlbearImageDataUrlSize,
	MAX_OWLBEAR_IMAGE_BYTES,
	resolveOwlbearVaultImageFile,
	validateOwlbearRemoteImageUrl,
} from "src/data/owlbear/OwlbearVaultImage";

describe("resolveOwlbearVaultImageFile", () => {
	it("resolves relative and obsidian URLs through the vault file index", () => {
		const app = new App();
		const file = new TFile("tokens/goblin.png");
		app.vault.getAbstractFileByPath = (path) => path === file.path ? file : null;

		expect(resolveOwlbearVaultImageFile(app, "tokens/goblin.png")).toBe(file);
		expect(resolveOwlbearVaultImageFile(app, "obsidian://open?file=tokens%2Fgoblin.png")).toBe(file);
	});

	it("rejects paths that are not indexed inside the vault", () => {
		const app = new App();

		expect(() => resolveOwlbearVaultImageFile(app, "../outside.png")).toThrow("не найден внутри vault");
		expect(() => resolveOwlbearVaultImageFile(app, "file:///tmp/outside.png")).toThrow("только HTTP(S), data URL");
	});
});

describe("Owlbear remote image security", () => {
	it("allows ordinary public HTTPS image URLs", () => {
		expect(validateOwlbearRemoteImageUrl("https://cdn.example.com/tokens/goblin.png"))
			.toBe("https://cdn.example.com/tokens/goblin.png");
	});

	it.each([
		"http://cdn.example.com/token.png",
		"https://localhost/token.png",
		"https://127.0.0.1/token.png",
		"https://10.0.0.8/token.png",
		"https://[::1]/token.png",
		"https://cdn.example.com:8443/token.png",
	])("rejects unsafe remote source %s", (source) => {
		expect(() => validateOwlbearRemoteImageUrl(source)).toThrow();
	});

	it("rejects oversized inline images before decoding", () => {
		const oversized = `data:image/png;base64,${"A".repeat(Math.ceil((MAX_OWLBEAR_IMAGE_BYTES + 1) * 4 / 3))}`;

		expect(() => assertOwlbearImageDataUrlSize(oversized)).toThrow("превышает лимит");
	});
});
