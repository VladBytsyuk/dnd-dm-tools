import { MarkdownRenderChild } from "obsidian";
import { mount, unmount } from "svelte";
import type DndStatblockPlugin from "src/main";
import { parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import SceneGraph from "src/ui/layout/media/SceneGraph.svelte";

export function registerMediaMdCodeBlockProcessors(plugin: DndStatblockPlugin): void {
	plugin.registerMarkdownCodeBlockProcessor("playlist", (source, el) => {
		el.empty();
		try {
			const snapshot = parseMediaSnapshot(source);
			if (snapshot.kind !== "playlist") throw new Error("Ожидается блок playlist.");
			el.createEl("h3", { text: snapshot.playlist.name });
			const names = new Map(snapshot.audioFiles.map((file) => [file.id, file.alias]));
			const list = el.createEl("ol");
			for (const item of snapshot.playlist.items) {
				const normal = names.get(item.normalAudioId) ?? "Аудиофайл";
				const combat = item.combatAudioId ? ` · бой: ${names.get(item.combatAudioId) ?? "Аудиофайл"}` : "";
				list.createEl("li", { text: `${normal}${combat}${item.loop ? " · повтор" : ""}` });
			}
		} catch (error) {
			el.createEl("p", { text: error instanceof Error ? error.message : "Некорректный блок playlist." });
		}
	});
	plugin.registerMarkdownCodeBlockProcessor("adventure", (source, el, context) => {
		el.empty();
		try {
			const snapshot = parseMediaSnapshot(source);
			if (snapshot.kind !== "adventure") throw new Error("Ожидается блок adventure.");
			el.createEl("h3", { text: snapshot.adventure.name });
			const playlistNames = new Map(snapshot.playlists.map((playlist) => [playlist.id, playlist.name]));
			for (const scene of snapshot.adventure.scenes) {
				const label = scene.path.split("/").at(-1) ?? scene.path;
				const music = scene.playlistId ? ` — ${playlistNames.get(scene.playlistId) ?? "Плейлист"}` : "";
				el.createEl("div", { text: `${label}${music}` });
			}
			const host = el.createDiv();
			const component = mount(SceneGraph, {
				target: host,
				props: {
					scenes: snapshot.adventure.scenes.map((scene) => ({ id: scene.id, path: scene.path, missing: !plugin.app.vault.getFileByPath(scene.path) })),
					links: snapshot.adventure.links,
				},
			});
			class GraphChild extends MarkdownRenderChild {
				onunload() { void unmount(component); }
			}
			context.addChild(new GraphChild(host));
		} catch (error) {
			el.createEl("p", { text: error instanceof Error ? error.message : "Некорректный блок adventure." });
		}
	});
}
