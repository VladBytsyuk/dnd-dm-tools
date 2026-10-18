<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import Play from "lucide-svelte/icons/play";
	import Square from "lucide-svelte/icons/square";
	import Plus from "lucide-svelte/icons/plus";
	import Trash from "lucide-svelte/icons/trash-2";
	import ProgressBar from "./ProgressBar.svelte";

	type Props = {
		title?: string;
		fileName?: string;
		playing?: boolean;
		/** Playback position and duration in seconds. */
		currentTime?: number;
		duration?: number;
		disabled?: boolean;
		playbackDisabled?: boolean;
		theme?: "dark" | "light";
		onPlayingChange?: (playing: boolean) => void;
		onSeek?: (time: number) => void;
		onAdd?: () => void;
		onRemove?: () => void;
	};

	let {
		title = "Основной",
		fileName,
		playing = $bindable(false),
		currentTime = $bindable(0),
		duration = 0,
		disabled = false,
		playbackDisabled = false,
		theme = "dark",
		onPlayingChange,
		onSeek,
		onAdd,
		onRemove,
	}: Props = $props();

	let total = $derived(Number.isFinite(duration) ? Math.max(0, duration) : 0);
	let elapsed = $derived(Number.isFinite(currentTime) ? Math.max(0, Math.min(total, currentTime)) : 0);
	let progress = $derived(total > 0 ? elapsed / total * 100 : 0);

	function formatTime(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
	}

	function togglePlayback() {
		playing = !playing;
		onPlayingChange?.(playing);
	}

	function seek(value: number) {
		currentTime = total * value / 100;
		onSeek?.(currentTime);
	}
</script>

<section class="subtrack" data-theme={theme} aria-label={title}>
	<header>
		<span class="title">{title}</span>
		{#if fileName}
			<button class="icon-button" type="button" aria-label={`Удалить файл: ${fileName}`} title="Удалить файл" disabled={disabled || !onRemove} onclick={onRemove}>
				<Trash size={20} style="width: calc(20 * var(--ds-media-unit, 1px)); height: calc(20 * var(--ds-media-unit, 1px))" strokeWidth={1.5} aria-hidden={true} />
			</button>
		{/if}
	</header>
	{#if fileName}
		<div class="content">
			<div class="file-row">
				<button class="icon-button" type="button" aria-label={`${playing ? "Остановить" : "Воспроизвести"}: ${fileName}`} title={playing ? "Остановить" : "Воспроизвести"} disabled={disabled || playbackDisabled} onclick={togglePlayback}>
					{#if playing}<Square size={20} style="width: calc(20 * var(--ds-media-unit, 1px)); height: calc(20 * var(--ds-media-unit, 1px))" strokeWidth={2} aria-hidden={true} />{:else}<Play size={20} style="width: calc(20 * var(--ds-media-unit, 1px)); height: calc(20 * var(--ds-media-unit, 1px))" strokeWidth={2} aria-hidden={true} />{/if}
				</button>
				<span class="file-name" title={fileName}>{fileName}</span>
				<span class="time">{formatTime(elapsed)} / {formatTime(total)}</span>
			</div>
			<div class="progress">
				<ProgressBar value={progress} onValueChange={seek} disabled={disabled || playbackDisabled || total === 0} ariaLabel={`Позиция воспроизведения: ${fileName}`} {theme} />
			</div>
		</div>
	{:else}
		<button class="icon-button add" type="button" aria-label={`Добавить аудиофайл: ${title}`} title="Добавить аудиофайл" disabled={disabled || !onAdd} onclick={onAdd}>
			<Plus size={24} style="width: calc(24 * var(--ds-media-unit, 1px)); height: calc(24 * var(--ds-media-unit, 1px))" strokeWidth={2} aria-hidden={true} />
		</button>
	{/if}
</section>

<style>
	.subtrack {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: calc(6 * var(--ds-media-unit, 1px));
		width: 100%;
		min-width: 0;
		padding: calc(6 * var(--ds-media-unit, 1px));
		border-radius: calc(12 * var(--ds-media-unit, 1px));
		background: rgb(48 48 48 / 40%);
		box-shadow: 0 calc(4 * var(--ds-media-unit, 1px)) calc(4 * var(--ds-media-unit, 1px)) rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
		font-size: calc(14 * var(--ds-media-unit, 1px));
		font-weight: 400;
		line-height: calc(17 * var(--ds-media-unit, 1px));
	}

	.subtrack[data-theme="light"] { background: rgb(48 48 48 / 8%); color: #1f2937; }

	header, .file-row {
		display: flex;
		align-items: center;
		gap: calc(6 * var(--ds-media-unit, 1px));
		min-width: 0;
		min-height: calc(20 * var(--ds-media-unit, 1px));
	}

	.title {
		flex: 1;
		min-width: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: calc(6 * var(--ds-media-unit, 1px));
		min-width: 0;
	}

	.file-name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.time { flex: 0 0 auto; white-space: nowrap; font-variant-numeric: tabular-nums; }

	.subtrack button.icon-button {
		all: unset;
		box-sizing: border-box;
		display: grid;
		flex: 0 0 calc(20 * var(--ds-media-unit, 1px));
		width: calc(20 * var(--ds-media-unit, 1px));
		height: calc(20 * var(--ds-media-unit, 1px));
		place-items: center;
		border-radius: calc(2 * var(--ds-media-unit, 1px));
		color: inherit;
		cursor: pointer;
	}

	.subtrack button.icon-button:hover:not(:disabled) { background: rgb(255 255 255 / 10%); }
	.subtrack[data-theme="light"] button.icon-button:hover:not(:disabled) { background: rgb(15 23 42 / 8%); }
	.subtrack button.icon-button:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
	.subtrack button.icon-button:disabled { opacity: 0.4; cursor: default; }
	.subtrack button.add { align-self: center; flex-basis: calc(24 * var(--ds-media-unit, 1px)); width: calc(24 * var(--ds-media-unit, 1px)); height: calc(24 * var(--ds-media-unit, 1px)); }

	.progress { display: flex; align-items: center; height: calc(4 * var(--ds-media-unit, 1px)); }
</style>
