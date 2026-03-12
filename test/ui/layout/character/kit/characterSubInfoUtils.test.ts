import { describe, expect, it } from "vitest";
import { createEmptyCharacterSubInfo } from "../../../../../src/ui/layout/character/kit/characterSubInfoUtils";

describe("characterSubInfoUtils", () => {
	it("creates all editable physical info fields with empty values", () => {
		expect(createEmptyCharacterSubInfo()).toEqual({
			age: { name: "age", value: "" },
			height: { name: "height", value: "" },
			weight: { name: "weight", value: "" },
			eyes: { name: "eyes", value: "" },
			skin: { name: "skin", value: "" },
			hair: { name: "hair", value: "" }
		});
	});
});
