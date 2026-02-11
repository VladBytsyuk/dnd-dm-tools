<script lang="ts">
	import CharacterStatCircle from "./CharacterStatCircle.svelte";
	import CharacterConditions from "./CharacterConditions.svelte";
	import { formatModifier } from "../../../../domain/modifier";

	/**
	 * Info Block - Right section of vitality block
	 * Contains combat stats (3x2 grid) and conditions (3x5 grid)
	 */
	interface Props {
		ac: number;
		initiative: number;
		speed: number;
		proficiencyBonus: number;
		passivePerception: number;
		darkvision: number;
		conditions: string[];
		onChange: (field: string, value: number) => void;
		onConditionsChange: (conditions: string[]) => void;
		onOpenConditionDetails?: (url: string) => void;
	}

	let {
		ac,
		initiative,
		speed,
		proficiencyBonus,
		passivePerception,
		darkvision,
		conditions,
		onChange,
		onConditionsChange,
		onOpenConditionDetails,
	}: Props = $props();

	const initiativeDisplay = $derived(formatModifier(initiative));
</script>

<div class="info-block">
	<div class="stats-grid">
		<CharacterStatCircle
			value={ac}
			label="КД"
			title="Класс Доспеха (КД)"
			isEditable={true}
			onChange={(value) => onChange("ac", value)}
		/>

		<CharacterStatCircle
			value={initiativeDisplay}
			label="Иниц."
			title="Инициатива"
			isEditable={true}
			onChange={(value) => onChange("initiative", value)}
		/>

		<CharacterStatCircle
			value={speed}
			label="Скорость"
			title="Скорость (футов)"
			isEditable={true}
			onChange={(value) => onChange("speed", value)}
		/>

		<CharacterStatCircle
			value={proficiencyBonus}
			label="Бонус"
			title="Бонус мастерства"
			isEditable={true}
			onChange={(value) => onChange("proficiency-bonus", value)}
		/>

		<CharacterStatCircle
			value={passivePerception}
			label="Пасс. восп."
			title="Пассивное восприятие (10 + модификатор Мудрости + бонус мастерства)"
			isEditable={true}
			onChange={(value) => onChange("passive-perception", value)}
		/>

		<CharacterStatCircle
			value={darkvision}
			label="Тёмн. зр."
			title="Тёмное зрение (футов)"
			isEditable={true}
			onChange={(value) => onChange("darkvision", value)}
		/>
	</div>

	<CharacterConditions
		{conditions}
		onChange={onConditionsChange}
		{onOpenConditionDetails}
	/>
</div>

<style>
	.info-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-top: 8px;
		padding-right: 8px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		justify-items: center;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}
	}
</style>
