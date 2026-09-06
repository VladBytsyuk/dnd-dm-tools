<script lang="ts">
	import "./colors.css";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import BadgePlus from "lucide-svelte/icons/badge-plus";
	import Eye from "lucide-svelte/icons/eye";
	import Globe from "lucide-svelte/icons/globe";
	import Heart from "lucide-svelte/icons/heart";
	import Scale from "lucide-svelte/icons/scale";
	import Route from "lucide-svelte/icons/route";
	import Shield from "lucide-svelte/icons/shield";
	import ShieldCheck from "lucide-svelte/icons/shield-check";
	import ShieldHalf from "lucide-svelte/icons/shield-half";
	import ShieldMinus from "lucide-svelte/icons/shield-minus";
	import ShieldX from "lucide-svelte/icons/shield-x";
	import Skull from "lucide-svelte/icons/skull";
	import SquareDashed from "lucide-svelte/icons/square-dashed";
	import ActionsBlock, { type ActionsBlockItem } from "./ActionsBlock.svelte";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import MaxItemHeader from "./MaxItemHeader.svelte";
	import Table from "./Table.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type {
		FullStatblockActionSection,
		FullStatblockLair,
		FullStatblockSpellLink,
		FullStatblockViewModel,
	} from "./FullStatblockViewModel";

	type Props = {
		statblock: FullStatblockViewModel;
		onCopyStatblock: (statblock: FullStatblockViewModel) => void | Promise<void>;
		onCopySpellLink: (link: FullStatblockSpellLink) => void | Promise<void>;
		theme?: "dark" | "light";
	};

	let {
		statblock,
		onCopyStatblock,
		onCopySpellLink,
		theme = "dark",
	}: Props = $props();

	const darkAccentColor = "var(--ds-bestiary-sub)";
	const darkPrimaryColor = "var(--ds-bestiary)";
	let accentColor = $derived(colorForTheme(darkAccentColor));
	let gradientStart = $derived(colorForTheme(getCreatureTypeToken(statblock.creatureType)));
	let gradientEnd = $derived(colorForTheme(darkPrimaryColor));
	let headerChips = $derived.by<ChipsListItem[]>(() => {
		const chips: ChipsListItem[] = [];

		if (statblock.armorClass !== undefined) chips.push({ text: String(statblock.armorClass), icon: Shield, iconTooltip: "Класс доспеха" });
		if (statblock.hitPoints) chips.push({ text: statblock.hitPoints, icon: Heart, iconTooltip: "Хиты" });
		if (statblock.speed) chips.push({ text: statblock.speed, icon: Route, iconTooltip: "Скорость" });
		if (statblock.size) chips.push({ text: statblock.size, icon: SquareDashed, iconTooltip: "Размер" });
		if (statblock.alignment) chips.push({ text: statblock.alignment, icon: Scale, iconTooltip: "Мировоззрение" });

		return chips.map((chip) => ({ ...chip, background: accentColor }));
	});
	let detailChips = $derived.by<ChipsListItem[]>(() => {
		const immunities = [statblock.damageImmunities, statblock.conditionImmunities]
			.filter((value): value is string => Boolean(value))
			.join("; ");
		const challenge = statblock.experience === undefined
			? String(statblock.challengeRating)
			: `${statblock.challengeRating} (${statblock.experience} опыта)`;
		const details: ChipsListItem[] = [
			...(statblock.savingThrows ? [{ text: statblock.savingThrows, icon: ShieldCheck, iconTooltip: "Спасброски" }] : []),
			...(statblock.skills ? [{ text: `Навыки: ${statblock.skills}` }] : []),
			...(statblock.damageVulnerabilities ? [{ text: statblock.damageVulnerabilities, icon: ShieldMinus, iconTooltip: "Уязвимости" }] : []),
			...(statblock.damageResistances ? [{ text: statblock.damageResistances, icon: ShieldHalf, iconTooltip: "Сопротивления" }] : []),
			...(immunities ? [{ text: immunities, icon: ShieldX, iconTooltip: "Иммунитеты" }] : []),
			...(statblock.senses ? [{ text: statblock.senses, icon: Eye, iconTooltip: "Чувства" }] : []),
			...(statblock.languages ? [{ text: statblock.languages, icon: Globe, iconTooltip: "Языки" }] : []),
			...(statblock.environment?.length ? [{ text: `Среда: ${statblock.environment.join(", ")}` }] : []),
			...(statblock.proficiencyBonus !== undefined ? [{ text: String(statblock.proficiencyBonus), icon: BadgePlus, iconTooltip: "Бонус мастерства" }] : []),
			{ text: challenge, icon: Skull, iconTooltip: "Опасность и опыт" },
		];

		return details.map((chip) => ({ ...chip, background: accentColor }));
	});
	let abilityValues = $derived.by(() => {
		const abilities = statblock.abilities ?? [];
		return [...abilities.map((ability) => ability.label), ...abilities.map(formatAbility)];
	});
	let lairBlocks = $derived(toLairBlocks(statblock.lair));

	function formatAbility(ability: NonNullable<FullStatblockViewModel["abilities"]>[number]): string {
		if (ability.modifier === undefined || ability.modifier === "") return String(ability.score);
		const modifier = String(ability.modifier);
		const signedModifier = /^[+−-]/.test(modifier) ? modifier.replace("-", "−") : `+${modifier}`;
		return `${ability.score} (${signedModifier})`;
	}

	function getCreatureTypeToken(creatureType: string): string {
		const type = creatureType.toLocaleLowerCase("ru");

		if (type.includes("гуманоид")) return "var(--ds-bestiary-humanoid)";
		if (type.includes("элементал") || type.includes("фей") || type.includes("аберрац")) return "var(--ds-bestiary-magical)";
		if (type.includes("небес")) return "var(--ds-bestiary-celestial)";
		if (type.includes("исчади")) return "var(--ds-bestiary-infernal)";
		if (type.includes("нежит")) return "var(--ds-bestiary-undead)";
		if (type.includes("дракон")) return "var(--ds-bestiary-dragon)";
		if (type.includes("слиз") || type.includes("аморф")) return "var(--ds-bestiary-slime)";

		return darkAccentColor;
	}

	function colorForTheme(color: string): string {
		return theme === "light" ? `color-mix(in srgb, ${color} 22%, white)` : color;
	}

	function toActionBlocks(section: FullStatblockActionSection): ActionsBlockItem[] {
		return section.items.map((item) => ({ title: item.title, html: item.html }));
	}

	function toLairBlocks(lair: FullStatblockLair | undefined): ActionsBlockItem[] {
		if (!lair) return [];
		return [
			...(lair.actionsHtml ? [{ title: "Действия логова", html: lair.actionsHtml }] : []),
			...(lair.regionalEffectsHtml ? [{ title: "Региональные эффекты", html: lair.regionalEffectsHtml }] : []),
		];
	}

	function hasSection(section: FullStatblockActionSection | undefined): section is FullStatblockActionSection {
		return Boolean(section && (section.descriptionHtml || section.items.length));
	}

	function hasLair(lair: FullStatblockLair | undefined): lair is FullStatblockLair {
		return Boolean(lair && (lair.descriptionHtml || lair.actionsHtml || lair.regionalEffectsHtml));
	}
