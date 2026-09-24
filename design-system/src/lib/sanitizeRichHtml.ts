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
];

export function sanitizeRichHtml(html: string): string {
	return sanitizeHtml(html, {
		allowedTags,
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			"*": ["class", "id"],
			a: ["href", "name", "target"],
			img: ["src", "alt", "width", "height"],
			td: ["colspan", "rowspan"],
			th: ["colspan", "rowspan", "scope"],
		},
		allowedSchemes: ["http", "https", "mailto", "tel"],
		allowProtocolRelative: false,
	});
}
