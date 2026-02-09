<script lang="ts">
	import { formatModifier } from "../../../../domain/modifier";

	interface Props {
		vitality: {
			'hp-max': number;
			'hp-current': number;
			ac: number;
			speed: string;
			initiative: number;
			'hit-die': string;
			'hp-dice-current': number;
			isDying?: boolean;
		};
	}

	let { vitality }: Props = $props();

	const hpPercentage = $derived((vitality['hp-current'] / vitality['hp-max']) * 100);
	const hpColor = $derived(
		hpPercentage > 50 ? 'var(--color-green)' :
		hpPercentage > 25 ? 'var(--color-yellow)' :
		'var(--color-red)'
	);
</script>

<div class="character-vitality-block">
	<div class="vitality-primary">
		<div class="vitality-stat hp-stat">
			<div class="stat-label">Хиты</div>
			<div class="hp-display">
				<span class="hp-current" class:dying={vitality.isDying}>{vitality['hp-current']}</span>
				<span class="hp-separator">/</span>
				<span class="hp-max">{vitality['hp-max']}</span>
			</div>
			<div class="hp-bar">
				<div class="hp-fill" style="width: {Math.max(0, Math.min(100, hpPercentage))}%; background-color: {hpColor};"></div>
			</div>
		</div>

		<div class="vitality-stat ac-stat">
			<div class="stat-circle">
				<div class="stat-value">{vitality.ac}</div>
				<div class="stat-label-small">КД</div>
			</div>
		</div>

		<div class="vitality-stat initiative-stat">
			<div class="stat-circle">
				<div class="stat-value">{formatModifier(vitality.initiative)}</div>
				<div class="stat-label-small">Иниц.</div>
			</div>
		</div>

		<div class="vitality-stat speed-stat">
			<div class="stat-circle">
				<div class="stat-value">{vitality.speed}</div>
				<div class="stat-label-small">Скорость</div>
			</div>
		</div>
	</div>

	<div class="vitality-secondary">
		<div class="hit-dice-display">
			<span class="hit-dice-label">Кости Хитов:</span>
			<span class="hit-dice-value">{vitality['hp-dice-current']} / {vitality['hit-die']}</span>
		</div>
	</div>
</div>

<style>
	.character-vitality-block {
		padding: 16px;
		background-color: var(--background-primary);
		border: 2px solid var(--text-accent);
		border-radius: 8px;
		margin-bottom: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.vitality-primary {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: 16px;
		margin-bottom: 12px;
	}

	.vitality-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.hp-stat {
		align-items: stretch;
	}

	.stat-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 8px;
		text-align: center;
	}

	.hp-display {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.hp-current {
		font-size: 32px;
		font-weight: 700;
		color: var(--text-accent);
		line-height: 1;
	}

	.hp-current.dying {
		color: var(--color-red);
	}

	.hp-separator {
		font-size: 24px;
		color: var(--text-muted);
	}

	.hp-max {
		font-size: 20px;
		font-weight: 600;
		color: var(--text-normal);
	}

	.hp-bar {
		height: 12px;
		background-color: var(--background-secondary);
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid var(--background-modifier-border);
	}

	.hp-fill {
		height: 100%;
		transition: width 0.3s ease, background-color 0.3s ease;
		border-radius: 6px;
	}

	.stat-circle {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background-color: var(--background-secondary);
		border: 2px solid var(--background-modifier-border);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.stat-value {
		font-size: 20px;
		font-weight: 700;
		color: var(--text-normal);
		line-height: 1;
	}

	.stat-label-small {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-top: 4px;
	}

	.vitality-secondary {
		padding-top: 12px;
		border-top: 1px solid var(--background-modifier-border);
	}

	.hit-dice-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 13px;
	}

	.hit-dice-label {
		font-weight: 600;
		color: var(--text-muted);
	}

	.hit-dice-value {
		font-weight: 700;
		color: var(--text-normal);
		font-size: 14px;
	}

	@media (max-width: 768px) {
		.vitality-primary {
			grid-template-columns: 1fr 1fr;
			gap: 12px;
		}

		.hp-stat {
			grid-column: 1 / -1;
		}
	}
</style>
