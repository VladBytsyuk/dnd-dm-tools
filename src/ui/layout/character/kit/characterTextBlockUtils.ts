import type { TextField } from "../../../../domain/models/character/CharacterText";

export function createTextFieldFromPlainText(text: string, idPrefix = "character-text"): TextField {
	const lines = text.split("\n");
	const content = lines.length > 0
		? lines.map((line) => line.trim()
			? {
				type: "paragraph",
				content: [{ type: "text", text: line }]
			}
			: { type: "paragraph" })
		: [{ type: "paragraph" }];

	return {
		value: {
			id: `${idPrefix}-${crypto.randomUUID()}`,
			data: {
				type: "doc",
				content
			}
		}
	};
}

export function getPlainTextFromTextField(field?: TextField | string | null): string {
	if (!field) return "";
	if (typeof field === "string") return field;

	const lines: string[] = [];

	function visitNode(node: any): string {
		if (!node || typeof node !== "object") return "";
		if (node.type === "text") return node.text || "";

		const content = Array.isArray(node.content) ? node.content.map(visitNode).join("") : "";
		if (node.type === "paragraph") {
			lines.push(content);
			return "";
		}

		return content;
	}

	visitNode(field.value?.data);
	return lines.join("\n").trimEnd();
}
