import { describe, expect, it, vi } from "vitest";
import type { MarkdownRenderChild, MarkdownPostProcessorContext } from "obsidian";
import { App, Plugin } from "obsidian";
import {
	findDndNoteLinkUrlAtPosition,
	handleEditorDndNoteLinkMouseEvent,
	handleDndNoteLinkClick,
	processNoteLinks,
	registerNoteLinkProcessor,
} from "src/ui/components/processor/note_link_processor";
import type { HtmlLinkListener } from "src/domain/listeners/html_link_listener";

function createMockHtmlLinkListener(): HtmlLinkListener {
	return {
		onBeastClick: vi.fn(async () => {}),
		onSpellClick: vi.fn(async () => {}),
		onWeaponClick: vi.fn(async () => {}),
		onArmorClick: vi.fn(async () => {}),
		onItemClick: vi.fn(async () => {}),
		onArtifactClick: vi.fn(async () => {}),
		onBackgroundClick: vi.fn(async () => {}),
		onFeatClick: vi.fn(async () => {}),
		onRaceClick: vi.fn(async () => {}),
		onClassClick: vi.fn(async () => {}),
		onCharacterSheetClick: vi.fn(async () => {}),
		onScreenItemClick: vi.fn(async () => {}),
	};
}

function createContext() {
	const children: MarkdownRenderChild[] = [];
	const ctx: MarkdownPostProcessorContext = {
		addChild: (child: MarkdownRenderChild) => children.push(child),
	};
	return { ctx, children };
}

function dispatchClick(link: HTMLAnchorElement): Event {
	const event = new Event("click", { bubbles: true, cancelable: true });
	link.dispatchEvent(event);
	return event;
}

