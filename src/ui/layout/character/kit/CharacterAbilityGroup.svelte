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

	function rollDice(formula: string, label: string) {
		const result = rollRawTrace(formula);
		new Notice(`${label}: ${result.total}\n\n${result.resolvedFormula}`);
	}

	const modifier = $derived(calculateModifier(stat?.score ?? 10));
	const saveBonus = $derived(modifier + (save?.isProf ? (proficiency ?? 2) : 0));

	function getSkillBonus(skillKey: string): number {
		const skill = allSkills[skillKey];
		if (!skill) return modifier;
		const profBonus = (proficiency ?? 2) * (skill.isProf ?? 0);
		return modifier + profBonus;
	}

	function getSkillProfLevel(skillKey: string): number {
		const skill = allSkills[skillKey];
		return skill?.isProf || 0;
	}
</script>

<div class="ability-group">
	<!-- Ability + Save in one row -->
	<div class="ability-save-row">
		<div
			class="ability-circle clickable"
			title={abilityFullName}
			onclick={() => rollDice(`к20${formatModifier(modifier)}`, `${abilityFullName} (проверка)`)}>
			<div class="ability-modifier">
				{formatModifier(modifier)}
			</div>
		</div>
		<div
			class="ability-info clickable"
			onclick={() => rollDice(`к20${formatModifier(modifier)}`, `${abilityFullName} (проверка)`)}>
			<div class="ability-name">{abilityLabel}</div>
			<div class="ability-score">{stat.score}</div>
		</div>
		<div
			class="save-label clickable"
			onclick={() => rollDice(`к20${formatModifier(saveBonus)}`, `${abilityFullName} (спасбросок)`)}>
			Спасбросок:
		</div>
		<div
			class="save-indicator clickable"
			class:proficient={save.isProf}
			onclick={() => rollDice(`к20${formatModifier(saveBonus)}`, `${abilityFullName} (спасбросок)`)}>
			{#if save.isProf}
				<div class="prof-dot"></div>
			{/if}
		</div>
		<div
			class="save-bonus clickable"
			onclick={() => rollDice(`к20${formatModifier(saveBonus)}`, `${abilityFullName} (спасбросок)`)}>
			{formatModifier(saveBonus)}
		</div>
	</div>

	<!-- Skills list -->
	{#if skills.length > 0}
		<div class="skills-list">
			{#each skills as skill}
				{@const bonus = getSkillBonus(skill.key)}
				{@const profLevel = getSkillProfLevel(skill.key)}
				<div class="skill-row">
					<div class="skill-indicator" class:proficient={profLevel === 1} class:expertise={profLevel === 2}>
						{#if profLevel === 1 || profLevel === 2}
							<div class="prof-dot"></div>
						{/if}
					</div>
					<div
						class="skill-name clickable"
						onclick={() => rollDice(`к20${formatModifier(bonus)}`, skill.label)}>
						{skill.label}
					</div>
					<div
						class="skill-bonus clickable"
						onclick={() => rollDice(`к20${formatModifier(bonus)}`, skill.label)}>
						{formatModifier(bonus)}
					</div>
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

	.ability-info.clickable:hover {
		opacity: 0.8;
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
	}

	.save-bonus {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-accent);
		min-width: 26px;
		text-align: right;
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
		min-width: 24px;
		text-align: right;
	}

	/* Clickable dice rollers */
	.clickable {
		cursor: pointer;
		transition: color 0.2s;
	}

	.clickable:hover {
		color: var(--interactive-accent);
	}
</style>
