import sanitizeHtml from "sanitize-html";

const allowedTags = [
	...sanitizeHtml.defaults.allowedTags,
	"img",
	"table",
	"thead",
	"tbody",
	"tfoot",
	"tr",
	"th",
	"td",
	"caption",
	"dice-roller",
];

export function sanitizeRichHtml(html: string): string {
	return sanitizeHtml(addDiceFormulaFallback(html), {
		allowedTags,
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			"*": ["class", "id"],
			a: ["href", "name", "target"],
			img: ["src", "alt", "width", "height"],
			td: ["colspan", "rowspan"],
			th: ["colspan", "rowspan", "scope"],
			"dice-roller": ["label", "formula", "multiplier"],
		},
		allowedSchemes: ["http", "https", "mailto", "tel"],
		allowProtocolRelative: false,
	});
}

function addDiceFormulaFallback(html: string): string {
	return html.replace(
		/<dice-roller\b([^>]*?)\/\s*>|<dice-roller\b([^>]*)>\s*<\/dice-roller\s*>/giu,
		(match, selfClosingAttributes: string | undefined, emptyAttributes: string | undefined) => {
			const attributes = selfClosingAttributes ?? emptyAttributes ?? "";
			const formula = attributes.match(/\bformula\s*=\s*(["'])(.*?)\1/iu)?.[2];
			if (formula === undefined) return match;

			const escapedFormula = formula
				.replace(/&/gu, "&amp;")
				.replace(/</gu, "&lt;")
				.replace(/>/gu, "&gt;");
			return `<dice-roller${attributes}>${escapedFormula}</dice-roller>`;
		},
	);
}
