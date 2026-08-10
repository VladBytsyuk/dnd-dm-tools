import { describe, expect, it } from "vitest";
import {
	createMinimalLssCharacterSheet,
	createLssCharacterIframeUrl,
	createLssCharacterListIframeUrl,
	extractLssCharacterId,
} from "src/data/services/LssCharacterSheetService";

describe("LssCharacterSheetService", () => {
	it("creates a minimal iframe-backed sheet for a direct LSS character link", () => {
		const sheet = createMinimalLssCharacterSheet("/character-sheets/658ded7cf2bd044142897fb6");

		expect(sheet.url).toBe("/character-sheets/658ded7cf2bd044142897fb6");
		expect(sheet.name.rus).toBe("Персонаж 658ded");
		expect(sheet.data.name.value).toBe("Персонаж 658ded");
	});

	it("builds the configured iframe URL", () => {
		expect(createLssCharacterIframeUrl("/character-sheets/658ded7cf2bd044142897fb6"))
			.toBe("https://longstoryshort.app/iframe/characters/digital/658ded7cf2bd044142897fb6/");
	});

	it("builds the configured list iframe URL", () => {
		expect(createLssCharacterListIframeUrl())
			.toBe("https://longstoryshort.app/iframe/characters/list/");
	});

	it("extracts a character id from supported note link values", () => {
		expect(extractLssCharacterId("dnd:/character-sheets/658ded7cf2bd044142897fb6"))
			.toBe("658ded7cf2bd044142897fb6");
	});

	it("returns null for values without an LSS character id", () => {
		expect(createMinimalLssCharacterSheet("/character-sheets/not-an-id")).toBeNull();
	});
});