describe("note_link_processor", () => {
	it("registers markdown and global capture handlers", () => {
		const plugin = new Plugin(new App()) as any;
		const listener = createMockHtmlLinkListener();

		registerNoteLinkProcessor(plugin, listener);

		expect(plugin.markdownPostProcessors).toHaveLength(1);
		expect(plugin.domEvents).toHaveLength(2);
		expect(plugin.editorExtensions).toHaveLength(1);
		expect(plugin.domEvents.map((event: { type: string }) => event.type)).toEqual(["mousedown", "click"]);
		expect(plugin.domEvents.every((event: { el: EventTarget }) => event.el === window)).toBe(true);
		expect(plugin.domEvents.every((event: { options?: AddEventListenerOptions }) =>
			(event.options as AddEventListenerOptions).capture === true
		)).toBe(true);
	});

	it("renders dnd protocol markdown links as clickable note links", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = 'Cast <a href="dnd:/spells/fireball">Fireball</a> now.';
		const { ctx, children } = createContext();

		processNoteLinks(root, ctx, listener);
		const link = root.querySelector("a")!;
		const event = dispatchClick(link);

		expect(link.textContent).toBe("Fireball");
		expect(link.classList.contains("dnd-note-link")).toBe(true);
		expect(link.dataset.dndNoteLink).toBe("true");
		expect(link.dataset.dndUrl).toBe("/spells/fireball");
		expect(link.getAttribute("href")).toBe("#");
		expect(event.defaultPrevented).toBe(true);
		expect(listener.onSpellClick).toHaveBeenCalledWith("/spells/fireball");
		expect(children).toHaveLength(1);
	});

	it("stops rendered dnd links before external link handlers can process them", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = '<a href="dnd:/items/magic/ring"><span>Ring</span></a>';
		const externalLinkHandler = vi.fn();
		root.addEventListener("click", externalLinkHandler);
		const { ctx } = createContext();

		processNoteLinks(root, ctx, listener);
		const span = root.querySelector("span")!;
		const event = new Event("click", { bubbles: true, cancelable: true });
		span.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(true);
		expect(externalLinkHandler).not.toHaveBeenCalled();
		expect(listener.onArtifactClick).toHaveBeenCalledWith("/items/magic/ring");
	});

	it("globally intercepts raw dnd links before post-processing rewrites them", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = '<a href="dnd:/races/elf"><span>Elf</span></a>';
		const externalLinkHandler = vi.fn();
		let handled = false;
		root.addEventListener("mousedown", (event) => {
			handled = handleDndNoteLinkClick(event, root, listener);
		}, true);
		root.addEventListener("mousedown", externalLinkHandler);
		const span = root.querySelector("span")!;
		const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 });

		span.dispatchEvent(event);

		expect(handled).toBe(true);
		expect(event.defaultPrevented).toBe(true);
		expect(externalLinkHandler).not.toHaveBeenCalled();
		expect(listener.onRaceClick).toHaveBeenCalledWith("/races/elf");
	});

	it("does not open twice for the mousedown and click from one link activation", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = '<a href="dnd:/classes/fighter">Fighter</a>';
		const link = root.querySelector("a")!;
		const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 });
		const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });

		link.addEventListener("mousedown", (event) => {
			handleDndNoteLinkClick(event, root, listener);
		}, true);
		link.addEventListener("click", (event) => {
			handleDndNoteLinkClick(event, root, listener);
		}, true);
		link.dispatchEvent(mouseDownEvent);
		link.dispatchEvent(clickEvent);

		expect(mouseDownEvent.defaultPrevented).toBe(true);
		expect(clickEvent.defaultPrevented).toBe(true);
		expect(listener.onClassClick).toHaveBeenCalledTimes(1);
		expect(listener.onClassClick).toHaveBeenCalledWith("/classes/fighter");
	});

	it("finds dnd markdown links by source position for live preview", () => {
		const line = "Cast [Fireball](dnd:/spells/fireball) or [Goblin](dnd:/bestiary/goblin).";

		expect(findDndNoteLinkUrlAtPosition(line, 8)).toBe("/spells/fireball");
		expect(findDndNoteLinkUrlAtPosition(line, 33)).toBe("/spells/fireball");
		expect(findDndNoteLinkUrlAtPosition(line, 48)).toBe("/bestiary/goblin");
		expect(findDndNoteLinkUrlAtPosition(line, 0)).toBeNull();
	});

	it("intercepts CodeMirror live preview events using source markdown", () => {
		const listener = createMockHtmlLinkListener();
		const event = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
			button: 0,
			clientX: 10,
			clientY: 20,
		});
		const view = {
			posAtCoords: vi.fn(() => 8),
			state: {
				doc: {
					lineAt: vi.fn(() => ({
						from: 0,
						text: "Cast [Fireball](dnd:/spells/fireball).",
					})),
				},
			},
		} as any;

		const handled = handleEditorDndNoteLinkMouseEvent(event, view, listener);

		expect(handled).toBe(true);
		expect(event.defaultPrevented).toBe(true);
		expect(view.posAtCoords).toHaveBeenCalledWith({ x: 10, y: 20 }, false);
		expect(listener.onSpellClick).toHaveBeenCalledWith("/spells/fireball");
	});

	it("ignores ordinary markdown and obsidian-rendered links", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = '<a href="Some note.md">Note</a> <a href="/spells/fireball">Plain DnD URL</a>';
		const { ctx, children } = createContext();

		processNoteLinks(root, ctx, listener);
		const links = root.querySelectorAll("a");
		dispatchClick(links[0]);
		dispatchClick(links[1]);

		expect(listener.onSpellClick).not.toHaveBeenCalled();
		expect(children).toHaveLength(0);
		expect(links[0].classList.contains("dnd-note-link")).toBe(false);
		expect(links[1].classList.contains("dnd-note-link")).toBe(false);
	});

	it("does not intercept unsupported dnd urls", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = '<a href="dnd:/unknown/page">Unknown</a>';
		const { ctx } = createContext();

		processNoteLinks(root, ctx, listener);
		const link = root.querySelector("a")!;
		const event = dispatchClick(link);

		expect(event.defaultPrevented).toBe(false);
		expect(link.classList.contains("dnd-note-link")).toBe(false);
		expect(listener.onSpellClick).not.toHaveBeenCalled();
	});

	it("removes click listeners when the render child unloads", () => {
		const listener = createMockHtmlLinkListener();
		const root = document.createElement("p");
		root.innerHTML = '<a href="dnd:/bestiary/goblin">Goblin</a>';
		const { ctx, children } = createContext();

		processNoteLinks(root, ctx, listener);
		children[0].onunload();
		const link = root.querySelector("a")!;
		const event = dispatchClick(link);

		expect(event.defaultPrevented).toBe(false);
		expect(listener.onBeastClick).not.toHaveBeenCalled();
	});
});
