<script lang="ts">
	import "./colors.css";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import Subtrack from "./Subtrack.svelte";

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
		theme?: "dark" | "light";
		disabled?: boolean;
		editable?: boolean;
		onCopyText?: (text: string) => void;
		onPlayingVariantChange?: (variant: TrackVariant | null) => void;
		onSeek?: (variant: TrackVariant, time: number) => void;
		onAddFile?: (variant: TrackVariant) => void;
		onRemoveFile?: (variant: TrackVariant) => void;
	};

	let {
		russianName = $bindable(""),
		entityLink = $bindable(""),
		atmosphere = $bindable(""),
		source = $bindable<FullItemSource | undefined>(),
		normal = $bindable<TrackAudio | undefined>(),
		combat = $bindable<TrackAudio | undefined>(),
		playingVariant = $bindable<TrackVariant | null>(null),
		theme = "dark",
		disabled = false,
		editable = false,
		onCopyText,
		onPlayingVariantChange,
		onSeek,
		onAddFile,
		onRemoveFile,
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
		if (playingVariant === variant) changePlayback(variant, false);
		onRemoveFile?.(variant);
	}
</script>

<article class="track" data-theme={theme} aria-label={russianName}>
	<FullItemHeader bind:russianName englishName="" showEnglishName={false} bind:entityLink bind:info={atmosphere} bind:source onCopy={onCopyText} {editable} {theme} />
	<Subtrack
		title="Основной"
		fileName={normal?.fileName}
		currentTime={normal?.currentTime}
		duration={normal?.duration}
		playing={playingVariant === "normal"}
		onPlayingChange={(playing) => changePlayback("normal", playing)}
		onSeek={(time) => seek("normal", time)}
		onAdd={onAddFile ? () => onAddFile?.("normal") : undefined}
		onRemove={onRemoveFile ? () => removeFile("normal") : undefined}
		{theme}
		{disabled}
	/>
	<Subtrack
		title="Боевой"
		fileName={combat?.fileName}
		currentTime={combat?.currentTime}
		duration={combat?.duration}
		playing={playingVariant === "combat"}
		onPlayingChange={(playing) => changePlayback("combat", playing)}
		onSeek={(time) => seek("combat", time)}
		onAdd={onAddFile ? () => onAddFile?.("combat") : undefined}
		onRemove={onRemoveFile ? () => removeFile("combat") : undefined}
		{theme}
		{disabled}
	/>
</article>

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
</style>
