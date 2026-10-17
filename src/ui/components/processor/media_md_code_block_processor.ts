import { MarkdownRenderChild, parseYaml } from "obsidian";
import { mount, unmount } from "svelte";
import type DndStatblockPlugin from "src/main";
import { parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import MediaMarkdownCardUi from "src/ui/layout/media/MediaMarkdownCardUi.svelte";

export function registerMediaMdCodeBlockProcessors(plugin: DndStatblockPlugin): void {
	for (const kind of ["track", "playlist", "scene", "adventure"] as const) {
		plugin.registerMarkdownCodeBlockProcessor(kind, (source, el, context) => {
			el.replaceChildren();
			try {
				const snapshot = parseMediaSnapshot(JSON.stringify(parseYaml(source)));
				if (snapshot.kind !== kind) throw new Error(`Ожидается блок ${kind}.`);
				const component = mount(MediaMarkdownCardUi, { target: el, props: { plugin, snapshot } });
				class MediaCardChild extends MarkdownRenderChild {
					onunload() { void unmount(component); }
				}
				context.addChild(new MediaCardChild(el));
			} catch (error) {
				const message = document.createElement("p");
				message.textContent = error instanceof Error ? error.message : `Некорректный блок ${kind}.`;
				el.appendChild(message);
			}
		});
	}
}
