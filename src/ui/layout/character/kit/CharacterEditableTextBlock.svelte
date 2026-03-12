<script lang="ts">
	import type { TextField } from "../../../../domain/models/character/CharacterText";
	import { getPlainTextFromTextField } from "./characterTextBlockUtils";

	interface Props {
		title: string;
		content?: TextField;
		minHeight?: string;
		maxHeight?: string;
		resize?: "none" | "vertical";
		onChange: (value: string) => void;
	}

	let {
		title,
		content,
		minHeight = "132px",
		maxHeight,
		resize = "vertical",
		onChange
	}: Props = $props();

	let textValue = $state(getPlainTextFromTextField(content));

	$effect(() => {
		const nextValue = getPlainTextFromTextField(content);
		if (nextValue !== textValue) {
			textValue = nextValue;
		}
	});

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		textValue = target.value;
		onChange(textValue);
	}
</script>

<div class="character-editable-text-block">
	<div class="block-header">
		<h3 class="block-title">{title}</h3>
	</div>
	<textarea
		class="block-textarea"
		style:min-height={minHeight}
		style:max-height={maxHeight}
		style:resize={resize}
		value={textValue}
		oninput={handleInput}
		spellcheck="false"
	></textarea>
</div>

<style>
	.character-editable-text-block {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		background-color: var(--background-primary);
		overflow: hidden;
	}

	.block-header {
		padding: 8px 12px;
		border-bottom: 1px solid var(--background-modifier-border);
		background-color: var(--background-secondary);
	}

	.block-title {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
	}

	.block-textarea {
		width: 100%;
		padding: 8px 12px;
		border: 0;
		background-color: var(--background-primary);
		color: var(--text-normal);
		font-family: var(--font-text);
		font-size: 12px;
		line-height: 1.45;
		box-sizing: border-box;
	}

	.block-textarea:focus {
		outline: none;
		background-color: var(--background-primary);
		box-shadow: inset 0 0 0 2px var(--interactive-accent-hover);
	}
</style>
