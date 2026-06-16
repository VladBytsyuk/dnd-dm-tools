import { MarkdownRenderChild, type MarkdownPostProcessorContext } from "obsidian";
import { Prec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type DndStatblockPlugin from "src/main";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import { getDndEntityLinkListener } from "src/domain/listeners/html_link_listener";

const DND_NOTE_LINK_PROTOCOL = "dnd:";
const DND_NOTE_LINK_SELECTOR = `a[href^="${DND_NOTE_LINK_PROTOCOL}"]`;
const ACTIVE_DND_NOTE_LINK_SELECTOR = 'a[data-dnd-note-link="true"]';
const DUPLICATE_CLICK_WINDOW_MS = 500;

let lastHandledLink: { url: string; timestamp: number } | null = null;

export function registerNoteLinkProcessor(
	plugin: DndStatblockPlugin,
	uiEventListener: IUiEventListener,
): void {
	plugin.registerMarkdownPostProcessor((el, ctx) => {
		processNoteLinks(el, ctx, uiEventListener);
	});
	plugin.registerDomEvent(
		window,
		"mousedown",
		(event) => handleDndNoteLinkClick(event, window, uiEventListener),
		{ capture: true },
	);
	plugin.registerDomEvent(
		window,
		"click",
		(event) => handleDndNoteLinkClick(event, window, uiEventListener),
		{ capture: true },
	);
	plugin.registerEditorExtension(Prec.highest(EditorView.domEventHandlers({
		mousedown: (event, view) => handleEditorDndNoteLinkMouseEvent(event, view, uiEventListener),
		click: (event, view) => handleEditorDndNoteLinkMouseEvent(event, view, uiEventListener),
	})));
}

export function processNoteLinks(
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext,
	uiEventListener: IUiEventListener,
): void {
	const links = Array.from(el.querySelectorAll<HTMLAnchorElement>(DND_NOTE_LINK_SELECTOR));
	if (!links.length) return;

	const supportedLinks = links.filter(link => isSupportedDndNoteLink(link, uiEventListener));
	if (!supportedLinks.length) return;

	const child = new NoteLinkRenderChild(el, uiEventListener);
	ctx.addChild(child);
	child.attach(supportedLinks);
}

class NoteLinkRenderChild extends MarkdownRenderChild {
	private destroy: (() => void) | null = null;

	constructor(
		private root: HTMLElement,
		private uiEventListener: IUiEventListener,
	) {
		super(document.createElement("span"));
	}

	attach(links: HTMLAnchorElement[]): void {
		for (const link of links) {
			const url = getDndEntityUrl(link);
			if (!url) continue;

			link.classList.add("dnd-note-link");
			link.setAttribute("data-dnd-note-link", "true");
			link.setAttribute("data-dnd-url", url);
			link.setAttribute("href", "#");
			link.setAttribute("title", "Открыть в dnd-dm-tools");
		}

		const onClick = (event: MouseEvent) => {
			handleDndNoteLinkClick(event, this.root, this.uiEventListener);
		};

		this.root.addEventListener("click", onClick, true);
		this.destroy = () => this.root.removeEventListener("click", onClick, true);
	}

	onunload(): void {
		this.destroy?.();
		this.destroy = null;
	}
}

export function handleDndNoteLinkClick(
	event: MouseEvent,
	root: Window | Document | HTMLElement,
	uiEventListener: IUiEventListener,
): boolean {
	if (event.type === "mousedown" && event.button !== 0) return false;

	const link = getEventDndNoteLink(event, root);
	if (!link) return false;

	const targetUrl = getDndEntityUrl(link);
	if (!targetUrl) return false;

	const listener = getDndEntityLinkListener(uiEventListener, targetUrl);
	if (!listener) return false;

	event.preventDefault();
	event.stopImmediatePropagation();
	return openDndEntityUrl(targetUrl, listener);
}

export function handleEditorDndNoteLinkMouseEvent(
	event: MouseEvent,
	view: EditorView,
	uiEventListener: IUiEventListener,
): boolean {
	if (event.type === "mousedown" && event.button !== 0) return false;

	const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
	const line = view.state.doc.lineAt(pos);
	const targetUrl = findDndNoteLinkUrlAtPosition(line.text, pos - line.from);
	if (!targetUrl) return false;

	const listener = getDndEntityLinkListener(uiEventListener, targetUrl);
	if (!listener) return false;

	event.preventDefault();
	event.stopImmediatePropagation();
	return openDndEntityUrl(targetUrl, listener);
}

export function findDndNoteLinkUrlAtPosition(lineText: string, position: number): string | null {
	const markdownLinkPattern = /\[[^\]]+]\(\s*(dnd:\/[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
	let match: RegExpExecArray | null;

	while ((match = markdownLinkPattern.exec(lineText)) !== null) {
		const matchStart = match.index;
		const matchEnd = matchStart + match[0].length;
		if (position < matchStart || position > matchEnd) continue;

		const url = getDndEntityUrlString(match[1]);
		if (url) return url;
	}

	return null;
}

function isSupportedDndNoteLink(
	link: HTMLAnchorElement,
	uiEventListener: IUiEventListener,
): boolean {
	const url = getDndEntityUrl(link);
	return Boolean(url && getDndEntityLinkListener(uiEventListener, url));
}

function getEventDndNoteLink(event: Event, root: Window | Document | HTMLElement): HTMLAnchorElement | null {
	const target = event.target;
	const element = target instanceof Element
		? target
		: target instanceof Node
			? target.parentElement
			: null;
	const link = element?.closest<HTMLAnchorElement>(
		`${ACTIVE_DND_NOTE_LINK_SELECTOR}, ${DND_NOTE_LINK_SELECTOR}`,
	);
	return link && rootContains(root, link) ? link : null;
}

function rootContains(root: Window | Document | HTMLElement, link: HTMLAnchorElement): boolean {
	if (root instanceof Window) return root.document.contains(link);
	return root.contains(link);
}

function isDuplicateLinkClick(url: string): boolean {
	if (!lastHandledLink) return false;

	const elapsed = Date.now() - lastHandledLink.timestamp;
	return lastHandledLink.url === url && elapsed < DUPLICATE_CLICK_WINDOW_MS;
}

function getDndEntityUrl(link: HTMLAnchorElement): string | null {
	const dataUrl = link.dataset.dndUrl;
	if (dataUrl) return dataUrl.startsWith("/") ? dataUrl : null;

	const href = link.getAttribute("href");
	return getDndEntityUrlString(href);
}

function getDndEntityUrlString(value: string | null): string | null {
	if (!value?.startsWith(DND_NOTE_LINK_PROTOCOL)) return null;

	const url = value.slice(DND_NOTE_LINK_PROTOCOL.length);
	return url.startsWith("/") ? url : null;
}

function openDndEntityUrl(
	url: string,
	listener: { onClick: (url: string) => Promise<void> },
): boolean {
	if (isDuplicateLinkClick(url)) return true;

	lastHandledLink = {
		url,
		timestamp: Date.now(),
	};
	listener.onClick(url)
		.catch(error => console.error("Error opening DnD note link:", error));
	return true;
}
