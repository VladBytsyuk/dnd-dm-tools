<script lang="ts">
	import "./colors.css";
	import Hourglass from "lucide-svelte/icons/hourglass";
	import Route from "lucide-svelte/icons/route";
	import Sword from "lucide-svelte/icons/sword";
import Sparkles from "lucide-svelte/icons/sparkles";
import UserCog from "lucide-svelte/icons/user-cog";
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
		onCopyText?: (text: string) => void;
		onEntityLinkClick?: (link: FullSpellEntityLink) => void | Promise<void>;
		theme?: "dark" | "light";
		editable?: boolean;
	};

	let { spell = $bindable<FullSpellViewModel>(), onCopySpell, onCopyText, onEntityLinkClick, theme = "dark", editable = false }: Props = $props();

	const accentBackground = "var(--full-spell-accent)";
	let accentColor = $derived(colorForTheme("var(--ds-spell-sub)"));
	let gradientStart = $derived(colorForTheme(getSchoolToken(spell.school)));
	let gradientEnd = $derived(colorForTheme("var(--ds-spell)"));
	let filledBackground = $derived(`color-mix(in srgb, ${accentColor} 40%, transparent)`);

	function updateHigherLevels(html: string) {
		spell.higherLevels = { ...(spell.higherLevels ?? {}), html };
	}
	let characteristicChips = $derived.by<ChipsListItem[]>(() => [
		...(editable || spell.concentration ? [{ toggle: true, active: Boolean(spell.concentration), icon: UserCog, iconTooltip: "Концентрация", background: accentBackground, onToggle: () => spell.concentration = !spell.concentration }] : []),
		...(editable || spell.ritual ? [{ toggle: true, active: Boolean(spell.ritual), icon: Sparkles, iconTooltip: "Ритуал", background: accentBackground, onToggle: () => spell.ritual = !spell.ritual }] : []),
		{ text: spell.time, placeholder: "1 действие", icon: Sword, iconTooltip: "Время накладывания", background: accentBackground, onTextChange: (value) => spell.time = value },
		{ text: spell.range, placeholder: "60 футов", icon: Route, iconTooltip: "Дистанция", background: accentBackground, onTextChange: (value) => spell.range = value },
		{ text: spell.duration, placeholder: "Мгновенная", icon: Hourglass, iconTooltip: "Длительность", background: accentBackground, onTextChange: (value) => spell.duration = value },
	]);
	let footerText = $derived(formatFooter(spell));
	let classesText = $derived((spell.classes ?? []).map((value) => value.name).join(", "));
	let footerFields = $derived([
		{ label: "Классы", value: classesText, placeholder: "Волшебник, Чародей", onChange: (value: string) => spell.classes = updateClassLinks(value, spell.classes) },
	]);

	$effect(() => {
		if (editable && !spell.higherLevels) spell.higherLevels = { html: "" };
	});

	function updateClassLinks(text: string, current: FullSpellViewModel["classes"]): FullSpellViewModel["classes"] {
		return text.split(",").map((part) => part.trim()).filter(Boolean).map((name) => {
			const existing = current?.find((value) => value.name === name);
			return existing ?? { name, url: `/classes/${name.toLocaleLowerCase("ru").replace(/\s+/gu, "-")}` };
		});
	}

	function colorForTheme(token: string): string {
		return theme === "light" ? token.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : token;
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
		return classes.length ? `Классы: ${classes.join(", ")}` : "";
	}
</script>

<article
	class="full-spell"
	data-theme={theme}
	style={`--full-spell-gradient-start: ${gradientStart}; --full-spell-gradient-end: ${gradientEnd}; --full-spell-accent: ${accentColor};`}
>
	<FullItemHeader
		bind:russianName={spell.russianName}
		bind:englishName={spell.englishName}
		bind:entityLink={spell.entityLink}
		bind:badge={spell.level}
		badgeInputType="number"
		bind:info={spell.school}
		bind:source={spell.source}
		onCopy={onCopyText}
		{editable}
		{theme}
	/>
	<ChipsList chips={characteristicChips} showAddButton={false} {editable} {theme} />

	<Components
		bind:somatic={spell.components.somatic}
		bind:verbal={spell.components.verbal}
		bind:material={spell.components.material}
		background={accentBackground}
		editable={editable}
		{theme}
	/>

	{#if editable || spell.description.html}
		<TextBlock
			bind:html={spell.description.html}
			accentColor={accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}

	{#if editable || spell.higherLevels?.html}
		<FilledTextBlock
			html={spell.higherLevels?.html ?? ""}
			onHtmlChange={updateHigherLevels}
			background={filledBackground}
			accentColor={accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}

	{#if footerText || editable}
		<Footer text={footerText} fields={footerFields} {editable} {theme} />
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
		border-radius: var(--dnd-ui-radius-lg, 8px);
		padding: 8px;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--full-spell-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--full-spell-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			var(--ds-full-surface);
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
