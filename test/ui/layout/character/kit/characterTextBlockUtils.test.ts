import { describe, expect, it, vi } from "vitest";
import { createTextFieldFromPlainText, getPlainTextFromTextField } from "../../../../../src/ui/layout/character/kit/characterTextBlockUtils";

describe("characterTextBlockUtils", () => {
	it("creates paragraph nodes from plain multiline text", () => {
		vi.stubGlobal("crypto", {
			randomUUID: () => "test-id"
		});

		const field = createTextFieldFromPlainText("Line 1\n\nLine 3", "traits");

		expect(field.value.id).toBe("traits-test-id");
		expect(field.value.data).toEqual({
			type: "doc",
			content: [
				{ type: "paragraph", content: [{ type: "text", text: "Line 1" }] },
				{ type: "paragraph" },
				{ type: "paragraph", content: [{ type: "text", text: "Line 3" }] }
			]
		});

		vi.unstubAllGlobals();
	});

	it("extracts plain text from text field paragraphs", () => {
		expect(getPlainTextFromTextField({
			value: {
				id: "features-1",
				data: {
					type: "doc",
					content: [
						{ type: "paragraph", content: [{ type: "text", text: "Second Wind" }] },
						{ type: "paragraph" },
						{ type: "paragraph", content: [{ type: "text", text: "Action Surge" }] }
					]
				}
			}
		})).toBe("Second Wind\n\nAction Surge");
	});
});
