import { MarkdownRenderChild, parseYaml } from "obsidian";
import { mount, unmount } from "svelte";
import type DndStatblockPlugin from "src/main";
import { parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import SceneGraph from "src/ui/layout/media/SceneGraph.svelte";
import MediaMarkdownCardUi from "src/ui/layout/media/MediaMarkdownCardUi.svelte";

export function registerMediaMdCodeBlockProcessors(plugin: DndStatblockPlugin): void {
	for (const kind of ["track", "playlist", "scene", "adventure"] as const) {
		plugin.registerMarkdownCodeBlockProcessor(kind, (source, el, context) => {
			el.replaceChildren();
			try {
				const snapshot = parseMediaSnapshot(JSON.stringify(parseYaml(source)));
				if (snapshot.kind !== kind) throw new Error(`Ожидается блок ${kind}.`);
				if (plugin.getSettings().redesignEnabled || snapshot.kind === "track" || snapshot.kind === "scene") {
					const component = mount(MediaMarkdownCardUi, { target: el, props: { plugin, snapshot } });
					class MediaCardChild extends MarkdownRenderChild {
						onunload() { void unmount(component); }
					}
					context.addChild(new MediaCardChild(el));
					return;
				}
				if (snapshot.kind === "playlist") {
					el.createEl("h3", { text: snapshot.playlist.name });
					const names = new Map(snapshot.tracks.map((track) => [track.id, track.name]));
					const list = el.createEl("ol");
					for (const item of snapshot.playlist.items) {
						const normal = names.get(item.trackId) ?? "Аудиофайл";
						const track = snapshot.tracks.find((track) => track.id === item.trackId);
						const combat = track?.combatAudioId ? " · есть боевой вариант" : "";
						list.createEl("li", { text: `${normal}${combat}${track?.loop ? " · повтор" : ""}` });
					}
					return;
				}
				el.createEl("h3", { text: snapshot.adventure.name });
				for (const scene of snapshot.adventure.scenes) {
					const label = scene.name;
					const music = scene.trackId ? ` — ${snapshot.tracks.find((track) => track.id === scene.trackId)?.name ?? "Трек"}` : "";
					el.createEl("div", { text: `${label}${music}` });
				}
				const host = el.createDiv();
				const component = mount(SceneGraph, {
					target: host,
					props: {
						scenes: snapshot.adventure.scenes.map((scene) => ({ id: scene.id, path: scene.notePath ?? scene.name, missing: !!scene.notePath && !plugin.app.vault.getFileByPath(scene.notePath) })),
						links: snapshot.adventure.links,
					},
				});
				class GraphChild extends MarkdownRenderChild {
					onunload() { void unmount(component); }
				}
				context.addChild(new GraphChild(host));
			} catch (error) {
				const message = document.createElement("p");
				message.textContent = error instanceof Error ? error.message : `Некорректный блок ${kind}.`;
				el.appendChild(message);
			}
		});
	}
}
