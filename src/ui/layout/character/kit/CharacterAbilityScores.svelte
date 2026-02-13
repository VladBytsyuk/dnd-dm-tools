<script lang="ts">
	import { calculateModifier, formatModifier } from "../../../../domain/modifier";

	interface AbilityStat {
		score: number;
		modifier: number;
	}

	interface Props {
		stats: {
			str: AbilityStat;
			dex: AbilityStat;
			con: AbilityStat;
			int: AbilityStat;
			wis: AbilityStat;
			cha: AbilityStat;
		};
	}

	let { stats }: Props = $props();

	const abilities = [
		{ key: 'str', label: 'СИЛ', fullName: 'Сила' },
		{ key: 'dex', label: 'ЛОВ', fullName: 'Ловкость' },
		{ key: 'con', label: 'ТЕЛ', fullName: 'Телосложение' },
		{ key: 'int', label: 'ИНТ', fullName: 'Интеллект' },
		{ key: 'wis', label: 'МДР', fullName: 'Мудрость' },
		{ key: 'cha', label: 'ХАР', fullName: 'Харизма' }
	];
</script>

<div class="character-ability-scores">
	<h3 class="section-title">Характеристики</h3>
	<div class="abilities-grid">
		{#each abilities as ability}
			{@const stat = stats[ability.key as keyof typeof stats]}
			{@const modifier = calculateModifier(stat.score)}
			<div class="ability-container" title={ability.fullName}>
				<div class="ability-label">{ability.label}</div>
				<div class="ability-circle">
					<div class="ability-modifier">{formatModifier(modifier)}</div>
					<div class="ability-score">{stat.score}</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.character-ability-scores {
		padding: 12px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.section-title {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
		text-align: center;
	}

	.abilities-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.ability-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.ability-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--text-muted);
		letter-spacing: 0.5px;
	}

	.ability-circle {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background-color: var(--background-secondary);
		border: 3px solid var(--text-accent);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.ability-circle:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.ability-modifier {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-accent);
		line-height: 1;
	}

	.ability-score {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		line-height: 1;
		margin-top: 2px;
	}
</style>
