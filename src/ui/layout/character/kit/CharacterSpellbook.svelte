<script lang="ts">
	import HtmlBlock from "../../uikit/HtmlBlock.svelte";

	interface Props {
		spellsInfo?: {
			base?: string;
			save?: number;
			mod?: number;
		};
		spells?: Record<string, any>;
		spellTexts?: Record<string, string>;
	}

	let { spellsInfo, spells = {}, spellTexts = {} }: Props = $props();

	const spellLevels = [
		{ level: 0, label: 'Заговоры', slots: false },
		{ level: 1, label: '1 уровень', slots: true },
		{ level: 2, label: '2 уровень', slots: true },
		{ level: 3, label: '3 уровень', slots: true },
		{ level: 4, label: '4 уровень', slots: true },
		{ level: 5, label: '5 уровень', slots: true },
		{ level: 6, label: '6 уровень', slots: true },
		{ level: 7, label: '7 уровень', slots: true },
		{ level: 8, label: '8 уровень', slots: true },
		{ level: 9, label: '9 уровень', slots: true }
	];

	function getSpellSlots(level: number): number {
		return spells[`slots-${level}`] || 0;
	}

	function getSpellText(level: number): string {
		const text = spellTexts[`spells-level-${level}`];
		if (!text) return '';
		if (typeof text === 'string') return text;
		return '';
	}

	function hasSpellsForLevel(level: number): boolean {
		const text = getSpellText(level);
		return text && text.trim().length > 0;
	}

	function formatModifier(mod: number | undefined): string {
		if (mod === undefined) return '—';
		return mod >= 0 ? `+${mod}` : `${mod}`;
	}
</script>

{#if spellsInfo || Object.keys(spells).length > 0}
	<div class="character-spellbook">
		<h3 class="section-title">Заклинания</h3>

		{#if spellsInfo}
			<div class="spell-info-box">
				{#if spellsInfo.base}
					<div class="spell-info-item">
						<span class="info-label">Базовая характеристика:</span>
						<span class="info-value">{spellsInfo.base}</span>
					</div>
				{/if}
				{#if spellsInfo.save !== undefined}
					<div class="spell-info-item">
						<span class="info-label">Сл спасброска:</span>
						<span class="info-value">{spellsInfo.save}</span>
					</div>
				{/if}
				{#if spellsInfo.mod !== undefined}
					<div class="spell-info-item">
						<span class="info-label">Бонус атаки:</span>
						<span class="info-value">{formatModifier(spellsInfo.mod)}</span>
					</div>
				{/if}
			</div>
		{/if}

		<div class="spell-levels-container">
			{#each spellLevels as levelInfo}
				{@const slots = levelInfo.slots ? getSpellSlots(levelInfo.level) : null}
				{@const spellText = getSpellText(levelInfo.level)}
				{@const hasSpells = hasSpellsForLevel(levelInfo.level)}

				{#if hasSpells || (slots && slots > 0)}
					<div class="spell-level-section">
						<div class="spell-level-header">
							<span class="level-label">{levelInfo.label}</span>
							{#if slots !== null && slots > 0}
								<div class="spell-slots">
									{#each Array(slots) as _, i}
										<div class="slot-circle"></div>
									{/each}
								</div>
							{/if}
						</div>
						{#if hasSpells}
							<div class="spell-list-content">
								<HtmlBlock htmlContent={spellText} />
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<style>
	.character-spellbook {
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

	.spell-info-box {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		margin-bottom: 16px;
	}

	.spell-info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
	}

	.info-label {
		font-weight: 600;
		color: var(--text-muted);
	}

	.info-value {
		font-weight: 700;
		color: var(--text-accent);
	}

	.spell-levels-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.spell-level-section {
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		overflow: hidden;
	}

	.spell-level-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background-color: var(--background-secondary);
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.level-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-normal);
	}

	.spell-slots {
		display: flex;
		gap: 6px;
	}

	.slot-circle {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid var(--text-accent);
		background-color: var(--background-primary);
		transition: background-color 0.2s;
	}

	.slot-circle:hover {
		background-color: var(--text-accent);
		opacity: 0.3;
	}

	.spell-list-content {
		padding: 12px;
		font-size: 13px;
		line-height: 1.6;
		background-color: var(--background-primary);
	}

	.spell-list-content :global(p) {
		margin: 0 0 8px 0;
	}

	.spell-list-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.spell-list-content :global(ul),
	.spell-list-content :global(ol) {
		margin: 0 0 8px 0;
		padding-left: 20px;
	}
</style>
