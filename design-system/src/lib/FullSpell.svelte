<script lang="ts">
	import "./colors.css";
	import Hourglass from "lucide-svelte/icons/hourglass";
	import Route from "lucide-svelte/icons/route";
	import Sword from "lucide-svelte/icons/sword";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import Components from "./Components.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import Footer from "./Footer.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type { FullSpellEntityLink, FullSpellViewModel } from "./FullSpellViewModel";

	type Props = {
		spell: FullSpellViewModel;
		onCopySpell?: (spell: FullSpellViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullSpellEntityLink) => void | Promise<void>;
		theme?: "dark" | "light";
	};

	let { spell, onCopySpell, onEntityLinkClick, theme = "dark" }: Props = $props();

	const accentBackground = "var(--full-spell-accent)";
	let accentColor = $derived(colorForTheme("var(--ds-spell-sub)"));
	let gradientStart = $derived(colorForTheme(getSchoolToken(spell.school)));
	let gradientEnd = $derived(colorForTheme("var(--ds-spell)"));
	let filledBackground = $derived(`color-mix(in srgb, ${accentColor} 40%, transparent)`);
	let displayName = $derived(spell.ritual ? `${spell.russianName} [Ритуал]` : spell.russianName);
	let headerInfo = $derived(spell.additionalType ? `${spell.school} · ${spell.additionalType}` : spell.school);
	let duration = $derived(spell.concentration ? `Концентрация, ${spell.duration}` : spell.duration);
	let characteristicChips = $derived.by<ChipsListItem[]>(() => [
		{ text: spell.time, icon: Sword, iconTooltip: "Время накладывания", background: accentBackground },
		{ text: spell.range, icon: Route, iconTooltip: "Дистанция", background: accentBackground },
		{ text: duration, icon: Hourglass, iconTooltip: "Длительность", background: accentBackground },
	]);
	let footerText = $derived(formatFooter(spell));

	function colorForTheme(token: string): string {
		return theme === "light" ? `color-mix(in srgb, ${token} 22%, white)` : token;
	}

	function getSchoolToken(school: string): string {
		const normalizedSchool = school.toLocaleLowerCase("ru");

		if (normalizedSchool.includes("огражден")) return "var(--ds-abjurer)";
		if (normalizedSchool.includes("прорицан")) return "var(--ds-divination)";
		if (normalizedSchool.includes("воплощен")) return "var(--ds-evocation)";
		if (normalizedSchool.includes("иллюзи")) return "var(--ds-illusion)";
		if (normalizedSchool.includes("некромант")) return "var(--ds-necromancy)";
		if (normalizedSchool.includes("преобразован")) return "var(--ds-transmutation)";
		if (normalizedSchool.includes("вызов")) return "var(--ds-conjuration)";
		if (normalizedSchool.includes("очарован")) return "var(--ds-enchantment)";

		return "var(--ds-spell)";
	}

	function formatFooter(value: FullSpellViewModel): string {
		const classes = value.classes?.map((item) => item.name).filter(Boolean) ?? [];
		const subclasses = value.subclasses?.map((item) => item.parentClass ? `${item.name} (${item.parentClass})` : item.name).filter(Boolean) ?? [];
		const parts: string[] = [];

		if (classes.length) parts.push(`Классы: ${classes.join(", ")}`);
		if (subclasses.length) parts.push(`Подклассы: ${subclasses.join(", ")}`);

		return parts.join(" · ");
	}
</script>

<article
	class="full-spell"
	data-theme={theme}
	style={`--full-spell-gradient-start: ${gradientStart}; --full-spell-gradient-end: ${gradientEnd}; --full-spell-accent: ${accentColor};`}
>
	<FullItemHeader
		russianName={displayName}
		englishName={spell.englishName}
		entityLink={spell.entityLink}
		badge={spell.level}
		info={headerInfo}
		source={spell.source}
		onNameClick={onCopySpell ? () => onCopySpell(spell) : undefined}
		{theme}
	/>

	<ChipsList chips={characteristicChips} {theme} />

	<Components
		somatic={spell.components.somatic}
		verbal={spell.components.verbal}
		material={spell.components.material}
		background={accentBackground}
		{theme}
	/>

	<TextBlock
		html={spell.description.html}
		accentColor={accentColor}
		{onEntityLinkClick}
		{theme}
	/>

	{#if spell.higherLevels?.html}
		<FilledTextBlock
			html={spell.higherLevels.html}
			background={filledBackground}
			accentColor={accentColor}
			{onEntityLinkClick}
			{theme}
		/>
	{/if}

	{#if footerText}
		<Footer text={footerText} {theme} />
	{/if}
</article>

<style>
	.full-spell {
		--ds-color-strength: 100%;

		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		min-width: 0;
		padding: 8px;
		background: linear-gradient(180deg, var(--full-spell-gradient-start), var(--full-spell-gradient-end));
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-spell[data-theme="light"],
	.full-spell[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-spell[data-theme="light"] { color: #1f2937; }
	.full-spell :global(.full-item-header) { margin-bottom: 0; }
</style>
