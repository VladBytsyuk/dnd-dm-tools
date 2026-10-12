<script lang="ts">
	type Props = {
		/** Playback position in percent, from 0 to 100. */
		value?: number;
		onValueChange?: (value: number) => void;
		disabled?: boolean;
		ariaLabel?: string;
		theme?: "dark" | "light";
	};

	let {
		value = $bindable(0),
		onValueChange,
		disabled = false,
		ariaLabel = "Позиция воспроизведения",
		theme = "dark",
	}: Props = $props();

	let position = $derived(Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0);

	function handleInput(event: Event) {
		const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;
		value = nextValue;
		onValueChange?.(nextValue);
	}
</script>

<input
	class="progress-bar"
	data-theme={theme}
	type="range"
	min="0"
	max="100"
	step="1"
	value={position}
	style:--progress={`${position}%`}
	aria-label={ariaLabel}
	{disabled}
	oninput={handleInput}
/>

<style>
	.progress-bar {
		--progress-color: #d9d9d9;
		--progress-unplayed: rgb(217 217 217 / 50%);
		--progress-focus: rgb(217 217 217 / 30%);
		display: block;
		width: 100%;
		min-width: 0;
		height: 24px;
		margin: 0;
		padding: 0;
		appearance: none;
		background: linear-gradient(to right, var(--progress-color) var(--progress), var(--progress-unplayed) var(--progress)) center / 100% 2px no-repeat;
		cursor: pointer;
	}

	.progress-bar[data-theme="light"] {
		--progress-color: #1f2937;
		--progress-unplayed: rgb(31 41 55 / 50%);
		--progress-focus: rgb(31 41 55 / 30%);
	}

	.progress-bar::-webkit-slider-runnable-track {
		height: 2px;
		background: transparent;
	}

	.progress-bar::-moz-range-track {
		height: 2px;
		background: transparent;
	}

	.progress-bar::-webkit-slider-thumb {
		width: 4px;
		height: 4px;
		margin-top: -1px;
		border: 0;
		border-radius: 50%;
		appearance: none;
		background: var(--progress-color);
		transition: transform 120ms ease;
	}

	.progress-bar::-moz-range-thumb {
		width: 4px;
		height: 4px;
		border: 0;
		border-radius: 50%;
		background: var(--progress-color);
		transition: transform 120ms ease;
	}

	.progress-bar:hover:not(:disabled)::-webkit-slider-thumb { transform: scale(2); }
	.progress-bar:hover:not(:disabled)::-moz-range-thumb { transform: scale(2); }
	.progress-bar:active:not(:disabled)::-webkit-slider-thumb { transform: scale(3); }
	.progress-bar:active:not(:disabled)::-moz-range-thumb { transform: scale(3); }

	@media (prefers-reduced-motion: reduce) {
		.progress-bar::-webkit-slider-thumb { transition: none; }
		.progress-bar::-moz-range-thumb { transition: none; }
	}

	.progress-bar:focus-visible {
		outline: none;
	}

	.progress-bar:focus-visible::-webkit-slider-thumb {
		box-shadow: 0 0 0 5px var(--progress-focus);
	}

	.progress-bar:focus-visible::-moz-range-thumb {
		box-shadow: 0 0 0 5px var(--progress-focus);
	}

	.progress-bar:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
