import { describe, expect, it } from "vitest";
import { sanitizeRichHtml } from "../../../design-system/src/lib/sanitizeRichHtml";

describe("sanitizeRichHtml dice rollers", () => {
	it("uses the formula as visible content when the tag has no body", () => {
		expect(sanitizeRichHtml('<dice-roller label="Урон" formula="1к6 + 2"/>'))
			.toBe('<dice-roller label="Урон" formula="1к6 + 2">1к6 + 2</dice-roller>');
	});

	it("keeps the body as visible content when one is provided", () => {
		expect(sanitizeRichHtml('<dice-roller label="Атака" formula="к20 + 5">+5</dice-roller>'))
			.toBe('<dice-roller label="Атака" formula="к20 + 5">+5</dice-roller>');
	});
});
