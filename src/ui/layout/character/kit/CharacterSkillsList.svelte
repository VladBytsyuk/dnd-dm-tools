<script lang="ts">
	interface AbilityStat {
		score: number;
		modifier: number;
	}

	interface SkillStat {
		baseStat: string;
		isProf: number; // 0 = not proficient, 1 = proficient, 2 = expertise
	}

	interface Props {
		skills: Record<string, SkillStat>;
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

	let { skills, stats, proficiency }: Props = $props();

	const skillsList = [
		{ key: 'acrobatics', label: 'Акробатика', stat: 'dex' },
		{ key: 'animal-handling', label: 'Обращение с животными', stat: 'wis' },
		{ key: 'arcana', label: 'Магия', stat: 'int' },
		{ key: 'athletics', label: 'Атлетика', stat: 'str' },
		{ key: 'deception', label: 'Обман', stat: 'cha' },
		{ key: 'history', label: 'История', stat: 'int' },
		{ key: 'insight', label: 'Проницательность', stat: 'wis' },
		{ key: 'intimidation', label: 'Запугивание', stat: 'cha' },
		{ key: 'investigation', label: 'Анализ', stat: 'int' },
		{ key: 'medicine', label: 'Медицина', stat: 'wis' },
		{ key: 'nature', label: 'Природа', stat: 'int' },
		{ key: 'perception', label: 'Восприятие', stat: 'wis' },
		{ key: 'performance', label: 'Выступление', stat: 'cha' },
		{ key: 'persuasion', label: 'Убеждение', stat: 'cha' },
		{ key: 'religion', label: 'Религия', stat: 'int' },
		{ key: 'sleight-of-hand', label: 'Ловкость рук', stat: 'dex' },
		{ key: 'stealth', label: 'Скрытность', stat: 'dex' },
		{ key: 'survival', label: 'Выживание', stat: 'wis' }
	];

	function getSkillBonus(skillKey: string, baseStat: string): number {
		const statKey = baseStat as keyof typeof stats;
		const baseMod = stats[statKey]?.modifier || 0;
		const skill = skills[skillKey];
		const profBonus = skill ? proficiency * skill.isProf : 0;
		return baseMod + profBonus;
	}

	function formatModifier(mod: number): string {
		return mod >= 0 ? `+${mod}` : `${mod}`;
	}

	function getStatLabel(stat: string): string {
		const labels: Record<string, string> = {
			str: 'СИЛ',
			dex: 'ЛОВ',
			con: 'ТЕЛ',
			int: 'ИНТ',
			wis: 'МДР',
			cha: 'ХАР'
		};
		return labels[stat] || stat.toUpperCase();
	}
</script>

<div class="character-skills-list">
	<h3 class="section-title">Навыки</h3>
	<div class="skills-list">
		{#each skillsList as skill}
			{@const skillData = skills[skill.key]}
			{@const baseStat = skillData?.baseStat || skill.stat}
			{@const bonus = getSkillBonus(skill.key, baseStat)}
			{@const profLevel = skillData?.isProf || 0}
			<div class="skill-item">
				<div class="skill-prof-indicator" class:proficient={profLevel === 1} class:expertise={profLevel === 2}>
					{#if profLevel === 1}
						<div class="prof-dot"></div>
					{:else if profLevel === 2}
						<div class="expertise-double-dot">
							<div class="dot"></div>
							<div class="dot"></div>
						</div>
					{/if}
				</div>
				<div class="skill-info">
					<div class="skill-label">{skill.label}</div>
					<div class="skill-stat-label">({getStatLabel(baseStat)})</div>
				</div>
				<div class="skill-bonus">{formatModifier(bonus)}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.character-skills-list {
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

	.skills-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.skill-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.skill-item:hover {
		background-color: var(--background-modifier-hover);
	}

	.skill-prof-indicator {
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

	.skill-prof-indicator.proficient {
		border-color: var(--text-accent);
	}

	.skill-prof-indicator.expertise {
		border-color: var(--text-accent);
		background-color: var(--text-accent);
	}

	.prof-dot {
		width: 8px;
		height: 8px;
		background-color: var(--text-accent);
		border-radius: 50%;
	}

	.expertise-double-dot {
		display: flex;
		gap: 2px;
	}

	.expertise-double-dot .dot {
		width: 5px;
		height: 5px;
		background-color: var(--background-primary);
		border-radius: 50%;
	}

	.skill-info {
		flex: 1;
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.skill-label {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-normal);
	}

	.skill-stat-label {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.skill-bonus {
		font-size: 13px;
		font-weight: 700;
		color: var(--text-accent);
		min-width: 32px;
		text-align: right;
	}
</style>
