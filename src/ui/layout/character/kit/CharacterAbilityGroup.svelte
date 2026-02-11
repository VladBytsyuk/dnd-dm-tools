<script lang="ts">
	import { calculateModifier, formatModifier } from "../../../../domain/modifier";
	import { rollRawTrace } from "../../../../domain/dice";
	import { Notice } from "obsidian";

	interface AbilityStat {
		score: number;
		modifier: number;
	}

	interface SaveStat {
		isProf: boolean;
	}

	interface SkillStat {
		baseStat: string;
		isProf: number; // 0 = not proficient, 1 = proficient, 2 = expertise
	}

	interface Skill {
		key: string;
		label: string;
	}

	interface Props {
		abilityKey: string;
		abilityLabel: string;
		abilityFullName: string;
		stat: AbilityStat;
		save: SaveStat;
		skills: Skill[];
		allSkills: Record<string, SkillStat>;
		proficiency: number;
	}

	let { abilityKey, abilityLabel, abilityFullName, stat, save, skills, allSkills, proficiency }: Props = $props();

	// Editable state
	let abilityScore = $state(stat?.score ?? 10);
	let saveIsProf = $state(save?.isProf ?? false);
	let saveBonusOverride = $state<number | null>(null);
	let skillProfLevels = $state<Record<string, number>>({});
	let skillBonusOverrides = $state<Record<string, number | null>>({});

	// Initialize skill prof levels from data
	$effect(() => {
		skills.forEach(skill => {
			if (skillProfLevels[skill.key] === undefined) {
				skillProfLevels[skill.key] = getSkillProfLevel(skill.key);
			}
		});
	});

	function rollDice(formula: string, label: string) {
		const result = rollRawTrace(formula);
		new Notice(`${label}: ${result.total}\n\n${result.resolvedFormula}`);
	}

	const modifier = $derived(calculateModifier(abilityScore));
	const calculatedSaveBonus = $derived(modifier + (saveIsProf ? (proficiency ?? 2) : 0));
	const saveBonus = $derived(saveBonusOverride ?? calculatedSaveBonus);
	const isSaveBonusOverridden = $derived(saveBonusOverride !== null);

	function getSkillBonus(skillKey: string): number {
		if (skillBonusOverrides[skillKey] !== null && skillBonusOverrides[skillKey] !== undefined) {
			return skillBonusOverrides[skillKey]!;
		}
		const profLevel = skillProfLevels[skillKey] ?? 0;
		const profBonus = (proficiency ?? 2) * profLevel;
		return modifier + profBonus;
	}

	function isSkillBonusOverridden(skillKey: string): boolean {
		return skillBonusOverrides[skillKey] !== null && skillBonusOverrides[skillKey] !== undefined;
	}

	function getSkillProfLevel(skillKey: string): number {
		const skill = allSkills[skillKey];
		return skill?.isProf || 0;
	}

	function toggleSaveProf() {
		saveIsProf = !saveIsProf;
		// Clear override when toggling proficiency
		saveBonusOverride = null;
	}

	function toggleSkillProf(skillKey: string) {
		const current = skillProfLevels[skillKey] ?? 0;
		skillProfLevels[skillKey] = (current + 1) % 3; // Cycle through 0, 1, 2
		// Clear override when toggling proficiency
		skillBonusOverrides[skillKey] = null;
	}

	function handleAbilityScoreChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const value = parseInt(input.value);
		if (!isNaN(value)) {
			abilityScore = value;
		}
	}

	function handleSaveBonusChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const cleaned = input.value.replace(/\s/g, ''); // Remove spaces
		const value = parseInt(cleaned);
		if (!isNaN(value)) {
			// Remove override if value matches calculated
			if (value === calculatedSaveBonus) {
				saveBonusOverride = null;
			} else {
				saveBonusOverride = value;
			}
		} else {
			saveBonusOverride = null;
		}
	}

	function handleSkillBonusChange(skillKey: string, e: Event) {
		const input = e.target as HTMLInputElement;
		const cleaned = input.value.replace(/\s/g, ''); // Remove spaces
		const value = parseInt(cleaned);
		if (!isNaN(value)) {
			// Calculate what the bonus should be
			const profLevel = skillProfLevels[skillKey] ?? 0;
			const profBonus = (proficiency ?? 2) * profLevel;
			const calculatedBonus = modifier + profBonus;

			// Remove override if value matches calculated
			if (value === calculatedBonus) {
				skillBonusOverrides[skillKey] = null;
			} else {
				skillBonusOverrides[skillKey] = value;
			}
		} else {
			skillBonusOverrides[skillKey] = null;
		}
	}
