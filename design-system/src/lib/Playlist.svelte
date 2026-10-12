<script lang="ts">
	import "./colors.css";
	import { tick } from "svelte";
	import Menu from "lucide-svelte/icons/menu";
	import Plus from "lucide-svelte/icons/plus";
	import Sword from "lucide-svelte/icons/sword";
	import Trash from "lucide-svelte/icons/trash-2";
	import BaseSmallItem from "./BaseSmallItem.svelte";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";

	export type PlaylistTrack = {
		id: string;
		title: string;
		atmosphere?: string;
		source?: string;
		hasCombat?: boolean;
	};

	type Props = {
		russianName: string;
		entityLink: string;
		atmosphere?: string;
		source?: FullItemSource;
		tracks?: PlaylistTrack[];
		editable?: boolean;
		disabled?: boolean;
		theme?: "dark" | "light";
		onCopyText?: (text: string) => void;
		onTrackClick?: (id: string) => void;
		onTracksChange?: (tracks: PlaylistTrack[]) => void;
		onAddTrack?: () => void;
	};

	let {
		russianName = $bindable(""),
		entityLink = $bindable(""),
		atmosphere = $bindable(""),
		source = $bindable<FullItemSource | undefined>(),
		tracks = $bindable<PlaylistTrack[]>([]),
		editable = false,
		disabled = false,
		theme = "dark",
		onCopyText,
		onTrackClick,
		onTracksChange,
		onAddTrack,
	}: Props = $props();

	let draggedId = $state<string | null>(null);
	let dropIndex = $state<number | null>(null);
	let dragOffset = $state(0);
	let droppedId = $state<string | null>(null);
	let settleOffset = $state(0);
	let dragStartY = 0;
	let dragSourceIndex = 0;
	let rowRects = $state.raw<DOMRect[]>([]);
	let listRect = $state.raw<Pick<DOMRect, "top" | "bottom" | "left" | "right">>({ top: 0, bottom: 0, left: 0, right: 0 });

	function updateTracks(next: PlaylistTrack[]) {
		tracks = next;
		onTracksChange?.(next);
	}

	function moveTrack(id: string, targetIndex: number) {
		if (!editable || disabled) return;
		const index = tracks.findIndex((track) => track.id === id);
		if (index < 0 || targetIndex < 0 || targetIndex >= tracks.length || index === targetIndex) return;
		const next = [...tracks];
		const [track] = next.splice(index, 1);
		next.splice(targetIndex, 0, track);
		updateTracks(next);
	}

	async function handleMoveKey(event: KeyboardEvent, id: string, index: number) {
		if (event.key === "Escape") { cancelDrag(); return; }
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
		if (draggedId) return;
		event.preventDefault();
		const handle = event.currentTarget as HTMLButtonElement;
		moveTrack(id, index + (event.key === "ArrowUp" ? -1 : 1));
		await tick();
		handle.focus();
	}

	function startDrag(event: PointerEvent, id: string) {
		if (event.button !== 0 || disabled) return;
		const handle = event.currentTarget as HTMLButtonElement;
		const list = handle.closest("ol");
		if (!list) return;
		rowRects = [...list.querySelectorAll<HTMLLIElement>(".track-row")].map((row) => row.getBoundingClientRect());
		listRect = list.getBoundingClientRect();
		dragSourceIndex = tracks.findIndex((track) => track.id === id);
		dragStartY = event.clientY;
		dragOffset = 0;
		dropIndex = dragSourceIndex;
		droppedId = null;
		draggedId = id;
		handle.setPointerCapture(event.pointerId);
	}

	function updateDrag(event: PointerEvent) {
		if (!draggedId) return;
		dragOffset = event.clientY - dragStartY;
		const source = rowRects[dragSourceIndex];
		if (event.clientX < listRect.left || event.clientX > listRect.right || event.clientY < listRect.top - source.height / 2 || event.clientY > listRect.bottom + source.height / 2) {
			dropIndex = null;
			return;
		}
		const center = source.top + source.height / 2 + dragOffset;
		const remaining = rowRects.filter((_, index) => index !== dragSourceIndex);
		const index = remaining.findIndex((rect) => center < rect.top + rect.height / 2);
		dropIndex = index < 0 ? remaining.length : index;
	}

	function rowOffset(index: number) {
		if (!draggedId) return 0;
		if (index === dragSourceIndex) return dragOffset;
		if (dropIndex === null) return 0;
		if (dragSourceIndex < dropIndex && index > dragSourceIndex && index <= dropIndex) return rowRects[index - 1].top - rowRects[index].top;
		if (dropIndex < dragSourceIndex && index >= dropIndex && index < dragSourceIndex) return rowRects[index + 1].top - rowRects[index].top;
		return 0;
	}

	function cancelDrag() {
		draggedId = null;
		dropIndex = null;
		dragOffset = 0;
	}

	function dropTrack(event: PointerEvent) {
		updateDrag(event);
		const id = draggedId;
		const index = dropIndex;
		if (id && index !== null) {
			settleOffset = dragOffset - (rowRects[index].top - rowRects[dragSourceIndex].top);
			droppedId = id;
		}
		cancelDrag();
		const handle = event.currentTarget as HTMLButtonElement;
		if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
		if (id && index !== null) moveTrack(id, index);
	}
