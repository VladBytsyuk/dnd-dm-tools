import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "svelte";
import { MarkdownRenderChild } from "obsidian";
import { registerMediaMdCodeBlockProcessors } from "src/ui/components/processor/media_md_code_block_processor";
import { exportMediaMarkdownBlock } from "src/domain/models/media/MediaSnapshot";
import MediaMarkdownCardUi from "src/ui/layout/media/MediaMarkdownCardUi.svelte";
import { sampleMedia, legacyMedia } from "../../../fixtures/media";

vi.mock("svelte", async (importOriginal) => ({ ...await importOriginal<typeof import("svelte")>(), mount: vi.fn(() => ({})), unmount: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
function setup() {
	const handlers = new Map<string, (source: string, element: HTMLElement, context: { addChild: (child: MarkdownRenderChild) => void }) => void>();
	const plugin = { registerMarkdownCodeBlockProcessor: vi.fn((kind: string, handler: any) => handlers.set(kind, handler)) };
	registerMediaMdCodeBlockProcessors(plugin as any);
	return { plugin, handlers };
}

describe("media Markdown processors", () => {
	it.each(["track", "playlist", "scene", "adventure"] as const)("mounts the full %s card and releases it on unload", (kind) => {
		const { handlers, plugin } = setup(), state = sampleMedia();
		const id = kind === "track" ? state.tracks[0].id : kind === "playlist" ? "music" : kind === "scene" ? "start" : "quest";
		const source = exportMediaMarkdownBlock(state, { kind, id }).split("\n").slice(1, -1).join("\n");
		const element = document.createElement("div"), children: MarkdownRenderChild[] = [];
		handlers.get(kind)!(source, element, { addChild: (child) => children.push(child) });
		expect(mount).toHaveBeenCalledWith(MediaMarkdownCardUi, { target: element, props: { plugin, snapshot: expect.objectContaining({ kind }) } });
		expect(children).toHaveLength(1);
		children[0].onunload();
		expect(unmount).toHaveBeenCalledOnce();
	});
	it("renders old version one blocks through the full card in the new design", () => {
		const { handlers } = setup(), old = legacyMedia();
		const element = document.createElement("div");
		handlers.get("playlist")!(JSON.stringify({ schemaVersion: 1, kind: "playlist", playlist: old.playlists[0], audioFiles: old.audioFiles }), element, { addChild: vi.fn() });
		expect(mount).toHaveBeenCalledWith(MediaMarkdownCardUi, expect.objectContaining({ props: expect.objectContaining({ snapshot: expect.objectContaining({ kind: "playlist", schemaVersion: 2 }) }) }));
	});
	it("rejects mismatched or invalid blocks without mounting a different entity", () => {
		const { handlers } = setup(), state = sampleMedia();
		const source = exportMediaMarkdownBlock(state, { kind: "track", id: state.tracks[0].id }).split("\n").slice(1, -1).join("\n");
		const element = document.createElement("div");
		handlers.get("playlist")!(source, element, { addChild: vi.fn() });
		expect(element.textContent).toBe("Ожидается блок playlist.");
		handlers.get("track")!("broken: [", element, { addChild: vi.fn() });
		expect(element.querySelector("p")).toBeTruthy();
		expect(mount).not.toHaveBeenCalled();
	});
});
