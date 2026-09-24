<script lang="ts">
	import "./colors.css";
	import Coins from "lucide-svelte/icons/coins";
	import Weight from "lucide-svelte/icons/weight";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type {
		FullEquipmentEntityLink,
		FullEquipmentViewModel,
	} from "./FullEquipmentViewModel";

	type Props = {
		equipment: FullEquipmentViewModel;
		onCopyEquipment?: (equipment: FullEquipmentViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullEquipmentEntityLink) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		equipment = $bindable<FullEquipmentViewModel>(),
		onCopyEquipment,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	const accentBackground = "var(--full-equipment-accent)";
	let accentColor = $derived(colorForTheme("var(--ds-equipment-sub)"));
	let gradientStart = $derived(colorForTheme("var(--ds-equipment)"));
	let gradientEnd = $derived(colorForTheme("var(--ds-equipment-sub)"));
	let surfaceColor = $derived(theme === "light" ? "rgb(255 255 255 / 78%)" : "rgb(48 48 48 / 40%)");
	let categoryText = $derived(equipment.categories.join(", "));
	let isHomebrew = $derived(Boolean(equipment.homebrew || equipment.source.homebrew));
	let chips = $derived.by<ChipsListItem[]>(() => {
		const items: ChipsListItem[] = [];

		if (equipment.price) {
			items.push({
				text: equipment.price,
				icon: Coins,
				iconTooltip: "Стоимость",
				background: accentBackground,
				onTextChange: (price) => (equipment.price = price),
			});
		}

		if (equipment.weight !== undefined) {
			items.push({
				text: formatWeight(equipment.weight),
				icon: Weight,
				iconTooltip: "Вес",
				background: accentBackground,
				onTextChange: updateWeight,
			});
		}

		return items;
	});

	function colorForTheme(token: string): string {
		return theme === "light" ? `color-mix(in srgb, ${token} 22%, white)` : token;
	}

	function formatWeight(weight: number): string {
		return `${weight} фун`;
	}

	function updateWeight(value: string) {
		const weight = Number(value.replace(",", ".").replace(/\s*фун\.?\s*$/iu, "").trim());
		if (Number.isFinite(weight)) equipment.weight = weight;
	}

	function updateCategories(value: string) {
		equipment.categories = value
			.split(",")
			.map((category) => category.trim())
			.filter((category) => category.length > 0);
	}
</script>

<article
	class="full-equipment"
	data-theme={theme}
	style={`--full-equipment-gradient-start: ${gradientStart}; --full-equipment-gradient-end: ${gradientEnd}; --full-equipment-accent: ${accentColor}; --full-equipment-surface: ${surfaceColor};`}
>
	<FullItemHeader
		bind:russianName={equipment.russianName}
		bind:englishName={equipment.englishName}
		bind:entityLink={equipment.entityLink}
		info={categoryText}
		bind:source={equipment.source}
		sourceSuffix={isHomebrew ? "*" : ""}
		wrapRussianName={true}
		onInfoChange={updateCategories}
		onNameClick={onCopyEquipment ? () => onCopyEquipment(equipment) : undefined}
		{editable}
		{theme}
	/>

	{#if chips.length > 0}
		<ChipsList {chips} {editable} showAddButton={false} {theme} />
	{/if}

	{#if equipment.description?.html}
		<TextBlock bind:html={equipment.description.html} accentColor={accentColor} {onEntityLinkClick} {editable} {theme} />
	{/if}
</article>

<style>
	.full-equipment {
		--ds-color-strength: 100%;

		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		min-width: 0;
		padding: 8px;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--full-equipment-gradient-start) 20%, transparent),
				color-mix(in srgb, var(--full-equipment-gradient-end) 20%, transparent)
			),
			var(--full-equipment-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-equipment[data-theme="light"],
	.full-equipment[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-equipment[data-theme="light"] { color: #1f2937; }

	.full-equipment :global(.text-block),
	.full-equipment :global(.rich-content) {
		align-self: stretch;
		width: 100%;
	}

	.full-equipment :global(.rich-content) { text-align: justify; }
</style>
