<script lang="ts">
	import "./colors.css";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import Subtrack from "./Subtrack.svelte";
	import Repeat from "lucide-svelte/icons/repeat";

	export type TrackVariant = "normal" | "combat";
	export type TrackAudio = {
		fileName?: string;
		currentTime?: number;
		duration?: number;
	};

	type Props = {
		russianName: string;
		entityLink: string;
		atmosphere?: string;
		source?: FullItemSource;
		normal?: TrackAudio;
		combat?: TrackAudio;
		playingVariant?: TrackVariant | null;
		loop?: boolean;
		theme?: "dark" | "light";
		disabled?: boolean;
		playbackDisabled?: boolean;
		editable?: boolean;
		onCopyText?: (text: string) => void;
		onPlayingVariantChange?: (variant: TrackVariant | null) => void;
		onSeek?: (variant: TrackVariant, time: number) => void;
		onAddFile?: (variant: TrackVariant) => void;
		onRemoveFile?: (variant: TrackVariant) => void;
		onLoopChange?: (loop: boolean) => void;
	};

	let {
		russianName = $bindable(""),
		entityLink = $bindable(""),
		atmosphere = $bindable(""),
		source = $bindable<FullItemSource | undefined>(),
		normal = $bindable<TrackAudio | undefined>(),
		combat = $bindable<TrackAudio | undefined>(),
		playingVariant = $bindable<TrackVariant | null>(null),
		loop = $bindable(true),
		theme = "dark",
		disabled = false,
		playbackDisabled = false,
		editable = false,
		onCopyText,
		onPlayingVariantChange,
		onSeek,
		onAddFile,
		onRemoveFile,
		onLoopChange,
	}: Props = $props();

	function changePlayback(variant: TrackVariant, playing: boolean) {
		playingVariant = playing ? variant : null;
		onPlayingVariantChange?.(playingVariant);
	}

	function seek(variant: TrackVariant, time: number) {
		const audio = variant === "normal" ? normal : combat;
		if (audio) audio.currentTime = time;
		onSeek?.(variant, time);
	}

	function removeFile(variant: TrackVariant) {
		if (!editable) return;
		if (!playbackDisabled && playingVariant === variant) changePlayback(variant, false);
		onRemoveFile?.(variant);
	}

	function toggleLoop() {
		loop = !loop;
		onLoopChange?.(loop);
	}
</script>

<article class="track" data-theme={theme} aria-label={russianName}>
	<FullItemHeader bind:russianName englishName="" showEnglishName={false} bind:entityLink bind:info={atmosphere} bind:source onCopy={onCopyText} actions={editable ? headerActions : undefined} {editable} {theme} />
	<Subtrack
		title="Основной"
		fileName={normal?.fileName}
		currentTime={normal?.currentTime}
		duration={normal?.duration}
		playing={playingVariant === "normal"}
		onPlayingChange={(playing) => changePlayback("normal", playing)}
		onSeek={(time) => seek("normal", time)}
		onAdd={editable && onAddFile ? () => onAddFile?.("normal") : undefined}
		onRemove={editable && onRemoveFile ? () => removeFile("normal") : undefined}
		{theme}
		{disabled}
		{playbackDisabled}
	/>
	<Subtrack
		title="Боевой"
		fileName={combat?.fileName}
		currentTime={combat?.currentTime}
		duration={combat?.duration}
		playing={playingVariant === "combat"}
		onPlayingChange={(playing) => changePlayback("combat", playing)}
		onSeek={(time) => seek("combat", time)}
		onAdd={editable && onAddFile ? () => onAddFile?.("combat") : undefined}
		onRemove={editable && onRemoveFile ? () => removeFile("combat") : undefined}
		{theme}
		{disabled}
		{playbackDisabled}
	/>
</article>

{#snippet headerActions()}
	{#if editable}<button class="header-action" type="button" aria-label="Повторять трек" title="Повторять трек" aria-pressed={loop} onclick={toggleLoop}><Repeat size={16} aria-hidden={true} /></button>{/if}
{/snippet}

<style>
	.track {
		--track-primary: var(--ds-track);
		--track-secondary: var(--ds-track-sub);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		min-width: 0;
		padding: 8px;
		background:
			linear-gradient(to top right,
				color-mix(in srgb, var(--track-primary) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--track-secondary) var(--ds-gradient-strength, 20%), transparent)),
			var(--ds-full-surface);
	}

	.track[data-theme="light"] {
		--track-primary: var(--ds-track-light);
		--track-secondary: var(--ds-track-sub-light);
	}

	.track :global(.full-item-header) { min-height: 36px; gap: 4px; }
	.track :global(.details) { flex: 0 1 88px; }
	.track :global(.full-item-header .russian-name) { font-size: 16px; font-weight: 700; line-height: 20px; }
	.track :global(.full-item-header .info) { font-size: 10px; line-height: 12px; overflow-wrap: anywhere; }
	.track :global(.full-item-header .entity-link), .track :global(.full-item-header .source) { font-size: 8px; line-height: 10px; }
	.header-action { display: grid; place-items: center; width: 24px; height: 24px; padding: 2px; border: 0; border-radius: 4px; background: rgb(127 127 127 / 20%); color: inherit; cursor: pointer; }
	.header-action:hover:not(:disabled) { background: rgb(127 127 127 / 35%); }
	.header-action:disabled { opacity: 0.4; cursor: default; }
	.header-action:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	.header-action[aria-pressed="true"] { background: rgb(127 127 127 / 45%); }
</style>
