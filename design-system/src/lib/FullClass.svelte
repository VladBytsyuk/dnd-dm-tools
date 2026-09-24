<script lang="ts">
	import "./colors.css";
	import BicepsFlexed from "lucide-svelte/icons/biceps-flexed";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import Heart from "lucide-svelte/icons/heart";
	import Shield from "lucide-svelte/icons/shield";
	import ShieldCheck from "lucide-svelte/icons/shield-check";
	import Sword from "lucide-svelte/icons/sword";
	import Wrench from "lucide-svelte/icons/wrench";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import ImageGroup from "./ImageGroup.svelte";
	import Table, { type TableValue } from "./Table.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type {
		FullClassEntityLink,
		FullClassFeature,
		FullClassProgressionColumn,
		FullClassProgressionLevel,
		FullClassProgressionValue,
		FullClassViewModel,
	} from "./FullClassViewModel";

	type Props = {
		characterClass: FullClassViewModel;
		onCopyClass?: (characterClass: FullClassViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullClassEntityLink) => void | Promise<void>;
		theme?: "dark" | "light";
	};

	let {
		characterClass,
		onCopyClass,
		onEntityLinkClick,
		theme = "dark",
	}: Props = $props();

	const accentBackground = "var(--full-class-accent)";
	const internalClassPath = "/classes/";
	let accentColor = $derived(colorForTheme("var(--ds-class-sub)"));
	let gradientStart = $derived(colorForTheme(getClassToken(characterClass.entityLink)));
	let gradientEnd = $derived(colorForTheme("var(--ds-class)"));
	let hasImages = $derived(Boolean(characterClass.images?.length));
	let archetypeChips = $derived.by<ChipsListItem[]>(() => createArchetypeChips(characterClass));
	let hitPointChips = $derived.by<ChipsListItem[]>(() => createHitPointChips(characterClass.dice));
	let proficiencyChips = $derived.by<ChipsListItem[]>(() => createProficiencyChips(characterClass));
	let progressionColumns = $derived(characterClass.progression?.columns ?? []);
	let progressionValues = $derived(createProgressionValues(characterClass.progression?.levels ?? [], progressionColumns));
	let tableColumnCount = $derived(3 + progressionColumns.length);
	let hasStructuredContent = $derived(Boolean(
		characterClass.archetypes?.length
		|| characterClass.progression?.levels.length
		|| proficiencyChips.length
		|| characterClass.equipment?.html.trim()
		|| characterClass.features?.length,
	));

	function colorForTheme(token: string): string {
		return theme === "light" ? token.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : token;
	}

	function getClassToken(entityLink: string): string {
		const classSlug = entityLink.split("/").filter(Boolean)[1]?.toLocaleLowerCase("ru") ?? "";
		const tokens: Record<string, string> = {
			artificer: "var(--ds-artificer)",
			barbarian: "var(--ds-barbarian)",
			bard: "var(--ds-bard)",
			cleric: "var(--ds-cleric)",
			druid: "var(--ds-druid)",
			fighter: "var(--ds-fighter)",
			monk: "var(--ds-monk)",
			paladin: "var(--ds-paladin)",
			ranger: "var(--ds-ranger)",
			rouge: "var(--ds-rouge)",
			rogue: "var(--ds-rouge)",
			sorcerer: "var(--ds-sorcerer)",
			warlock: "var(--ds-warlock)",
			wizard: "var(--ds-wizard)",
		};

		return tokens[classSlug] ?? "var(--ds-class)";
	}

	function createArchetypeChips(value: FullClassViewModel): ChipsListItem[] {
		if (value.isArchetype && value.parentClassUrl) {
			return [{
				text: "Базовый класс",
				href: value.parentClassUrl,
				background: accentBackground,
				onLinkClick: isInternalClassPath(value.parentClassUrl) && onEntityLinkClick ? onEntityLinkClick : undefined,
			}];
		}

		return (value.archetypes ?? []).map((archetype) => ({
			text: `${archetype.russianName}${archetype.source.shortName ? ` ${archetype.source.shortName}` : ""}`,
			href: archetype.entityLink,
			background: accentBackground,
			onLinkClick: isInternalClassPath(archetype.entityLink) && onEntityLinkClick ? onEntityLinkClick : undefined,
		}));
	}

	function createHitPointChips(dice: string): ChipsListItem[] {
		const dieSize = getDieSize(dice);
		const hitDie = dice.trim() ? `1${dice.trim()}` : "";
		const firstLevel = dieSize ? `${dieSize} + мод. Телосложения` : "";
		const higherLevels = dieSize ? `1${dice.trim()} (или ${Math.floor(dieSize / 2) + 1}) + мод. Телосложения (мин. 1)` : "";

		return [
			{ text: hitDie, icon: Heart, iconTooltip: "Кость хитов", background: accentBackground },
			{ text: firstLevel, icon: ShieldCheck, iconTooltip: "Хиты на 1 уровне", background: accentBackground },
			{ text: higherLevels, icon: ChevronRight, iconTooltip: "Хиты на следующих уровнях", background: accentBackground },
		].filter((chip) => Boolean(chip.text));
	}

	function getDieSize(dice: string): number | undefined {
		const match = /\d+/u.exec(dice);
		const value = match ? Number(match[0]) : Number.NaN;
		return Number.isFinite(value) && value > 0 ? value : undefined;
	}

	function createProficiencyChips(value: FullClassViewModel): ChipsListItem[] {
		const proficiencies = value.proficiencies;
		if (!proficiencies) return [];
		const chips: ChipsListItem[] = [];

		if (hasValue(proficiencies.armor)) chips.push({ text: proficiencies.armor, icon: Shield, iconTooltip: "Владение доспехами", background: accentBackground });
		if (hasValue(proficiencies.weapons)) chips.push({ text: proficiencies.weapons, icon: Sword, iconTooltip: "Владение оружием", background: accentBackground });
		if (hasValue(proficiencies.savingThrows)) chips.push({ text: proficiencies.savingThrows, icon: ShieldCheck, iconTooltip: "Спасброски", background: accentBackground });
		if (hasValue(proficiencies.tools)) chips.push({ text: proficiencies.tools, icon: Wrench, iconTooltip: "Инструменты", background: accentBackground });
		if (proficiencies.skills && proficiencies.skills.options.length > 0) {
			chips.push({
				text: `Выберите ${proficiencies.skills.choose}: ${proficiencies.skills.options.join(", ")}`,
				icon: BicepsFlexed,
				iconTooltip: "Навыки",
				background: accentBackground,
			});
		}

		return chips;
	}

	function hasValue(value: string | undefined): value is string {
		const normalizedValue = value?.trim();
		return normalizedValue !== undefined && normalizedValue !== "" && normalizedValue.toLocaleLowerCase("ru") !== "нет";
	}

	function createProgressionValues(
		levels: FullClassProgressionLevel[],
		columns: FullClassProgressionColumn[],
	): TableValue[] {
		const values: TableValue[] = ["Ур.", "БМ", "Умения", ...columns.map((column) => column.label)];

		levels.forEach((level) => {
			values.push(
				level.level,
				formatProficiencyBonus(level.proficiencyBonus),
				level.features?.join(", ") ?? "",
				...columns.map((column) => formatProgressionValue(level.values?.[column.key], column.prefix, column.suffix)),
			);
		});

		return values;
	}

	function formatProficiencyBonus(value: number): string {
		return value > 0 ? `+${value}` : String(value);
	}

	function formatProgressionValue(value: FullClassProgressionValue | undefined, prefix?: string, suffix?: string): string {
		if (value === undefined) return "";
		return `${prefix ?? ""}${value}${suffix ?? ""}`;
	}

	function getFeatureLevel(feature: FullClassFeature): string | undefined {
		if (feature.levelLabel?.trim()) return feature.levelLabel;
		return feature.level === undefined ? undefined : `${feature.level} уровень`;
	}

	function isInternalClassPath(href: string): boolean {
		return href.startsWith(internalClassPath);
	}
