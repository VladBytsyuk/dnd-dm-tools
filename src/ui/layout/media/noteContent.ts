import { createRawSnippet, mount, unmount } from "svelte";
import MediaEntityCardUi from "./MediaEntityCardUi.svelte";
import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";

/** Read only direct plugin links, excluding fenced/indented code, inline code and comments. */
export function extractNoteEntityUrls(markdown: string): string[] {
	const plain = markdown.replace(/<!--[^]*?-->/g, "");
	let fence: { char: string; size: number } | null = null;
	const lines: string[] = [];
	for (const line of plain.split(/\r?\n/)) {
		const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
		if (marker) {
			if (!fence) fence = { char: marker[1][0], size: marker[1].length };
			else if (marker[1][0] === fence.char && marker[1].length >= fence.size) fence = null;
			continue;
		}
		if (!fence && !/^( {4}|\t)/.test(line)) lines.push(line);
	}
	const content = lines.join("\n").replace(/(`+)[^]*?\1/g, "");
	const matches = content.matchAll(/(?:\]\(\s*<?|href\s*=\s*["']|<)(dnd:\/[^\s<>"')]+)(?:[>"')\s])/g);
	return [...new Set([...matches].map((match) => match[1].slice(4)))];
}

/** Keep encounter fences in note order, including their original language and body. */
export function extractNoteEncounterBlocks(markdown: string): string[] {
	const blocks: string[] = [];
	let fence: { char: string; size: number; encounter: boolean; lines: string[] } | null = null;
	for (const line of markdown.replace(/<!--[^]*?-->/g, "").split(/\r?\n/)) {
		if (fence) {
			fence.lines.push(line);
			const closing = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
			if (closing && closing[1][0] === fence.char && closing[1].length >= fence.size) {
				if (fence.encounter) blocks.push(fence.lines.join("\n"));
				fence = null;
			}
			continue;
		}
		const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
		if (opening) fence = { char: opening[1][0], size: opening[1].length, encounter: /^encounter(?:\s|$)/.test(opening[2].trim()), lines: [line] };
	}
	if (fence?.encounter) blocks.push([...fence.lines, fence.char.repeat(fence.size)].join("\n"));
	return blocks;
}

export function noteEntityCard(result: PanelSearchResult) {
	return createRawSnippet<["dark" | "light"]>((getTheme) => {
		const theme = getTheme();
		return {
			render: () => '<div class="media-note-card"></div>',
			setup: (element) => {
				const component = mount(MediaEntityCardUi, { target: element, props: { result, theme } });
				return () => { void unmount(component); };
			},
		};
	});
}