</script>

<article class="playlist" data-theme={theme} aria-label={russianName}>
	<FullItemHeader bind:russianName englishName="" showEnglishName={false} bind:entityLink bind:info={atmosphere} bind:source onCopy={onCopyText} {editable} {theme} />
	<ol aria-label="Треки плейлиста" class:drag-active={draggedId !== null}>
		{#each tracks as track, index (track.id)}
			<li class="track-row" class:dragging={draggedId === track.id} class:just-dropped={droppedId === track.id} style:--row-offset={`${rowOffset(index)}px`} style:--settle-offset={`${settleOffset}px`}>
				<button class="open-track" type="button" aria-label={`Открыть трек: ${track.title}`} {disabled} onclick={() => onTrackClick?.(track.id)}>
					<BaseSmallItem
						primaryColor="var(--ds-track)"
						secondaryColor="var(--ds-track-sub)"
						height={40}
						valueFontSize={24}
						value={editable ? "" : index + 1}
						title={track.title}
						subtitle={track.atmosphere}
						source={track.source}
						bottomIcons={!editable && track.hasCombat ? [{ icon: Sword, label: "Есть боевой вариант" }] : []}
						{theme}
					/>
				</button>
				{#if editable}
					<button class="icon-button drag-handle" type="button" aria-label={`Изменить порядок: ${track.title}`} title="Перетащите или используйте стрелки вверх и вниз" {disabled} onpointerdown={(event) => startDrag(event, track.id)} onpointermove={updateDrag} onpointerup={dropTrack} onpointercancel={cancelDrag} onlostpointercapture={cancelDrag} onkeydown={(event) => handleMoveKey(event, track.id, index)}>
						<Menu size={16} strokeWidth={2} aria-hidden={true} />
					</button>
					<button class="icon-button remove" type="button" aria-label={`Удалить трек: ${track.title}`} title="Удалить трек" {disabled} onclick={() => updateTracks(tracks.filter((item) => item.id !== track.id))}>
						<Trash size={14} strokeWidth={1.5} aria-hidden={true} />
					</button>
				{/if}
				{#if draggedId === track.id}<span class="drag-position" aria-hidden="true">{dropIndex === null ? "Отпустите для отмены" : `Позиция ${dropIndex + 1}`}</span>{/if}
			</li>
		{/each}
		{#if draggedId && dropIndex !== null}
			<li class="drop-slot" aria-hidden="true" style:top={`${rowRects[dropIndex].top - listRect.top}px`} style:height={`${rowRects[dropIndex].height}px`}>
				<span>Отпустите здесь</span>
			</li>
		{/if}
	</ol>
	{#if editable}
		<button class="add-track" type="button" aria-label="Добавить трек" title="Добавить трек" disabled={disabled || !onAddTrack} onclick={onAddTrack}>
			<Plus size={10} strokeWidth={2} aria-hidden={true} />
		</button>
	{/if}
</article>

<style>
	.playlist {
		--playlist-primary: var(--ds-playlist);
		--playlist-secondary: var(--ds-playlist-sub);
		--playlist-track: var(--ds-track);
		--playlist-drop: var(--ds-track-sub);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		min-width: 0;
		padding: 8px;
		background:
			linear-gradient(to top right,
				color-mix(in srgb, var(--playlist-primary) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--playlist-secondary) var(--ds-gradient-strength, 20%), transparent)),
			var(--ds-full-surface);
		color: #fff;
	}

	.playlist[data-theme="light"] {
		--playlist-primary: var(--ds-playlist-light);
		--playlist-secondary: var(--ds-playlist-sub-light);
		--playlist-track: var(--ds-track-light);
		--playlist-drop: var(--ds-track-light);
		color: #1f2937;
	}

	.playlist :global(.full-item-header) { min-height: 36px; gap: 4px; }
	.playlist :global(.details) { flex: 0 1 88px; }
	.playlist :global(.full-item-header .russian-name) { font-size: 16px; font-weight: 700; line-height: 20px; }
	.playlist :global(.full-item-header .info) { font-size: 10px; line-height: 12px; overflow-wrap: anywhere; }
	.playlist :global(.full-item-header .entity-link), .playlist :global(.full-item-header .source) { font-size: 8px; line-height: 10px; }

	ol { position: relative; display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; min-width: 0; }
	.track-row { position: relative; min-width: 0; border-radius: 8px; transform: translateY(var(--row-offset)); }
	.drag-active .track-row { transition: transform 160ms ease; }
	.drag-active .track-row.dragging { z-index: 2; opacity: 0.85; outline: 2px solid var(--playlist-drop); box-shadow: 0 8px 16px rgb(0 0 0 / 30%); transition: none; }
	.drag-position { position: absolute; top: -18px; right: 4px; padding: 1px 5px; border: 1px solid var(--playlist-drop); border-radius: 4px; background: var(--ds-full-surface); font: 10px/14px "Golos Text", sans-serif; pointer-events: none; }
	.drop-slot { position: absolute; left: 0; right: 0; box-sizing: border-box; display: grid; place-items: center; border: 2px dashed var(--playlist-drop); border-radius: 8px; background: color-mix(in srgb, var(--playlist-drop) 12%, transparent); color: inherit; font: 10px/14px "Golos Text", sans-serif; pointer-events: none; transition: top 160ms ease; }
	.track-row.just-dropped { animation: drop-track 180ms ease-out; }
	@keyframes drop-track {
		from { transform: translateY(var(--settle-offset)); box-shadow: 0 0 0 2px var(--playlist-drop), 0 8px 16px rgb(0 0 0 / 25%); }
		to { transform: translateY(0); box-shadow: 0 0 0 0 transparent, 0 0 0 transparent; }
	}
	@media (prefers-reduced-motion: reduce) {
		.drag-active .track-row, .drop-slot { transition: none; }
		.track-row.just-dropped { animation: none; }
	}
	.playlist button { all: unset; box-sizing: border-box; color: inherit; cursor: pointer; }
	.playlist button:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	.playlist button:disabled { cursor: default; opacity: 0.4; }
	.playlist button.open-track { display: block; width: 100%; min-width: 0; border-radius: 8px; }
	.track-row :global(.content) { justify-content: center; padding: 6px 8px; }
	.track-row :global(.titles) { gap: 0; }
	.track-row :global(.content strong) { font-size: 12px; line-height: 14px; }
	.track-row :global(.content span:not(.title-text)), .track-row :global(.meta span) { font-size: 8px; line-height: 10px; }
	.track-row :global(.meta) { padding: 6px 8px; }
	.playlist button.icon-button { position: absolute; display: grid; place-items: center; border-radius: 2px; }
	.playlist button.drag-handle { top: 0; left: 0; width: 48px; height: 40px; cursor: grab; touch-action: none; }
	.playlist button.drag-handle:active { cursor: grabbing; }
	.playlist button.remove { right: 8px; bottom: 6px; width: 14px; height: 14px; }
	.playlist button.icon-button:hover:not(:disabled) { background: rgb(255 255 255 / 10%); }
	.playlist[data-theme="light"] button.icon-button:hover:not(:disabled) { background: rgb(15 23 42 / 8%); }
	.playlist button.add-track { display: grid; place-items: center; width: 100%; height: 14px; border-radius: 4px; background: color-mix(in srgb, var(--playlist-track) 40%, transparent); box-shadow: 0 2px 2px rgb(0 0 0 / 25%); }
	.playlist button.add-track:hover:not(:disabled) { background: color-mix(in srgb, var(--playlist-track) 55%, transparent); }
</style>
