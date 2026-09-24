<script lang="ts">
	import "./colors.css";
	import Coins from "lucide-svelte/icons/coins";
	import Shield from "lucide-svelte/icons/shield";
	import ShieldCheck from "lucide-svelte/icons/shield-check";
	import ShieldMinus from "lucide-svelte/icons/shield-minus";
	import Weight from "lucide-svelte/icons/weight";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import HandFist from "./icons/HandFist.svelte";
	import EyeDashed from "./icons/EyeDashed.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type { FullArmorEntityLink, FullArmorViewModel } from "./FullArmorViewModel";

	type Props = {
		armor: FullArmorViewModel;
		onCopyArmor?: (armor: FullArmorViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullArmorEntityLink) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		armor = $bindable<FullArmorViewModel>(),
		onCopyArmor,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	const accentBackground = "var(--full-armor-accent)";
	const stealthIcon = EyeDashed as unknown as ChipsListItem["icon"];
	const strengthIcon = HandFist as unknown as ChipsListItem["icon"];
	let accentColor = $derived(colorForTheme("var(--ds-armor-sub)"));
	let gradientStart = $derived(colorForTheme(getArmorTypeToken(armor.armorType)));
	let gradientEnd = $derived(colorForTheme("var(--ds-armor)"));
	let chips = $derived.by<ChipsListItem[]>(() => {
		const items: ChipsListItem[] = [
			{
				text: armor.armorClass,
				icon: Shield,
				iconTooltip: "Класс доспеха",
				background: accentBackground,
				editable,
				onTextChange: (armorClass) => (armor.armorClass = armorClass),
			},
			{
				text: armor.price,
				icon: Coins,
				iconTooltip: "Стоимость",
				background: accentBackground,
				editable,
				onTextChange: (price) => (armor.price = price),
			},
			{
				text: armor.weight,
				icon: Weight,
				iconTooltip: "Вес",
				background: accentBackground,
				editable,
				onTextChange: (weight) => (armor.weight = weight),
			},
		];

		if (armor.stealthDisadvantage) {
			items.push({
				text: "Скрытность",
				icon: stealthIcon,
				iconTooltip: "Помеха на проверки Скрытности",
				background: accentBackground,
			});
		}

		if (armor.strengthRequirement !== undefined) {
			items.push({
				text: String(armor.strengthRequirement),
				icon: strengthIcon,
				iconTooltip: "Требование к Силе",
				background: accentBackground,
			});
		}

		items.push(
			{
				text: armor.donningTime,
				icon: ShieldCheck,
				iconTooltip: "Время надевания",
				background: accentBackground,
				editable,
				onTextChange: (donningTime) => (armor.donningTime = donningTime),
			},
			{
				text: armor.doffingTime,
				icon: ShieldMinus,
				iconTooltip: "Время снятия",
				background: accentBackground,
				editable,
				onTextChange: (doffingTime) => (armor.doffingTime = doffingTime),
			},
		);

		return items;
	});

	function colorForTheme(token: string): string {
		return theme === "light" ? token.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : token;
	}

	function getArmorTypeToken(type: string): string {
		const normalizedType = type.toLocaleLowerCase("ru");

		if (normalizedType.includes("щит") || normalizedType.includes("shield")) return "var(--ds-armor-shield)";
		if (normalizedType.includes("легк") || normalizedType.includes("light")) return "var(--ds-armor-light)";
		if (normalizedType.includes("средн") || normalizedType.includes("medium")) return "var(--ds-armor-medium)";
		if (normalizedType.includes("тяжел") || normalizedType.includes("тяжёл") || normalizedType.includes("heavy")) return "var(--ds-armor-heavy)";

		return "var(--ds-armor)";
	}
</script>

<article
	class="full-armor"
	data-theme={theme}
	style={`--full-armor-gradient-start: ${gradientStart}; --full-armor-gradient-end: ${gradientEnd}; --full-armor-accent: ${accentColor};`}
>
	<FullItemHeader
		bind:russianName={armor.russianName}
		bind:englishName={armor.englishName}
		bind:entityLink={armor.entityLink}
		bind:info={armor.armorType}
		bind:source={armor.source}
		onNameClick={onCopyArmor ? () => onCopyArmor(armor) : undefined}
		{editable}
		{theme}
	/>

	<ChipsList {chips} {theme} />

	{#if armor.description?.html}
		<TextBlock bind:html={armor.description.html} {accentColor} {onEntityLinkClick} {editable} {theme} />
	{/if}
</article>

<style>
	.full-armor {
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
				color-mix(in srgb, var(--full-armor-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--full-armor-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			var(--ds-full-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-armor[data-theme="light"],
	.full-armor[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-armor[data-theme="light"] { color: #1f2937; }
</style>
