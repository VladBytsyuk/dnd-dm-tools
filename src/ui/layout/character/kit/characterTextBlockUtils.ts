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
	if (typeof field.value?.data === "string") {
		return getPlainTextFromHtml(field.value.data);
	}

	function getInlineText(node: any): string {
		if (!node || typeof node !== "object") return "";
		if (node.type === "text") return node.text || "";
		if (node.type === "hardBreak") return "\n";

		return Array.isArray(node.content)
			? node.content.map((child: any) => getInlineText(child)).join("")
			: "";
	}

	function getBlockLines(node: any): string[] {
		if (!node || typeof node !== "object") return [];

		const childBlocks = Array.isArray(node.content)
			? node.content.flatMap((child: any) => getBlockLines(child))
			: [];

		switch (node.type) {
			case "doc":
			case "bulletList":
			case "orderedList":
				return childBlocks;
			case "paragraph":
			case "heading":
			case "blockquote":
			case "codeBlock": {
				const text = getInlineText(node);
				return (text || childBlocks.length > 0)
					? [text || childBlocks.join("\n")]
					: [""];
			}
			case "listItem": {
				if (childBlocks.length > 0) {
					const [firstLine, ...rest] = childBlocks;
					return [`- ${firstLine}`, ...rest];
				}

				const text = getInlineText(node);
				return text ? [`- ${text}`] : ["-"];
			}
			case "horizontalRule":
				return ["---"];
			default: {
				if (childBlocks.length > 0) return childBlocks;

				const text = getInlineText(node);
				return text ? [text] : [];
			}
		}
	}

	return getBlockLines(field.value?.data).join("\n").trimEnd();
}

function getPlainTextFromHtml(html: string): string {
	const normalizedHtml = html
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|blockquote|h[1-6]|pre)>/gi, "\n");

	const parsed = new DOMParser().parseFromString(normalizedHtml, "text/html");
	return (parsed.body.textContent ?? "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
