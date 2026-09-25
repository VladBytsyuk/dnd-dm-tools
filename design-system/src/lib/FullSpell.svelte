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
		editable?: boolean;
	};

	let { spell = $bindable<FullSpellViewModel>(), onCopySpell, onEntityLinkClick, theme = "dark", editable = false }: Props = $props();

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
	let classesText = $derived((spell.classes ?? []).map((value) => value.name).join(", "));
	let subclassesText = $derived((spell.subclasses ?? []).map((value) => value.name).join(", "));

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
		bind:russianName={spell.russianName}
		bind:englishName={spell.englishName}
		bind:entityLink={spell.entityLink}
		bind:badge={spell.level}
		info={headerInfo}
		bind:source={spell.source}
		onNameClick={onCopySpell ? () => onCopySpell(spell) : undefined}
		{editable}
		{theme}
	/>
	{#if editable}
		<div class="spell-editor">
			<label>Уровень<input type="number" min="0" max="9" bind:value={spell.level} /></label>
			<label>Школа<input bind:value={spell.school} /></label>
			<label>Дополнительный тип<input bind:value={spell.additionalType} /></label>
			<label>Время накладывания<input bind:value={spell.time} /></label>
			<label>Дистанция<input bind:value={spell.range} /></label>
			<label>Длительность<input bind:value={spell.duration} /></label>
			<label>Классы<input value={classesText} oninput={(event) => spell.classes = updateClassLinks(event.currentTarget.value, spell.classes)} /></label>
			<label>Подклассы<input value={subclassesText} oninput={(event) => spell.subclasses = updateClassLinks(event.currentTarget.value, spell.subclasses)} /></label>
			<label><input type="checkbox" bind:checked={spell.concentration} /> Концентрация</label>
			<label><input type="checkbox" bind:checked={spell.ritual} /> Ритуал</label>
		</div>
	{/if}

	<ChipsList chips={characteristicChips} {theme} />

	<Components
		somatic={spell.components.somatic}
		verbal={spell.components.verbal}
		material={spell.components.material}
		background={accentBackground}
		editable={editable}
		{theme}
	/>

	<TextBlock
		bind:html={spell.description.html}
		accentColor={accentColor}
		{onEntityLinkClick}
		{editable}
		{theme}
	/>

	{#if spell.higherLevels && (spell.higherLevels.html || editable)}
		<FilledTextBlock
			bind:html={spell.higherLevels.html}
			background={filledBackground}
			accentColor={accentColor}
			{onEntityLinkClick}
			{editable}
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
	.spell-editor { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
	.spell-editor label { display: flex; align-items: center; gap: 5px; font-size: 16.5px; }
	.spell-editor input:not([type="checkbox"]) {
		all: unset;
		box-sizing: border-box;
		display: block;
		min-width: 0;
		width: 100%;
		padding: 4px 6px;
		border: 1px solid rgb(255 255 255 / 24%);
		border-radius: 4px;
		background: rgb(0 0 0 / 16%);
		color: inherit;
		font: inherit;
	}
	.spell-editor input:not([type="checkbox"]):focus-visible { outline: 2px solid currentcolor; outline-offset: 1px; }
</style>
