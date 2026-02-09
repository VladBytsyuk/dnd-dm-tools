<script lang="ts">
	import HtmlBlock from "../../uikit/HtmlBlock.svelte";
	import { formatModifier } from "../../../../domain/modifier";

	interface Weapon {
		name: string;
		mod: string;
		dmg: string;
		ability?: string;
		isProf?: boolean;
	}

	interface Props {
		proficiency: number;
		weaponsList?: Weapon[];
		attacksText?: string;
	}

	let { proficiency, weaponsList = [], attacksText = '' }: Props = $props();
</script>

<div class="character-combat">
	<div class="proficiency-bonus-display">
		<div class="prof-label">Бонус Мастерства</div>
		<div class="prof-value">{formatModifier(proficiency)}</div>
	</div>

	{#if weaponsList.length > 0}
		<div class="weapons-section">
			<h3 class="section-title">Оружие</h3>
			<div class="weapons-table">
				<div class="weapons-header">
					<div class="header-cell weapon-name-col">Название</div>
					<div class="header-cell weapon-mod-col">Атака</div>
					<div class="header-cell weapon-dmg-col">Урон</div>
				</div>
				{#each weaponsList as weapon}
					<div class="weapon-row">
						<div class="weapon-cell weapon-name-col">
							<span class="weapon-name">{weapon.name}</span>
							{#if weapon.isProf}
								<span class="prof-badge" title="Владение">★</span>
							{/if}
						</div>
						<div class="weapon-cell weapon-mod-col">{weapon.mod}</div>
						<div class="weapon-cell weapon-dmg-col">{weapon.dmg}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if attacksText && typeof attacksText === 'string' && attacksText.trim()}
		<div class="attacks-section">
			<h3 class="section-title">Атаки и заклинания</h3>
			<div class="attacks-content">
				<HtmlBlock htmlContent={attacksText} />
			</div>
		</div>
	{/if}
</div>

<style>
	.character-combat {
		padding: 16px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.proficiency-bonus-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 16px;
		background-color: var(--background-secondary);
		border: 2px solid var(--text-accent);
		border-radius: 8px;
		margin-bottom: 16px;
	}

	.prof-label {
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.prof-value {
		font-size: 32px;
		font-weight: 700;
		color: var(--text-accent);
	}

	.weapons-section {
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

	.weapons-table {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.weapons-header {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 8px;
		padding: 8px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.weapon-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 8px;
		padding: 8px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.weapon-row:hover {
		background-color: var(--background-modifier-hover);
	}

	.weapon-cell {
		display: flex;
		align-items: center;
		font-size: 13px;
		color: var(--text-normal);
	}

	.weapon-name-col {
		font-weight: 500;
		gap: 6px;
	}

	.weapon-mod-col,
	.weapon-dmg-col {
		font-weight: 600;
		color: var(--text-accent);
	}

	.prof-badge {
		color: var(--text-accent);
		font-size: 14px;
	}

	.attacks-section {
		margin-top: 16px;
	}

	.attacks-content {
		padding: 12px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		font-size: 13px;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.weapons-header,
		.weapon-row {
			grid-template-columns: 1.5fr 1fr 1fr;
		}
	}
</style>
