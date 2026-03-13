import { describe, expect, it, vi } from "vitest";
import { canSafelyEditAsPlainText, createTextFieldFromPlainText, getPlainTextFromTextField } from "../../../../../src/ui/layout/character/kit/characterTextBlockUtils";

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

	it("preserves text from headings, lists, blockquotes, and hard breaks", () => {
		expect(getPlainTextFromTextField({
			value: {
				id: "traits-1",
				data: {
					type: "doc",
					content: [
						{
							type: "heading",
							attrs: { level: 2 },
							content: [{ type: "text", text: "Эльф" }]
						},
						{
							type: "bulletList",
							content: [
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [{ type: "text", text: "Темное зрение" }]
										}
									]
								},
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Фейское" },
												{ type: "hardBreak" },
												{ type: "text", text: "происхождение" }
											]
										}
									]
								}
							]
						},
						{
							type: "blockquote",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Преимущество против очарования" }]
								}
							]
						}
					]
				}
			}
		})).toBe("Эльф\n- Темное зрение\n- Фейское\nпроисхождение\nПреимущество против очарования");
	});

	it("extracts plain text from legacy html editor payloads", () => {
		expect(getPlainTextFromTextField({
			value: {
				id: "legacy-1",
				data: "<h2>Эльф</h2><p>Темное зрение</p><blockquote>Преимущество против очарования</blockquote><div>Фейское происхождение<br>Доп. строка</div>"
			}
		})).toBe("Эльф\nТемное зрение\nПреимущество против очарования\nФейское происхождение\nДоп. строка");
	});

	it("allows plain paragraph content to be edited as plain text", () => {
		expect(canSafelyEditAsPlainText({
			value: {
				id: "personality-1",
				data: {
					type: "doc",
					content: [
						{ type: "paragraph", content: [{ type: "text", text: "Brave and loyal" }] },
						{ type: "paragraph", content: [{ type: "text", text: "Protects friends" }] }
					]
				}
			}
		})).toBe(true);
	});

	it("blocks plain-text editing for formatted documents", () => {
		expect(canSafelyEditAsPlainText({
			value: {
				id: "background-1",
				data: {
					type: "doc",
					content: [
						{
							type: "bulletList",
							content: [
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [{ type: "text", text: "Guild contact" }]
										}
									]
								}
							]
						}
					]
				}
			}
		})).toBe(false);

		expect(canSafelyEditAsPlainText({
			value: {
				id: "allies-1",
				data: {
					type: "doc",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Important ally",
									marks: [{ type: "bold" }]
								}
							]
						}
					]
				}
			}
		})).toBe(false);
	});
});
