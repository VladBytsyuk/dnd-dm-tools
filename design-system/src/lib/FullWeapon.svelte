<script lang="ts">
	import "./colors.css";
	import Coins from "lucide-svelte/icons/coins";
	import Sword from "lucide-svelte/icons/sword";
	import Weight from "lucide-svelte/icons/weight";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type { FullWeaponEntityLink, FullWeaponViewModel } from "./FullWeaponViewModel";

	type Props = {
		weapon: FullWeaponViewModel;
		onCopyWeapon?: (weapon: FullWeaponViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullWeaponEntityLink) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		weapon = $bindable<FullWeaponViewModel>(),
		onCopyWeapon,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	const entityPathPrefixes = [
		"/bestiary/",
		"/spells/",
		"/screens/",
		"/weapons/",
		"/armors/",
		"/backgrounds/",
		"/feats/",
		"/races/",
		"/classes/",
		"/character-sheets/",
		"/items/magic/",
		"/items/",
	] as const;

	const accentBackground = "var(--full-weapon-accent)";
	let accentColor = $derived(colorForTheme("var(--ds-weapon-sub)"));
	let gradientStart = $derived(colorForTheme(getWeaponTypeToken(weapon.weaponType)));
	let gradientEnd = $derived(colorForTheme("var(--ds-weapon)"));
	let filledBackground = $derived(`color-mix(in srgb, ${accentColor} 40%, transparent)`);
	let chips = $derived.by<ChipsListItem[]>(() => [
		{
			text: weapon.damage,
			icon: Sword,
			iconTooltip: "Урон",
			background: accentBackground,
			onTextChange: (damage) => (weapon.damage = damage),
		},
		{
			text: weapon.price,
			icon: Coins,
			iconTooltip: "Стоимость",
			background: accentBackground,
			onTextChange: (price) => (weapon.price = price),
		},
		{
			text: weapon.weight,
			icon: Weight,
			iconTooltip: "Вес",
			background: accentBackground,
			onTextChange: (weight) => (weapon.weight = weight),
		},
		...weapon.properties.map((property, index) => ({
			text: property.name,
			suffix: property.distance ? `(${property.distance})` : undefined,
			href: property.url,
			background: accentBackground,
			onLinkClick: property.url && isEntityPath(property.url) && onEntityLinkClick
				? (link: FullWeaponEntityLink) => onEntityLinkClick(link)
				: undefined,
			onTextChange: (name: string) => {
				weapon.properties = weapon.properties.map((item, itemIndex) =>
					itemIndex === index ? { ...item, name } : item,
				);
			},
		})),
	]);

	function colorForTheme(token: string): string {
		return theme === "light" ? token.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : token;
	}

	function getWeaponTypeToken(type: string): string {
		const normalizedType = type.toLocaleLowerCase("ru");
		const isSimple = normalizedType.includes("прост");
		const isMartial = normalizedType.includes("воинск");
		const isRanged = normalizedType.includes("дальн");

		if (isSimple && isRanged) return "var(--ds-weapon-simple-ranged)";
		if (isMartial && isRanged) return "var(--ds-weapon-matrial-ranged)";
		if (isSimple) return "var(--ds-weapon-simple-melee)";
		if (isMartial) return "var(--ds-weapon-matrial-melee)";

		return "var(--ds-weapon)";
	}

	function isEntityPath(href: string): boolean {
		return entityPathPrefixes.some((prefix) => href.startsWith(prefix));
	}
</script>

<article
	class="full-weapon"
	data-theme={theme}
	style={`--full-weapon-gradient-start: ${gradientStart}; --full-weapon-gradient-end: ${gradientEnd}; --full-weapon-accent: ${accentColor};`}
>
	<FullItemHeader
		bind:russianName={weapon.russianName}
		bind:englishName={weapon.englishName}
		bind:entityLink={weapon.entityLink}
		bind:info={weapon.weaponType}
		bind:source={weapon.source}
		onNameClick={onCopyWeapon ? () => onCopyWeapon(weapon) : undefined}
		{editable}
		{theme}
	/>

	<ChipsList {chips} {editable} {theme} />

	{#if weapon.description?.html}
		<TextBlock bind:html={weapon.description.html} accentColor={accentColor} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#if weapon.special?.html}
		<FilledTextBlock
			bind:html={weapon.special.html}
			background={filledBackground}
			accentColor={accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}
</article>

<style>
	.full-weapon {
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
				color-mix(in srgb, var(--full-weapon-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--full-weapon-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			rgb(48 48 48 / 40%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-weapon[data-theme="light"],
	.full-weapon[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-weapon[data-theme="light"] { color: #1f2937; }
</style>
