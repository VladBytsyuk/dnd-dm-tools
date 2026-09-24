<script lang="ts">
	import "./colors.css";
	import BicepsFlexed from "lucide-svelte/icons/biceps-flexed";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import Plus from "lucide-svelte/icons/plus";
	import Route from "lucide-svelte/icons/route";
	import SquareDashed from "lucide-svelte/icons/square-dashed";
	import ActionsBlock, { type ActionsBlockItem } from "./ActionsBlock.svelte";
	import type { ChipsListItem } from "./ChipsList.svelte";
	import EyeDashed from "./icons/EyeDashed.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import MaxItemHeader from "./MaxItemHeader.svelte";
	import Chip from "./Chip.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type {
		FullRaceEntityLink,
		FullRaceSpeed,
		FullRaceViewModel,
	} from "./FullRaceViewModel";

	const EyeDashedIcon = EyeDashed as unknown as typeof BicepsFlexed;

	type Props = {
		race: FullRaceViewModel;
		onCopyRace?: (race: FullRaceViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullRaceEntityLink) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		race = $bindable<FullRaceViewModel>(),
		onCopyRace,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	let accentColor = $derived(colorForTheme("var(--ds-race-sub)"));
	let gradientStart = $derived(colorForTheme("var(--ds-race-sub)"));
	let gradientEnd = $derived(colorForTheme("var(--ds-race)"));
	let surfaceColor = $derived(theme === "light" ? "rgb(255 255 255 / 78%)" : "rgb(48 48 48 / 40%)");
	let headerInfo = $derived(formatHeaderInfo(race.type.name, race.group?.name));
	let primaryChips = $derived.by<ChipsListItem[]>(() => createPrimaryChips(race));
	let subraceChips = $derived.by<ChipsListItem[]>(() => createSubraceChips(race));
	let skillBlocks = $derived.by<ActionsBlockItem[]>(() => race.skills.map((skill) => ({
		get title() { return skill.name; },
		set title(value: string | undefined) { skill.name = value ?? ""; },
		get html() { return skill.html; },
		set html(value: string | undefined) { skill.html = value ?? ""; },
	})));
	let hasDescription = $derived(Boolean(race.description.html.trim()));

	function colorForTheme(token: string): string {
		return theme === "light" ? `color-mix(in srgb, ${token} 22%, white)` : token;
	}

	function formatHeaderInfo(type: string, group: string | undefined): string {
		if (!group || group === type) return type;
		return type ? `${type} · ${group}` : group;
	}

	function updateHeaderInfo(value: string) {
		race.type.name = value;
	}

	function formatAbility(value: FullRaceViewModel["abilities"][number]): string {
		return `${value.name} ${value.value >= 0 ? "+" : ""}${value.value}`;
	}

	function formatSpeed(speed: FullRaceSpeed): string {
		const parts = [speed.name, speed.value === undefined ? undefined : `${speed.value} фт.`, speed.additional]
			.filter((part): part is string => Boolean(part));
		return parts.join(": ");
	}

	function formatDarkvision(): string {
		if (!race.darkvision) return "";
		if (race.darkvision.distance === undefined || race.darkvision.distance === "") return "Тёмное зрение";
		return `${race.darkvision.distance} ${race.darkvision.unit ?? "фт."}`;
	}

	function createPrimaryChips(value: FullRaceViewModel): ChipsListItem[] {
		const chips: ChipsListItem[] = value.abilities.map((ability) => ({
			text: formatAbility(ability),
			icon: BicepsFlexed,
			iconTooltip: "Характеристики",
			background: accentColor,
			onTextChange: (text) => updateAbility(ability, text),
		}));

		if (value.size || editable) {
			chips.push({
				text: value.size,
				icon: SquareDashed,
				iconTooltip: "Размер",
				background: accentColor,
				onTextChange: (text) => { value.size = text; },
			});
		}

		value.speed.forEach((speed) => chips.push({
			text: formatSpeed(speed),
			icon: Route,
			iconTooltip: "Скорость",
			background: accentColor,
			onTextChange: (text) => updateSpeed(speed, text),
		}));

		if (value.darkvision || editable) {
			chips.push({
				text: formatDarkvision(),
			icon: EyeDashedIcon,
				iconTooltip: "Тёмное зрение",
				background: accentColor,
				onTextChange: updateDarkvision,
			});
		}

		return chips;
	}

	function createSubraceChips(value: FullRaceViewModel): ChipsListItem[] {
		return (value.subraces ?? []).map((subrace) => ({
			text: subrace.russianName,
			href: subrace.entityLink,
			background: accentColor,
			onLinkClick: isRacePath(subrace.entityLink) && onEntityLinkClick ? onEntityLinkClick : undefined,
		}));
	}

	function isRacePath(href: string): boolean {
		return href.startsWith("/races/");
	}

	function updateAbility(ability: FullRaceViewModel["abilities"][number], text: string) {
		const match = /^(.*?)(?:\s+)([+-]?\d+)\s*$/u.exec(text);
		if (!match) {
			ability.name = text;
			return;
		}
		ability.name = match[1];
		ability.value = Number(match[2]);
	}

	function updateSpeed(speed: FullRaceSpeed, text: string) {
		const match = /^(.*?)(?:\s*:\s*)?(\d+)\s*фт\.?(?:\s*:\s*(.*))?$/u.exec(text.trim());
		if (!match) {
			speed.name = text;
			return;
		}
		speed.name = match[1].trim() || undefined;
		speed.value = Number(match[2]);
		speed.additional = match[3]?.trim() || undefined;
	}

	function updateDarkvision(text: string) {
		if (!race.darkvision) race.darkvision = {};
		const match = /^(\d+(?:[.,]\d+)?)\s*(.*)$/u.exec(text.trim());
		if (!match) {
			race.darkvision.distance = undefined;
			race.darkvision.unit = text.trim() || undefined;
			return;
		}
		race.darkvision.distance = match[1];
		race.darkvision.unit = match[2].trim() || "фт.";
	}
</script>

<article
	class="full-race"
	data-theme={theme}
	style={`--full-race-gradient-start: ${gradientStart}; --full-race-gradient-end: ${gradientEnd}; --full-race-accent: ${accentColor}; --full-race-surface: ${surfaceColor};`}
>
	<MaxItemHeader
		accentColor={accentColor}
		bind:russianName={race.russianName}
		bind:englishName={race.englishName}
		bind:entityLink={race.entityLink}
		info={headerInfo}
		bind:source={race.source}
		sourceSuffix={race.source.homebrew ? "*" : ""}
		wrapRussianName={true}
		chips={primaryChips}
		secondaryChips={subraceChips}
		images={race.image ? [race.image] : []}
		alt={race.russianName}
		onNameClick={onCopyRace ? () => onCopyRace(race) : undefined}
		onInfoChange={updateHeaderInfo}
		{editable}
		{theme}
	/>

	{#if race.skills.length > 0 || editable}
		<ActionsBlock
			blocks={skillBlocks}
			blocksExpanded={true}
			sectionExpanded={true}
			{accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}

	{#if hasDescription || editable}
		<TextBlock bind:html={race.description.html} expanded={true} {accentColor} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#each race.additionalSections ?? [] as section (section.title)}
		{#if section.html.trim() || editable}
			<FilledTextBlock
				bind:title={section.title}
				bind:html={section.html}
				icon={ChevronRight}
				expanded={false}
				background={`color-mix(in srgb, ${accentColor} 40%, transparent)`}
				{accentColor}
				{onEntityLinkClick}
				{editable}
				{theme}
			/>
		{/if}
	{/each}

	{#if editable}
		<div class="add-section-chip">
			<Chip icon={Plus} background={accentColor} {theme} />
		</div>
	{/if}
</article>

<style>
	.full-race {
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
				color-mix(in srgb, var(--full-race-gradient-start) 20%, transparent),
				color-mix(in srgb, var(--full-race-gradient-end) 20%, transparent)
			),
			var(--full-race-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-race[data-theme="light"],
	.full-race[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-race[data-theme="light"] { color: #1f2937; }

	.full-race :global(.text-block),
	.full-race :global(.filled-text-block),
	.full-race :global(.rich-content) {
		align-self: stretch;
		width: 100%;
	}

	.full-race :global(.rich-content) { text-align: justify; }
	.full-race :global(.rich-content h1),
	.full-race :global(.rich-content h2),
	.full-race :global(.rich-content h3),
	.full-race :global(.rich-content h4),
	.full-race :global(.rich-content h5),
	.full-race :global(.rich-content h6) {
		margin: 12px 0 4px;
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
	}

	.full-race :global(.rich-content h1:first-child),
	.full-race :global(.rich-content h2:first-child),
	.full-race :global(.rich-content h3:first-child),
	.full-race :global(.rich-content h4:first-child),
	.full-race :global(.rich-content h5:first-child),
	.full-race :global(.rich-content h6:first-child) { margin-top: 0; }

	.full-race :global(.rich-content ul),
	.full-race :global(.rich-content ol) {
		margin: 0;
		padding-left: 18px;
	}

	.full-race :global(.rich-content li + li) { margin-top: 1px; }

	.add-section-chip {
		width: 100%;
	}

	.add-section-chip :global(.chip) {
		width: 100%;
		justify-content: center;
	}
</style>
