<script lang="ts">
	import type { SmallCharacterSheet } from "../../../domain/models/character";

	interface Props {
		smallItem: SmallCharacterSheet;
		onItemClick: () => void;
	}

	let { smallItem, onItemClick }: Props = $props();
	const { name, charClass, level, race, playerName } = smallItem;
</script>

<div
	class="character-sheet-small-item"
	role="button"
	tabindex="0"
	onclick={onItemClick}
	onkeydown={(e) => e.key === "Enter" && onItemClick()}
>
	<div class="character-sheet-name">{name.rus}</div>
	<div class="character-sheet-details">
		<span class="character-sheet-class-level">{charClass} {level}</span>
		{#if race}
			<span class="character-sheet-race">• {race}</span>
		{/if}
	</div>
	{#if playerName}
		<div class="character-sheet-player">Игрок: {playerName}</div>
	{/if}
</div>

<style>
	.character-sheet-small-item {
		padding: 8px 12px;
		cursor: pointer;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.character-sheet-small-item:hover {
		background-color: var(--background-modifier-hover);
	}

	.character-sheet-name {
		font-weight: 600;
		margin-bottom: 4px;
	}

	.character-sheet-details {
		font-size: 0.9em;
		color: var(--text-muted);
	}

	.character-sheet-class-level {
		font-weight: 500;
	}

	.character-sheet-race {
		margin-left: 4px;
	}

	.character-sheet-player {
		font-size: 0.85em;
		color: var(--text-faint);
		margin-top: 2px;
	}
</style>