</script>

<div class="ability-group">
	<!-- Ability + Save in one row -->
	<div class="ability-save-row">
		<div
			class="ability-circle clickable"
			title={abilityFullName}
			role="button"
			tabindex="0"
			onclick={() => rollDice(`к20${formatModifier(modifier)}`, `${abilityFullName} (проверка)`)}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rollDice(`к20${formatModifier(modifier)}`, `${abilityFullName} (проверка)`); } }}>
			<div class="ability-modifier">
				{formatModifier(modifier)}
			</div>
		</div>
		<div class="ability-info">
			<div
				class="ability-name clickable"
				role="button"
				tabindex="0"
				onclick={() => rollDice(`к20${formatModifier(modifier)}`, `${abilityFullName} (проверка)`)}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rollDice(`к20${formatModifier(modifier)}`, `${abilityFullName} (проверка)`); } }}>
				{abilityFullName}
			</div>
			<input
				type="number"
				class="ability-score editable-input"
				value={abilityScore}
				oninput={handleAbilityScoreChange}
			/>
		</div>
		<div
			class="save-label clickable"
			role="button"
			tabindex="0"
			onclick={() => rollDice(`к20${formatModifier(saveBonus)}`, `${abilityFullName} (спасбросок)`)}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rollDice(`к20${formatModifier(saveBonus)}`, `${abilityFullName} (спасбросок)`); } }}>
			Спасбросок:
		</div>
		<div
			class="save-indicator clickable"
			class:proficient={saveIsProf}
			role="button"
			tabindex="0"
			onclick={toggleSaveProf}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSaveProf(); } }}>
			{#if saveIsProf}
				<div class="prof-dot"></div>
			{/if}
		</div>
		<input
			type="text"
			class="save-bonus editable-input"
			class:overridden={isSaveBonusOverridden}
			value={formatModifier(saveBonus)}
			oninput={handleSaveBonusChange}
		/>
	</div>

	<!-- Skills list -->
	{#if skills.length > 0}
		<div class="skills-list">
			{#each skills as skill}
				{@const bonus = getSkillBonus(skill.key)}
				{@const profLevel = skillProfLevels[skill.key] ?? 0}
				{@const isOverridden = isSkillBonusOverridden(skill.key)}
				<div class="skill-row">
					<div
						class="skill-indicator clickable"
						class:proficient={profLevel === 1}
						class:expertise={profLevel === 2}
						role="button"
						tabindex="0"
						onclick={() => toggleSkillProf(skill.key)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSkillProf(skill.key); } }}>
						{#if profLevel === 1 || profLevel === 2}
							<div class="prof-dot"></div>
						{/if}
					</div>
					<div
						class="skill-name clickable"
						role="button"
						tabindex="0"
						onclick={() => rollDice(`к20${formatModifier(bonus)}`, skill.label)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rollDice(`к20${formatModifier(bonus)}`, skill.label); } }}>
						{skill.label}
					</div>
					<input
						type="text"
						class="skill-bonus editable-input"
						class:overridden={isOverridden}
						value={formatModifier(bonus)}
						oninput={(e) => handleSkillBonusChange(skill.key, e)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.ability-group {
		margin-bottom: 8px;
		padding: 0;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		container-type: inline-size;
	}

	/* Compact ability + save row */
	.ability-save-row {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px;
		margin-bottom: 4px;
		background-color: var(--background-secondary);
		border-radius: 3px;
	}

	.ability-circle {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background-color: var(--background-primary);
		border: 2px solid var(--text-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background-color 0.2s, border-color 0.2s;
	}

	.ability-circle.clickable:hover {
		background-color: var(--background-modifier-hover);
		border-color: var(--interactive-accent);
	}

	.ability-modifier {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-accent);
		line-height: 1;
	}

	.ability-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
		min-width: 0;
		transition: opacity 0.2s;
	}

	.ability-name {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--text-normal);
		letter-spacing: 0.5px;
		line-height: 1;
	}

	.ability-score {
		font-size: 9px;
		font-weight: 500;
		color: var(--text-muted);
		line-height: 1;
		height: 12px;
		width: 24px;
		max-width: 24px;
		text-align: center;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 2px;
		padding: 0 2px;
		transition: border-color 0.2s, background-color 0.2s;
	}

	.ability-score:hover {
		border-color: var(--background-modifier-border);
		background-color: var(--background-modifier-hover);
	}

	.ability-score:focus {
		outline: none;
		border-color: var(--interactive-accent);
		background-color: var(--background-primary);
	}

	.save-indicator {
		width: 12px;
		height: 12px;
		border: 2px solid var(--background-modifier-border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: border-color 0.2s, transform 0.2s;
		align-self: flex-end;
	}

	.save-indicator.proficient {
		border-color: var(--text-accent);
	}

	.save-indicator.clickable:hover {
		border-color: var(--interactive-accent);
		transform: scale(1.1);
	}

	.prof-dot {
		width: 6px;
		height: 6px;
		background-color: var(--text-accent);
		border-radius: 50%;
	}

	.save-label {
		font-size: 9px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		margin-right: 2px;
		align-self: flex-end;
	}

	.save-bonus {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-accent);
		line-height: 1;
		height: 14px;
		width: 28px;
		max-width: 28px;
		text-align: right;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 2px;
		padding: 0 3px;
		transition: border-color 0.2s, background-color 0.2s, color 0.2s;
		align-self: flex-end;
	}

	.save-bonus:hover {
		border-color: var(--background-modifier-border);
		background-color: var(--background-modifier-hover);
	}

	.save-bonus:focus {
		outline: none;
		border-color: var(--interactive-accent);
		background-color: var(--background-primary);
	}

	.save-bonus.overridden {
		color: var(--text-warning);
		font-weight: 800;
	}

	/* Skills list */
	.skills-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		margin-top: 2px;
	}

	.skill-row {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 2px 4px;
		background-color: var(--background-secondary);
		border-radius: 2px;
		transition: background-color 0.2s;
	}

	.skill-row:hover {
		background-color: var(--background-modifier-hover);
	}

	.skill-indicator {
		width: 10px;
		height: 10px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: border-color 0.2s, transform 0.2s;
	}

	.skill-indicator.clickable:hover {
		border-color: var(--interactive-accent);
		transform: scale(1.15);
	}

	.skill-indicator.proficient {
		border-color: transparent;
		background-color: transparent;
	}

	.skill-indicator.expertise {
		border-color: var(--text-accent);
		border-width: 2px;
		background-color: transparent;
	}

	.skill-indicator .prof-dot {
		width: 4px;
		height: 4px;
	}

	.skill-indicator.proficient .prof-dot {
		width: 8px;
		height: 8px;
	}

	.skill-indicator.expertise .prof-dot {
		width: 3px;
		height: 3px;
	}

	.skill-name {
		flex: 1;
		font-size: 10px;
		font-weight: 500;
		color: var(--text-normal);
		line-height: 1.2;
	}

	.skill-bonus {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-accent);
		line-height: 1;
		height: 13px;
		width: 26px;
		max-width: 26px;
		text-align: right;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 2px;
		padding: 0 3px;
		transition: border-color 0.2s, background-color 0.2s, color 0.2s;
	}

	.skill-bonus:hover {
		border-color: var(--background-modifier-border);
		background-color: var(--background-modifier-hover);
	}

	.skill-bonus:focus {
		outline: none;
		border-color: var(--interactive-accent);
		background-color: var(--background-primary);
	}

	.skill-bonus.overridden {
		color: var(--text-warning);
		font-weight: 800;
	}

	/* Clickable dice rollers */
	.clickable {
		cursor: pointer;
		transition: color 0.2s;
	}

	.clickable:hover {
		color: var(--interactive-accent);
	}

	/* Container query breakpoints for adaptive sizing */

	/* Ultra-compact: < 180px */
	@container (max-width: 180px) {
		.ability-circle {
			width: 32px;
			height: 32px;
		}

		.ability-modifier {
			font-size: 12px;
		}

		.ability-name {
			font-size: 9px;
		}

		.ability-save-row {
			gap: 4px;
			padding: 3px;
		}

		.ability-score {
			width: 22px;
			max-width: 22px;
		}

		.save-bonus {
			width: 26px;
			max-width: 26px;
		}

		.skill-bonus {
			width: 24px;
			max-width: 24px;
		}

		.skill-name {
			font-size: 9px;
		}
	}

	/* Compact: 180-220px */
	@container (min-width: 180px) and (max-width: 220px) {
		.ability-circle {
			width: 34px;
			height: 34px;
		}

		.ability-modifier {
			font-size: 13px;
		}

		.ability-name {
			font-size: 10px;
			letter-spacing: 0.4px;
		}

		.save-label {
			font-size: 8px;
		}

		.skill-name {
			font-size: 9px;
		}
	}

	/* Comfortable: 250px+ */
	@container (min-width: 250px) {
		.ability-save-row {
			gap: 8px;
			padding: 5px;
		}

		.skills-list {
			gap: 2px;
		}

		.skill-row {
			padding: 3px 6px;
		}
	}
</style>