</script>

<article
	class="full-statblock"
	data-theme={theme}
	style={`--statblock-gradient-start: ${gradientStart}; --statblock-gradient-end: ${gradientEnd}; --statblock-accent: ${accentColor};`}
>
	<MaxItemHeader
		accentColor={accentColor}
		russianName={statblock.russianName}
		englishName={statblock.englishName}
		entityLink={statblock.entityLink}
		info={statblock.creatureType}
		source={statblock.source}
		chips={headerChips}
		images={statblock.images}
		alt={statblock.imageAlt ?? statblock.russianName}
		onNameClick={() => onCopyStatblock(statblock)}
		{theme}
	/>

	{#if (statblock.abilities?.length ?? 0) > 0}
		<Table columns={statblock.abilities?.length} values={abilityValues} accentColor={accentColor} {theme} />
	{/if}

	{#if detailChips.length}
		<ChipsList chips={detailChips} {theme} />
	{/if}

	{#each statblock.traits ?? [] as trait (trait.title)}
		<TextBlock title={trait.title} html={trait.html} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/each}

	{#if hasSection(statblock.actions)}
		<ActionsBlock
			title={statblock.actions.title}
			descriptionHtml={statblock.actions.descriptionHtml}
			blocks={toActionBlocks(statblock.actions)}
			blocksExpanded={true}
			{accentColor}
			onSpellLinkClick={onCopySpellLink}
			{theme}
		/>
	{/if}

	{#if hasSection(statblock.bonusActions)}
		<ActionsBlock title={statblock.bonusActions.title} descriptionHtml={statblock.bonusActions.descriptionHtml} blocks={toActionBlocks(statblock.bonusActions)} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#if hasSection(statblock.reactions)}
		<ActionsBlock title={statblock.reactions.title} descriptionHtml={statblock.reactions.descriptionHtml} blocks={toActionBlocks(statblock.reactions)} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#if hasSection(statblock.legendaryActions)}
		<ActionsBlock title={statblock.legendaryActions.title} descriptionHtml={statblock.legendaryActions.descriptionHtml} blocks={toActionBlocks(statblock.legendaryActions)} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#if hasSection(statblock.mythicActions)}
		<ActionsBlock title={statblock.mythicActions.title} descriptionHtml={statblock.mythicActions.descriptionHtml} blocks={toActionBlocks(statblock.mythicActions)} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#if hasLair(statblock.lair)}
		<ActionsBlock title="Логово" descriptionHtml={statblock.lair.descriptionHtml} blocks={lairBlocks} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#if statblock.descriptionHtml}
		<FilledTextBlock title="Описание" html={statblock.descriptionHtml} icon={ChevronRight} expanded={false} background="color-mix(in srgb, var(--statblock-accent) 40%, transparent)" {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#each statblock.tags ?? [] as tag (tag.title)}
		<FilledTextBlock title={tag.title} html={tag.html} icon={ChevronRight} expanded={false} background="color-mix(in srgb, var(--statblock-accent) 40%, transparent)" {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/each}
</article>

<style>
	.full-statblock {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		min-width: 0;
		padding: 8px;
		background: linear-gradient(180deg, var(--statblock-gradient-start), var(--statblock-gradient-end));
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-statblock[data-theme="light"] { color: #1f2937; }
	.full-statblock :global(.max-item-header) { margin-bottom: 4px; }
</style>
