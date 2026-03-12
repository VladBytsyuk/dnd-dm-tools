import { describe, expect, it } from "vitest";
import { createEmptyCharacterSubInfo, ensureCharacterSubInfo } from "../../../../../src/ui/layout/character/kit/characterSubInfoUtils";

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

	it("fills in missing editable physical info fields for partial legacy data", () => {
		expect(ensureCharacterSubInfo({
			age: { name: "age", value: "25" },
			eyes: { name: "eyes", value: "Blue" }
		})).toEqual({
			age: { name: "age", value: "25" },
			height: { name: "height", value: "" },
			weight: { name: "weight", value: "" },
			eyes: { name: "eyes", value: "Blue" },
			skin: { name: "skin", value: "" },
			hair: { name: "hair", value: "" }
		});
	});
});
