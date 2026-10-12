<script lang="ts">
	type Props = {
		/** Playback position in percent, from 0 to 100. */
		value?: number;
		onValueChange?: (value: number) => void;
		disabled?: boolean;
		ariaLabel?: string;
	};

	let {
		value = $bindable(0),
		onValueChange,
		disabled = false,
		ariaLabel = "Позиция воспроизведения",
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
		display: block;
		width: 100%;
		min-width: 0;
		height: 24px;
		margin: 0;
		padding: 0;
		appearance: none;
		background: linear-gradient(to right, #d9d9d9 var(--progress), rgb(217 217 217 / 50%) var(--progress)) center / 100% 2px no-repeat;
		cursor: pointer;
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
		background: #d9d9d9;
	}

	.progress-bar::-moz-range-thumb {
		width: 4px;
		height: 4px;
		border: 0;
		border-radius: 50%;
		background: #d9d9d9;
	}

	.progress-bar:focus-visible {
		outline: none;
	}

	.progress-bar:focus-visible::-webkit-slider-thumb {
		box-shadow: 0 0 0 5px rgb(217 217 217 / 30%);
	}

	.progress-bar:focus-visible::-moz-range-thumb {
		box-shadow: 0 0 0 5px rgb(217 217 217 / 30%);
	}

	.progress-bar:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
