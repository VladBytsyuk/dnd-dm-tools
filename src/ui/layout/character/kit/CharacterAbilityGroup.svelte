<script lang="ts">
	import { calculateModifier, formatModifier } from "../../../../domain/modifier";

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

	const modifier = $derived(calculateModifier(stat.score));
	const saveBonus = $derived(modifier + (save.isProf ? proficiency : 0));

	function getSkillBonus(skillKey: string): number {
		const skill = allSkills[skillKey];
		if (!skill) return modifier;
		const profBonus = proficiency * skill.isProf;
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
		<div class="ability-circle" title={abilityFullName}>
			<div class="ability-modifier">{formatModifier(modifier)}</div>
		</div>
		<div class="ability-info">
			<div class="ability-name">{abilityLabel}</div>
			<div class="ability-score">{stat.score}</div>
		</div>
		<div class="save-indicator" class:proficient={save.isProf}>
			{#if save.isProf}
				<div class="prof-dot"></div>
			{/if}
		</div>
		<div class="save-bonus">{formatModifier(saveBonus)}</div>
	</div>

	<!-- Skills list -->
	{#if skills.length > 0}
		<div class="skills-list">
			{#each skills as skill}
				{@const bonus = getSkillBonus(skill.key)}
				{@const profLevel = getSkillProfLevel(skill.key)}
				<div class="skill-row">
					<div class="skill-indicator" class:proficient={profLevel === 1} class:expertise={profLevel === 2}>
						{#if profLevel === 1}
							<div class="prof-dot"></div>
						{:else if profLevel === 2}
							<div class="expertise-dots">
								<div class="dot"></div>
								<div class="dot"></div>
							</div>
						{/if}
					</div>
					<div class="skill-name">{skill.label}</div>
					<div class="skill-bonus">{formatModifier(bonus)}</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.ability-group {
		margin-bottom: 8px;
		padding: 6px;
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
		border-left: 2px solid var(--text-accent);
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
	}

	.save-indicator.proficient {
		border-color: var(--text-accent);
	}

	.prof-dot {
		width: 6px;
		height: 6px;
		background-color: var(--text-accent);
		border-radius: 50%;
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
		border-color: var(--text-accent);
	}

	.skill-indicator.expertise {
		border-color: var(--text-accent);
		background-color: var(--text-accent);
	}

	.skill-indicator .prof-dot {
		width: 4px;
		height: 4px;
	}

	.expertise-dots {
		display: flex;
		gap: 1px;
	}

	.expertise-dots .dot {
		width: 3px;
		height: 3px;
		background-color: var(--background-primary);
		border-radius: 50%;
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
</style>
