<script lang="ts">
	import HtmlBlock from "../../uikit/HtmlBlock.svelte";

	interface AttunementItem {
		value: string;
		checked?: boolean;
	}

	interface Props {
		equipmentText?: string;
		proficienciesText?: string;
		coins?: {
			gp?: number;
			sp?: number;
			cp?: number;
			pp?: number;
			ep?: number;
		};
		attunementsList?: AttunementItem[];
	}

	let { equipmentText = '', proficienciesText = '', coins, attunementsList = [] }: Props = $props();

	const coinTypes = [
		{ key: 'pp', label: 'ПП', fullLabel: 'Платиновые' },
		{ key: 'gp', label: 'ЗМ', fullLabel: 'Золотые' },
		{ key: 'ep', label: 'ЭП', fullLabel: 'Электрум' },
		{ key: 'sp', label: 'СМ', fullLabel: 'Серебряные' },
		{ key: 'cp', label: 'ММ', fullLabel: 'Медные' }
	];

	const displayCoins = $derived(
		coins ? coinTypes.filter(coin => coins[coin.key as keyof typeof coins] !== undefined && coins[coin.key as keyof typeof coins]! > 0) : []
	);
</script>

<div class="character-equipment">
	{#if coins && displayCoins.length > 0}
		<div class="coins-section">
			<h3 class="section-title">Монеты</h3>
			<div class="coins-grid">
				{#each displayCoins as coinType}
					{@const amount = coins[coinType.key as keyof typeof coins]}
					<div class="coin-item" title={coinType.fullLabel}>
						<div class="coin-label">{coinType.label}</div>
						<div class="coin-value">{amount}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if equipmentText && typeof equipmentText === 'string' && equipmentText.trim()}
		<div class="equipment-section">
			<h3 class="section-title">Снаряжение</h3>
			<div class="equipment-content">
				<HtmlBlock htmlContent={equipmentText} />
			</div>
		</div>
	{/if}

	{#if attunementsList.length > 0}
		<div class="attunement-section">
			<h3 class="section-title">Настройка на предметы</h3>
			<div class="attunement-list">
				{#each attunementsList as item}
					<div class="attunement-item">
						<div class="attunement-checkbox" class:checked={item.checked}>
							{#if item.checked}
								<span class="check-mark">✓</span>
							{/if}
						</div>
						<div class="attunement-name">{item.value}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if proficienciesText && typeof proficienciesText === 'string' && proficienciesText.trim()}
		<div class="proficiencies-section">
			<h3 class="section-title">Владения и языки</h3>
			<div class="proficiencies-content">
				<HtmlBlock htmlContent={proficienciesText} />
			</div>
		</div>
	{/if}
</div>

<style>
	.character-equipment {
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
		padding-bottom: 8px;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.coins-section {
		margin-bottom: 16px;
	}

	.coins-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 8px;
	}

	.coin-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px 8px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.coin-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.coin-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 4px;
	}

	.coin-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-accent);
	}

	.equipment-section,
	.proficiencies-section {
		margin-bottom: 16px;
	}

	.equipment-content,
	.proficiencies-content {
		padding: 12px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		font-size: 13px;
		line-height: 1.6;
	}

	.attunement-section {
		margin-bottom: 16px;
	}

	.attunement-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.attunement-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.attunement-item:hover {
		background-color: var(--background-modifier-hover);
	}

	.attunement-checkbox {
		width: 18px;
		height: 18px;
		border: 2px solid var(--background-modifier-border);
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: border-color 0.2s, background-color 0.2s;
	}

	.attunement-checkbox.checked {
		border-color: var(--text-accent);
		background-color: var(--text-accent);
	}

	.check-mark {
		color: var(--background-primary);
		font-size: 14px;
		font-weight: 700;
	}

	.attunement-name {
		flex: 1;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-normal);
	}
</style>
