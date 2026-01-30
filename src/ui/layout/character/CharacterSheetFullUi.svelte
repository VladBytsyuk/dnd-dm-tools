<script lang="ts">
	import type { FullCharacterSheet } from "../../../domain/models/character";
	import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";

	let {
		currentItem,
		uiEventListener,
	} = $props<{
		currentItem: FullCharacterSheet;
		uiEventListener: IUiEventListener;
	}>();

	const { data } = currentItem;
</script>

<div class="character-sheet-full">
	<!-- Header -->
	<div class="character-header">
		<h2 class="character-name">{data.name.value}</h2>
		{#if currentItem.playerName}
			<div class="player-name">Игрок: {currentItem.playerName}</div>
		{/if}
	</div>

	<!-- Basic Info -->
	<section class="character-section">
		<h3>Основная информация</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="label">Класс:</span>
				<span class="value">{data.info?.charClass?.value || "—"}</span>
			</div>
			{#if data.info?.charSubclass?.value}
				<div class="info-item">
					<span class="label">Подкласс:</span>
					<span class="value">{data.info.charSubclass.value}</span>
				</div>
			{/if}
			<div class="info-item">
				<span class="label">Уровень:</span>
				<span class="value">{data.info?.level?.value || 1}</span>
			</div>
			<div class="info-item">
				<span class="label">Раса:</span>
				<span class="value">{data.info?.race?.value || "—"}</span>
			</div>
			{#if data.info?.background?.value}
				<div class="info-item">
					<span class="label">Предыстория:</span>
					<span class="value">{data.info.background.value}</span>
				</div>
			{/if}
			{#if data.info?.alignment?.value}
				<div class="info-item">
					<span class="label">Мировоззрение:</span>
					<span class="value">{data.info.alignment.value}</span>
				</div>
			{/if}
			<div class="info-item">
				<span class="label">Опыт:</span>
				<span class="value">{data.info?.experience?.value || 0}</span>
			</div>
		</div>
	</section>

	<!-- Physical Info -->
	{#if data.subInfo && (data.subInfo.age?.value || data.subInfo.height?.value || data.subInfo.weight?.value || data.subInfo.eyes?.value || data.subInfo.skin?.value || data.subInfo.hair?.value)}
		<section class="character-section">
			<h3>Физические характеристики</h3>
			<div class="info-grid">
				{#if data.subInfo?.age?.value}
					<div class="info-item">
						<span class="label">Возраст:</span>
						<span class="value">{data.subInfo.age.value}</span>
					</div>
				{/if}
				{#if data.subInfo?.height?.value}
					<div class="info-item">
						<span class="label">Рост:</span>
						<span class="value">{data.subInfo.height.value}</span>
					</div>
				{/if}
				{#if data.subInfo?.weight?.value}
					<div class="info-item">
						<span class="label">Вес:</span>
						<span class="value">{data.subInfo.weight.value}</span>
					</div>
				{/if}
				{#if data.subInfo?.eyes?.value}
					<div class="info-item">
						<span class="label">Глаза:</span>
						<span class="value">{data.subInfo.eyes.value}</span>
					</div>
				{/if}
				{#if data.subInfo?.skin?.value}
					<div class="info-item">
						<span class="label">Кожа:</span>
						<span class="value">{data.subInfo.skin.value}</span>
					</div>
				{/if}
				{#if data.subInfo?.hair?.value}
					<div class="info-item">
						<span class="label">Волосы:</span>
						<span class="value">{data.subInfo.hair.value}</span>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Ability Scores -->
	<section class="character-section">
		<h3>Характеристики</h3>
		<div class="ability-scores">
			<div class="ability-score">
				<div class="ability-name">СИЛ</div>
				<div class="ability-value">{data.stats?.str?.score || 10}</div>
				<div class="ability-modifier">{(data.stats?.str?.modifier || 0) >= 0 ? "+" : ""}{data.stats?.str?.modifier || 0}</div>
			</div>
			<div class="ability-score">
				<div class="ability-name">ЛОВ</div>
				<div class="ability-value">{data.stats?.dex?.score || 10}</div>
				<div class="ability-modifier">{(data.stats?.dex?.modifier || 0) >= 0 ? "+" : ""}{data.stats?.dex?.modifier || 0}</div>
			</div>
			<div class="ability-score">
				<div class="ability-name">ТЕЛ</div>
				<div class="ability-value">{data.stats?.con?.score || 10}</div>
				<div class="ability-modifier">{(data.stats?.con?.modifier || 0) >= 0 ? "+" : ""}{data.stats?.con?.modifier || 0}</div>
			</div>
			<div class="ability-score">
				<div class="ability-name">ИНТ</div>
				<div class="ability-value">{data.stats?.int?.score || 10}</div>
				<div class="ability-modifier">{(data.stats?.int?.modifier || 0) >= 0 ? "+" : ""}{data.stats?.int?.modifier || 0}</div>
			</div>
			<div class="ability-score">
				<div class="ability-name">МДР</div>
				<div class="ability-value">{data.stats?.wis?.score || 10}</div>
				<div class="ability-modifier">{(data.stats?.wis?.modifier || 0) >= 0 ? "+" : ""}{data.stats?.wis?.modifier || 0}</div>
			</div>
			<div class="ability-score">
				<div class="ability-name">ХАР</div>
				<div class="ability-value">{data.stats?.cha?.score || 10}</div>
				<div class="ability-modifier">{(data.stats?.cha?.modifier || 0) >= 0 ? "+" : ""}{data.stats?.cha?.modifier || 0}</div>
			</div>
		</div>
		<div class="proficiency-bonus">
			<span class="label">Бонус мастерства:</span>
			<span class="value">+{data.proficiency || 2}</span>
		</div>
	</section>

	<!-- Vitality -->
	<section class="character-section">
		<h3>Жизненность</h3>
		<div class="vitality-grid">
			<div class="vitality-item">
				<span class="label">Макс. ХП:</span>
				<span class="value">{data.vitality?.["hp-max"]?.value || 0}</span>
			</div>
			<div class="vitality-item">
				<span class="label">КД:</span>
				<span class="value">{data.vitality?.ac?.value || 10}</span>
			</div>
			<div class="vitality-item">
				<span class="label">Скорость:</span>
				<span class="value">{data.vitality?.speed?.value || 30} {typeof data.vitality?.speed?.value === 'number' ? 'фт.' : ''}</span>
			</div>
			<div class="vitality-item">
				<span class="label">Инициатива:</span>
				<span class="value">{(data.vitality?.initiative?.value || 0) >= 0 ? "+" : ""}{data.vitality?.initiative?.value || 0}</span>
			</div>
			{#if data.vitality?.["hit-die"]?.value}
				<div class="vitality-item">
					<span class="label">Кость хитов:</span>
					<span class="value">{data.vitality["hit-die"].value}</span>
				</div>
			{/if}
		</div>
	</section>

	<!-- Saving Throws -->
	<section class="character-section">
		<h3>Спасброски</h3>
		<div class="saves-grid">
			<div class="save-item">
				<input type="checkbox" checked={data.saves?.str?.isProf || false} disabled />
				<span>Сила</span>
			</div>
			<div class="save-item">
				<input type="checkbox" checked={data.saves?.dex?.isProf || false} disabled />
				<span>Ловкость</span>
			</div>
			<div class="save-item">
				<input type="checkbox" checked={data.saves?.con?.isProf || false} disabled />
				<span>Телосложение</span>
			</div>
			<div class="save-item">
				<input type="checkbox" checked={data.saves?.int?.isProf || false} disabled />
				<span>Интеллект</span>
			</div>
			<div class="save-item">
				<input type="checkbox" checked={data.saves?.wis?.isProf || false} disabled />
				<span>Мудрость</span>
			</div>
			<div class="save-item">
				<input type="checkbox" checked={data.saves?.cha?.isProf || false} disabled />
				<span>Харизма</span>
			</div>
		</div>
	</section>

	<!-- Skills -->
	{#if data.skills}
	<section class="character-section">
		<h3>Навыки</h3>
		<div class="skills-grid">
			{#if data.skills.acrobatics}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.acrobatics?.isProf || false} disabled />
				<span>Акробатика ({data.skills.acrobatics?.baseStat?.toUpperCase() || "DEX"})</span>
			</div>
			{/if}
			{#if data.skills["animal handling"]}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills["animal handling"]?.isProf || false} disabled />
				<span>Уход за животными ({data.skills["animal handling"]?.baseStat?.toUpperCase() || "WIS"})</span>
			</div>
			{/if}
			{#if data.skills.arcana}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.arcana?.isProf || false} disabled />
				<span>Магия ({data.skills.arcana?.baseStat?.toUpperCase() || "INT"})</span>
			</div>
			{/if}
			{#if data.skills.athletics}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.athletics?.isProf || false} disabled />
				<span>Атлетика ({data.skills.athletics?.baseStat?.toUpperCase() || "STR"})</span>
			</div>
			{/if}
			{#if data.skills.deception}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.deception?.isProf || false} disabled />
				<span>Обман ({data.skills.deception?.baseStat?.toUpperCase() || "CHA"})</span>
			</div>
			{/if}
			{#if data.skills.history}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.history?.isProf || false} disabled />
				<span>История ({data.skills.history?.baseStat?.toUpperCase() || "INT"})</span>
			</div>
			{/if}
			{#if data.skills.insight}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.insight?.isProf || false} disabled />
				<span>Проницательность ({data.skills.insight?.baseStat?.toUpperCase() || "WIS"})</span>
			</div>
			{/if}
			{#if data.skills.intimidation}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.intimidation?.isProf || false} disabled />
				<span>Запугивание ({data.skills.intimidation?.baseStat?.toUpperCase() || "CHA"})</span>
			</div>
			{/if}
			{#if data.skills.investigation}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.investigation?.isProf || false} disabled />
				<span>Расследование ({data.skills.investigation?.baseStat?.toUpperCase() || "INT"})</span>
			</div>
			{/if}
			{#if data.skills.medicine}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.medicine?.isProf || false} disabled />
				<span>Медицина ({data.skills.medicine?.baseStat?.toUpperCase() || "WIS"})</span>
			</div>
			{/if}
			{#if data.skills.nature}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.nature?.isProf || false} disabled />
				<span>Природа ({data.skills.nature?.baseStat?.toUpperCase() || "INT"})</span>
			</div>
			{/if}
			{#if data.skills.perception}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.perception?.isProf || false} disabled />
				<span>Внимательность ({data.skills.perception?.baseStat?.toUpperCase() || "WIS"})</span>
			</div>
			{/if}
			{#if data.skills.performance}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.performance?.isProf || false} disabled />
				<span>Выступление ({data.skills.performance?.baseStat?.toUpperCase() || "CHA"})</span>
			</div>
			{/if}
			{#if data.skills.persuasion}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.persuasion?.isProf || false} disabled />
				<span>Убеждение ({data.skills.persuasion?.baseStat?.toUpperCase() || "CHA"})</span>
			</div>
			{/if}
			{#if data.skills.religion}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.religion?.isProf || false} disabled />
				<span>Религия ({data.skills.religion?.baseStat?.toUpperCase() || "INT"})</span>
			</div>
			{/if}
			{#if data.skills["sleight of hand"]}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills["sleight of hand"]?.isProf || false} disabled />
				<span>Ловкость рук ({data.skills["sleight of hand"]?.baseStat?.toUpperCase() || "DEX"})</span>
			</div>
			{/if}
			{#if data.skills.stealth}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.stealth?.isProf || false} disabled />
				<span>Скрытность ({data.skills.stealth?.baseStat?.toUpperCase() || "DEX"})</span>
			</div>
			{/if}
			{#if data.skills.survival}
			<div class="skill-item">
				<input type="checkbox" checked={data.skills.survival?.isProf || false} disabled />
				<span>Выживание ({data.skills.survival?.baseStat?.toUpperCase() || "WIS"})</span>
			</div>
			{/if}
		</div>
	</section>
	{/if}

	<!-- Coins -->
	{#if data.coins}
		<section class="character-section">
			<h3>Монеты</h3>
			<div class="coins-grid">
				<div class="coin-item">
					<span class="label">Золото:</span>
					<span class="value">{data.coins.gp.value}</span>
				</div>
				<div class="coin-item">
					<span class="label">Серебро:</span>
					<span class="value">{data.coins.sp.value}</span>
				</div>
				<div class="coin-item">
					<span class="label">Медь:</span>
					<span class="value">{data.coins.cp.value}</span>
				</div>
				<div class="coin-item">
					<span class="label">Платина:</span>
					<span class="value">{data.coins.pp.value}</span>
				</div>
				<div class="coin-item">
					<span class="label">Электрум:</span>
					<span class="value">{data.coins.ep.value}</span>
				</div>
			</div>
		</section>
	{/if}

	<!-- Weapons -->
	{#if data.weaponsList && data.weaponsList.length > 0}
		<section class="character-section">
			<h3>Оружие</h3>
			<div class="weapons-list">
				{#each data.weaponsList as weapon}
					<div class="weapon-item">
						<div class="weapon-name">{weapon.name.value}</div>
						<div class="weapon-stats">
							<span>Модификатор: {weapon.mod.value}</span>
							<span>Урон: {weapon.dmg.value}</span>
							{#if weapon.isProf}
								<span class="proficient">Владение</span>
							{/if}
						</div>
						{#if weapon.notes?.value}
							<div class="weapon-notes">{weapon.notes.value}</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Spellcasting Info -->
	{#if data.spellsInfo && (data.spellsInfo.base.value || data.spellsInfo.save.value)}
		<section class="character-section">
			<h3>Заклинания</h3>
			<div class="spells-info-grid">
				{#if data.spellsInfo.base.value}
					<div class="spell-info-item">
						<span class="label">Базовая характеристика:</span>
						<span class="value">{data.spellsInfo.base.value} ({data.spellsInfo.base.code})</span>
					</div>
				{/if}
				{#if data.spellsInfo.save.value}
					<div class="spell-info-item">
						<span class="label">Сл спасброска:</span>
						<span class="value">{data.spellsInfo.save.value}</span>
					</div>
				{/if}
				{#if data.spellsInfo.mod.value}
					<div class="spell-info-item">
						<span class="label">Модификатор атаки:</span>
						<span class="value">{data.spellsInfo.mod.value >= 0 ? "+" : ""}{data.spellsInfo.mod.value}</span>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Metadata -->
	<section class="character-section metadata">
		<h3>Дополнительная информация</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="label">Издание:</span>
				<span class="value">{currentItem.edition}</span>
			</div>
			<div class="info-item">
				<span class="label">Версия:</span>
				<span class="value">{currentItem.version}</span>
			</div>
			{#if data.createdAt}
				<div class="info-item">
					<span class="label">Создан:</span>
					<span class="value">{new Date(data.createdAt).toLocaleDateString("ru-RU")}</span>
				</div>
			{/if}
			{#if currentItem.tags && currentItem.tags.length > 0}
				<div class="info-item tags">
					<span class="label">Теги:</span>
					<span class="value">{currentItem.tags.join(", ")}</span>
				</div>
			{/if}
		</div>
	</section>
</div>

<style>
	.character-sheet-full {
		padding: 16px;
		max-width: 100%;
		overflow-y: auto;
	}

	.character-header {
		margin-bottom: 24px;
		border-bottom: 2px solid var(--background-modifier-border);
		padding-bottom: 12px;
	}

	.character-name {
		font-size: 1.8em;
		font-weight: 700;
		margin: 0 0 8px 0;
		color: var(--text-title);
	}

	.player-name {
		font-size: 1.1em;
		color: var(--text-muted);
	}

	.character-section {
		margin-bottom: 24px;
		padding: 16px;
		background-color: var(--background-secondary);
		border-radius: 8px;
	}

	.character-section h3 {
		font-size: 1.3em;
		font-weight: 600;
		margin: 0 0 12px 0;
		color: var(--text-accent);
	}

	.info-grid,
	.vitality-grid,
	.saves-grid,
	.skills-grid,
	.coins-grid,
	.spells-info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}

	.info-item,
	.vitality-item,
	.coin-item,
	.spell-info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		background-color: var(--background-primary);
		border-radius: 4px;
	}

	.label {
		font-weight: 600;
		color: var(--text-normal);
	}

	.value {
		color: var(--text-muted);
		font-weight: 500;
	}

	.ability-scores {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 12px;
		margin-bottom: 16px;
	}

	.ability-score {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px;
		background-color: var(--background-primary);
		border-radius: 8px;
		border: 2px solid var(--background-modifier-border);
	}

	.ability-name {
		font-size: 0.9em;
		font-weight: 700;
		color: var(--text-accent);
		margin-bottom: 8px;
	}

	.ability-value {
		font-size: 1.5em;
		font-weight: 700;
		color: var(--text-normal);
		margin-bottom: 4px;
	}

	.ability-modifier {
		font-size: 1.1em;
		color: var(--text-muted);
	}

	.proficiency-bonus {
		padding: 12px;
		background-color: var(--background-primary);
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.1em;
	}

	.save-item,
	.skill-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px;
	}

	.save-item input[type="checkbox"],
	.skill-item input[type="checkbox"] {
		margin: 0;
	}

	.weapons-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.weapon-item {
		padding: 12px;
		background-color: var(--background-primary);
		border-radius: 4px;
		border-left: 3px solid var(--text-accent);
	}

	.weapon-name {
		font-weight: 700;
		font-size: 1.1em;
		margin-bottom: 4px;
	}

	.weapon-stats {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		font-size: 0.9em;
		color: var(--text-muted);
	}

	.weapon-stats .proficient {
		color: var(--text-accent);
		font-weight: 600;
	}

	.weapon-notes {
		margin-top: 8px;
		font-size: 0.9em;
		color: var(--text-faint);
		font-style: italic;
	}

	.metadata {
		border-top: 2px solid var(--background-modifier-border);
	}

	.tags {
		grid-column: 1 / -1;
	}

	@media (max-width: 768px) {
		.ability-scores {
			grid-template-columns: repeat(3, 1fr);
		}

		.info-grid,
		.vitality-grid,
		.coins-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
