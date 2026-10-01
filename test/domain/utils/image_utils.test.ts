import { describe, expect, it, vi } from "vitest";
import { TFile, type App } from "obsidian";
import { getImageSource } from "../../../src/domain/utils/image_utils";

function createApp(filePath: string): App {
	const file = new TFile(filePath);
	const getAbstractFileByPath = vi.fn((path: string) => path === filePath ? file : null);
	return {
		vault: {
			getAbstractFileByPath,
			getResourcePath: (resolvedFile: TFile) => `app://resource/${resolvedFile.path}`,
		} as unknown as App["vault"],
		metadataCache: {
			getFirstLinkpathDest: vi.fn((path: string) => path === filePath ? file : null),
		} as unknown as App["metadataCache"],
	} as App;
}

describe("getImageSource", () => {
	it("resolves paths relative to the vault", async () => {
		expect(await getImageSource(createApp("images/creature.webp"), "images/creature.webp"))
			.toBe("app://resource/images/creature.webp");
	});

	it("resolves Obsidian open links", async () => {
		const app = createApp("images/creature.webp");
		expect(await getImageSource(app, "obsidian://open?vault=Campaign&file=images%2Fcreature.webp"))
			.toBe("app://resource/images/creature.webp");
	});

	it("resolves wikilinks with an embed size", async () => {
		expect(await getImageSource(createApp("images/creature.webp"), "![[images/creature.webp|300]]"))
			.toBe("app://resource/images/creature.webp");
	});

	it("leaves absolute system paths unresolved", async () => {
		const path = "/home/user/images/creature.webp";
		expect(await getImageSource(createApp("images/creature.webp"), path)).toBe(path);
	});
});
