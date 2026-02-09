<script lang="ts">
	import { calculateModifier, formatModifier } from "../../../../domain/modifier";

	interface AbilityStat {
		score: number;
		modifier: number;
	}

	interface SaveStat {
		isProf: boolean;
	}

	interface Props {
		saves: {
			str: SaveStat;
			dex: SaveStat;
			con: SaveStat;
			int: SaveStat;
			wis: SaveStat;
			cha: SaveStat;
		};
		stats: {
			str: AbilityStat;
			dex: AbilityStat;
			con: AbilityStat;
			int: AbilityStat;
			wis: AbilityStat;
			cha: AbilityStat;
		};
		proficiency: number;
	}

	let { saves, stats, proficiency }: Props = $props();

	const savesList = [
		{ key: 'str', label: 'Сила' },
		{ key: 'dex', label: 'Ловкость' },
		{ key: 'con', label: 'Телосложение' },
		{ key: 'int', label: 'Интеллект' },
		{ key: 'wis', label: 'Мудрость' },
		{ key: 'cha', label: 'Харизма' }
	];

	function getSaveBonus(saveKey: string): number {
		const key = saveKey as keyof typeof stats;
		const baseMod = calculateModifier(stats[key].score);
		const profBonus = saves[key].isProf ? proficiency : 0;
		return baseMod + profBonus;
	}
</script>

<div class="character-saving-throws">
	<h3 class="section-title">Спасброски</h3>
	<div class="saves-list">
		{#each savesList as save}
			{@const bonus = getSaveBonus(save.key)}
			{@const isProf = saves[save.key as keyof typeof saves].isProf}
			<div class="save-item">
				<div class="save-prof-indicator" class:proficient={isProf}>
					{#if isProf}
						<div class="prof-dot"></div>
					{/if}
				</div>
				<div class="save-label">{save.label}</div>
				<div class="save-bonus">{formatModifier(bonus)}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.character-saving-throws {
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
		border-bottom: 1px solid var(--background-modifier-border);
		padding-bottom: 8px;
	}

	.saves-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.save-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.save-item:hover {
		background-color: var(--background-modifier-hover);
	}

	.save-prof-indicator {
		width: 16px;
		height: 16px;
		border: 2px solid var(--background-modifier-border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: border-color 0.2s;
	}

	.save-prof-indicator.proficient {
		border-color: var(--text-accent);
	}

	.prof-dot {
		width: 8px;
		height: 8px;
		background-color: var(--text-accent);
		border-radius: 50%;
	}

	.save-label {
		flex: 1;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-normal);
	}

	.save-bonus {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-accent);
		min-width: 32px;
		text-align: right;
	}
</style>