</script>

<article
	class="full-class"
	data-theme={theme}
	style={`--full-class-gradient-start: ${gradientStart}; --full-class-gradient-end: ${gradientEnd}; --full-class-accent: ${accentColor};`}
>
	<section class="class-header">
		<div class="class-summary">
			<FullItemHeader
				russianName={characterClass.russianName}
				englishName={characterClass.englishName}
				entityLink={characterClass.entityLink}
				info={characterClass.archetypeType?.name}
				source={characterClass.source}
				sourceSuffix={characterClass.source.homebrew ? "*" : ""}
				wrapRussianName={true}
				onNameClick={onCopyClass ? () => onCopyClass(characterClass) : undefined}
				{theme}
			/>

			{#if archetypeChips.length > 0}
				<ChipsList chips={archetypeChips} showAddButton={false} {theme} />
			{/if}

			{#if hitPointChips.length > 0}
				<ChipsList chips={hitPointChips} showAddButton={false} {theme} />
			{/if}
		</div>

		{#if hasImages}
			<ImageGroup images={characterClass.images} alt={characterClass.russianName} size={128} {theme} />
		{/if}
	</section>

	{#if characterClass.progression?.levels.length}
		<div class="progression-scroll" style={`--full-class-table-columns: ${tableColumnCount};`}>
			<Table columns={tableColumnCount} values={progressionValues} accentColor={accentColor} {theme} />
		</div>
	{/if}

	{#if proficiencyChips.length > 0}
		<ChipsList chips={proficiencyChips} showAddButton={false} {theme} />
	{/if}

	{#if characterClass.equipment?.html.trim()}
		<TextBlock html={characterClass.equipment.html} expanded={true} accentColor={accentColor} {onEntityLinkClick} {theme} />
	{:else if characterClass.associatedContent?.html.trim() && !hasStructuredContent}
		<TextBlock html={characterClass.associatedContent.html} expanded={true} accentColor={accentColor} {onEntityLinkClick} {theme} />
	{/if}

	{#each characterClass.features ?? [] as feature (feature.id ?? `${feature.name}-${feature.level ?? ""}`)}
		{#if feature.html.trim()}
			<FilledTextBlock
				title={feature.name}
				html={feature.html}
				icon={ChevronRight}
				titleSuffix={getFeatureLevel(feature)}
				titleMeta={feature.source?.shortName}
				expanded={true}
				background={`color-mix(in srgb, ${accentColor} 40%, transparent)`}
				{accentColor}
				{onEntityLinkClick}
				{theme}
			/>
		{/if}
	{/each}
</article>

<style>
	.full-class {
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
				45deg,
				color-mix(in srgb, var(--full-class-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--full-class-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			var(--ds-full-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-class[data-theme="light"],
	.full-class[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-class[data-theme="light"] { color: #1f2937; }

	.class-header {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		width: 100%;
		min-width: 0;
	}

	.class-summary {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.class-header :global(.image-group),
	.class-header :global(.image-inputs) {
		flex: 0 0 128px;
		min-width: 0;
	}

	.progression-scroll {
		box-sizing: border-box;
		width: calc(100% + 4px);
		margin: -2px -2px -4px;
		padding: 2px 2px 4px;
		overflow-x: auto;
	}

	.progression-scroll :global(.dnd-table) {
		min-width: max(100%, calc(var(--full-class-table-columns) * 44px));
	}

	.full-class :global(.text-block),
	.full-class :global(.filled-text-block),
	.full-class :global(.rich-content) {
		align-self: stretch;
		width: 100%;
	}

	.full-class :global(.rich-content) { text-align: justify; }
	.full-class :global(.rich-content h1),
	.full-class :global(.rich-content h2),
	.full-class :global(.rich-content h3),
	.full-class :global(.rich-content h4),
	.full-class :global(.rich-content h5),
	.full-class :global(.rich-content h6) {
		margin: 12px 0 4px;
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
	}

	.full-class :global(.rich-content h1:first-child),
	.full-class :global(.rich-content h2:first-child),
	.full-class :global(.rich-content h3:first-child),
	.full-class :global(.rich-content h4:first-child),
	.full-class :global(.rich-content h5:first-child),
	.full-class :global(.rich-content h6:first-child) { margin-top: 0; }

	.full-class :global(.rich-content ul),
	.full-class :global(.rich-content ol) {
		margin: 0;
		padding-left: 18px;
	}

	.full-class :global(.rich-content li + li) { margin-top: 1px; }

	@media (max-width: 280px) {
		.class-header { flex-direction: column; }
		.class-header :global(.image-group),
		.class-header :global(.image-inputs) { flex-basis: auto; }
	}
</style>
