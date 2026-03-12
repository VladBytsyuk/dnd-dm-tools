import { describe, expect, it } from "vitest";
import {
	hasLinkedEquipment,
	isSupportedEquipmentLinkType,
	sanitizeNotesPreviewText
} from "../../../../../src/ui/layout/character/kit/characterEquipmentUtils";

describe("characterEquipmentUtils", () => {
	it("treats armor links as supported linked equipment", () => {
		expect(isSupportedEquipmentLinkType("armor")).toBe(true);
		expect(hasLinkedEquipment({ linkedUrl: "/armors/plate", linkedType: "armor" })).toBe(true);
		expect(hasLinkedEquipment({ linkedUrl: "/items/rope", linkedType: undefined })).toBe(false);
	});

	it("sanitizes notes preview content into safe plain text", () => {
		const unsafeNotes = '<p>Описание</p><img src=x onerror="window.__xss = true"><br><strong>важно</strong> &amp; полезно';

		expect(sanitizeNotesPreviewText(unsafeNotes)).toBe("Описание\nважно & полезно");
	});
});
