<script lang="ts">
	import { onMount } from "svelte";
	import type { FullSceneEntity } from "@dnd-dm-tools/design-system";
	import type DndStatblockPlugin from "src/main";
	import { mediaSnapshotState, type MediaSnapshot } from "src/domain/models/media/MediaSnapshot";
	import { findMediaItem } from "src/domain/models/media/MediaLibrary";
	import { theme as appTheme, Theme } from "src/ui/theme";
	import { extractNoteEntityUrls, extractNoteEncounterBlocks, noteEntityCard } from "./noteContent";
	import MediaFullCardUi from "./MediaFullCardUi.svelte";

	let { plugin, snapshot }: { plugin: DndStatblockPlugin; snapshot: MediaSnapshot } = $props();
	const data = $derived(mediaSnapshotState(snapshot));
	const item = $derived(findMediaItem(data.media, data.route)!);
	const theme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	let entities = $state<FullSceneEntity[]>([]);
	let encounters = $state<string[]>([]);
	let error = $state("");
	let version = $state(0);
	let sequence = 0;
	$effect(() => {
		void version;
		const path = "notePath" in item.record ? item.record.notePath : null;
		const request = ++sequence;
		entities = []; encounters = []; error = "";
		if (!path) return;
		void (async () => {
			try {
				const file = plugin.app.vault.getFileByPath(path);
				if (!file) throw new Error(`Заметка отсутствует: ${path}`);
				const markdown = await plugin.app.vault.cachedRead(file);
				const urls = extractNoteEntityUrls(markdown);
				const resolved = await Promise.allSettled(urls.map((url) => plugin.panelManager.resolveEntity(url)));
				if (request !== sequence) return;
				entities = resolved.flatMap((value) => value.status === "fulfilled" && value.value ? [{ url: value.value.url, label: value.value.title, card: noteEntityCard(value.value) }] : []);
				encounters = extractNoteEncounterBlocks(markdown);
				const missing = resolved.filter((value) => value.status === "rejected" || !value.value).length;
				if (missing) error = `Не удалось найти сущности: ${missing}`;
			} catch (failure) { if (request === sequence) error = failure instanceof Error ? failure.message : String(failure); }
		})();
	});
	onMount(() => {
		const refresh = () => { version++; };
		const refs = [plugin.app.vault.on("modify", refresh), plugin.app.vault.on("create", refresh), plugin.app.vault.on("delete", refresh), plugin.app.vault.on("rename", refresh)];
		const unsubscribe = plugin.subscribeMedia(refresh);
		return () => { sequence++; unsubscribe(); refs.forEach((ref) => plugin.app.vault.offref(ref)); };
	});
</script>

<div class="media-markdown-card">
	<MediaFullCardUi {plugin} {item} media={data.media} {entities} {encounters} {theme} />
	{#if error}<p class="error" role="status">{error}</p>{/if}
</div>

<style>
	.media-markdown-card { display: flex; flex-direction: column; gap: 6px; min-width: 0; width: 100%; }
	.error { color: var(--text-error); font-size: 12px; margin: 4px 8px; overflow-wrap: anywhere; }
</style>
