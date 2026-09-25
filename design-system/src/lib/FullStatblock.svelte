<script lang="ts">
	import "./colors.css";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import BadgePlus from "lucide-svelte/icons/badge-plus";
	import BicepsFlexed from "lucide-svelte/icons/biceps-flexed";
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
	import Plus from "lucide-svelte/icons/plus";
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
		onImageRequested?: (image: string) => Promise<string>;
		theme?: "dark" | "light";
		editable?: boolean;
	};

	let {
		statblock = $bindable<FullStatblockViewModel>(),
		onCopyStatblock,
		onCopySpellLink,
		onImageRequested,
		theme = "dark",
		editable = false,
	}: Props = $props();

	const darkAccentColor = "var(--ds-bestiary-sub)";
	const darkPrimaryColor = "var(--ds-bestiary)";
	let accentColor = $derived(colorForTheme(darkAccentColor));
	let gradientStart = $derived(colorForTheme(getCreatureTypeToken(statblock.creatureType)));
	let gradientEnd = $derived(colorForTheme(darkPrimaryColor));
	let headerChips = $derived.by<ChipsListItem[]>(() => {
		const chips: ChipsListItem[] = [];

		if (statblock.armorClass !== undefined) chips.push({ text: String(statblock.armorClass), placeholder: "Класс доспеха", onTextChange: (value) => statblock.armorClass = value, icon: Shield, iconTooltip: "Класс доспеха" });
		if (statblock.hitPoints) chips.push({
			...(statblock.hitPointsFormula && !editable
				? { html: `${escapeHtml(statblock.hitPoints)} (<dice-roller label="Хиты" formula="${escapeHtmlAttribute(statblock.hitPointsFormula)}">${escapeHtml(statblock.hitPointsFormula)}</dice-roller>)` }
				: { text: `${statblock.hitPoints}${statblock.hitPointsFormula ? ` (${statblock.hitPointsFormula})` : ""}` }),
			placeholder: "Например, 18 (4к8+2)",
			onTextChange: (value) => {
				const match = value.match(/^\s*(.*?)\s*\((.*?)\)\s*$/u);
				statblock.hitPoints = match ? match[1] : value;
				statblock.hitPointsFormula = match?.[2] || undefined;
			},
			icon: Heart,
			iconTooltip: "Хиты",
		});
		if (statblock.speed) chips.push({ text: statblock.speed, placeholder: "Скорость", onTextChange: (value) => statblock.speed = value, icon: Route, iconTooltip: "Скорость" });
		if (statblock.size) chips.push({ text: statblock.size, placeholder: "Размер", onTextChange: (value) => statblock.size = value, icon: SquareDashed, iconTooltip: "Размер" });
		if (statblock.alignment) chips.push({ text: statblock.alignment, placeholder: "Мировоззрение", onTextChange: (value) => statblock.alignment = value, icon: Scale, iconTooltip: "Мировоззрение" });

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
			...(statblock.savingThrows ? [{ text: statblock.savingThrows, placeholder: "Спасброски", onTextChange: (value: string) => statblock.savingThrows = value, icon: ShieldCheck, iconTooltip: "Спасброски" }] : []),
			...(statblock.skills ? [{ ...(statblock.skillsHtml && !editable ? { html: statblock.skillsHtml } : { text: statblock.skills }), placeholder: "Навыки", onTextChange: (value: string) => { statblock.skills = value; statblock.skillsHtml = undefined; }, icon: BicepsFlexed, iconTooltip: "Навыки" }] : []),
			...(statblock.damageVulnerabilities ? [{ text: statblock.damageVulnerabilities, placeholder: "Уязвимости", onTextChange: (value: string) => statblock.damageVulnerabilities = value, icon: ShieldMinus, iconTooltip: "Уязвимости" }] : []),
			...(statblock.damageResistances ? [{ text: statblock.damageResistances, placeholder: "Сопротивления", onTextChange: (value: string) => statblock.damageResistances = value, icon: ShieldHalf, iconTooltip: "Сопротивления" }] : []),
			...(immunities ? [{ text: immunities, placeholder: "Иммунитеты; иммунитеты к состояниям", onTextChange: (value: string) => { const [damage, ...conditions] = value.split(";").map((part) => part.trim()); statblock.damageImmunities = damage || undefined; statblock.conditionImmunities = conditions.join("; ") || undefined; }, icon: ShieldX, iconTooltip: "Иммунитеты" }] : []),
			...(statblock.senses ? [{ text: statblock.senses, placeholder: "Чувства", onTextChange: (value: string) => statblock.senses = value, icon: Eye, iconTooltip: "Чувства" }] : []),
			...(statblock.languages ? [{ text: statblock.languages, placeholder: "Языки", onTextChange: (value: string) => statblock.languages = value, icon: Globe, iconTooltip: "Языки" }] : []),
			...(statblock.environment?.length ? [{ text: `Среда: ${statblock.environment.join(", ")}`, placeholder: "Среда обитания", onTextChange: (value: string) => setEnvironment(value.replace(/^Среда:\s*/iu, "")) }] : []),
			...(statblock.proficiencyBonus !== undefined ? [{ text: String(statblock.proficiencyBonus), placeholder: "Бонус мастерства", onTextChange: (value: string) => statblock.proficiencyBonus = value, icon: BadgePlus, iconTooltip: "Бонус мастерства" }] : []),
			{ text: challenge, placeholder: "Опасность (опыт)", onTextChange: (value: string) => { const match = value.match(/^\s*(.*?)\s*\((\d+)\s*опыта\)\s*$/iu); statblock.challengeRating = match?.[1] ?? value; statblock.experience = match?.[2]; }, icon: Skull, iconTooltip: "Опасность и опыт" },
		];

		return details.map((chip) => ({ ...chip, background: accentColor }));
	});
	let abilityValues = $derived.by(() => {
		const abilities = statblock.abilities ?? [];
		return [...abilities.map((ability) => ability.label), ...abilities.map((ability) => editable ? String(ability.score) : formatAbilityCell(ability))];
	});
	let lairBlocks = $derived(toLairBlocks(statblock.lair));

	function formatAbility(ability: NonNullable<FullStatblockViewModel["abilities"]>[number]): string {
		if (ability.modifier === undefined || ability.modifier === "") return String(ability.score);
		const modifier = String(ability.modifier);
		const signedModifier = /^[+−-]/.test(modifier) ? modifier.replace("-", "−") : `+${modifier}`;
		return `${ability.score} (${signedModifier})`;
	}

	function formatAbilityCell(ability: NonNullable<FullStatblockViewModel["abilities"]>[number]): { text: string; html: string } {
		if (ability.modifier === undefined || ability.modifier === "") {
			const text = String(ability.score);
			return { text, html: escapeHtml(text) };
		}

		const modifier = String(ability.modifier).replace("−", "-");
		const numericModifier = Number(modifier);
		if (!Number.isFinite(numericModifier)) {
			const text = formatAbility(ability);
			return { text, html: escapeHtml(text) };
		}

		const signedModifier = numericModifier < 0 ? `-${Math.abs(numericModifier)}` : `+${numericModifier}`;
		const visibleModifier = signedModifier.replace("-", "−");
		const text = `${ability.score} (${visibleModifier})`;
		const html = `${escapeHtml(String(ability.score))} (<dice-roller label="${escapeHtmlAttribute(ability.label)}" formula="к20 ${signedModifier}">${escapeHtml(visibleModifier)}</dice-roller>)`;
		return { text, html };
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
		return theme === "light" ? color.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : color;
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

	function setEnvironment(value: string): void {
		statblock.environment = value.split(",").map((part) => part.trim()).filter(Boolean);
	}

	function addTrait(): void {
		statblock.traits = [...(statblock.traits ?? []), { title: "", html: "" }];
	}

	function addTag(): void {
		statblock.tags = [...(statblock.tags ?? []), { title: "", html: "" }];
	}

	function updateAbilityScore(index: number, value: string): void {
		const abilityIndex = index - (statblock.abilities?.length ?? 0);
		if (abilityIndex < 0 || !statblock.abilities?.[abilityIndex]) return;
		const ability = statblock.abilities[abilityIndex];
		ability.score = value;
		const numericScore = Number(value);
		if (value.trim() && Number.isFinite(numericScore)) {
			ability.modifier = Math.floor((numericScore - 10) / 2);
		}
	}

	function escapeHtml(value: string): string {
		return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
	}

	function escapeHtmlAttribute(value: string): string {
		return escapeHtml(value).replace(/"/gu, "&quot;");
	}
</script>

<article
	class="full-statblock"
	data-theme={theme}
	style={`--statblock-gradient-start: ${gradientStart}; --statblock-gradient-end: ${gradientEnd}; --statblock-accent: ${accentColor};`}
>
	<MaxItemHeader
		accentColor={accentColor}
		bind:russianName={statblock.russianName}
		bind:englishName={statblock.englishName}
		bind:entityLink={statblock.entityLink}
		bind:badge={statblock.challengeRating}
		bind:info={statblock.creatureType}
		bind:source={statblock.source}
		chips={headerChips}
		bind:images={statblock.images}
		{onImageRequested}
		alt={statblock.imageAlt ?? statblock.russianName}
		editable={editable}
		{theme}
	/>
	{#if (statblock.abilities?.length ?? 0) > 0}
		<Table columns={statblock.abilities?.length} values={abilityValues} accentColor={accentColor} editable={editable} editableValuesOnly={true} onValueChange={updateAbilityScore} {theme} />
	{/if}

	{#if detailChips.length}
		<ChipsList chips={detailChips} editable={editable} {theme} />
	{/if}

	{#each statblock.traits ?? [] as trait, index (index)}
		<TextBlock bind:title={trait.title} bind:html={trait.html} {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/each}
	{#if editable}
		<div class="add-block-chip"><button type="button" aria-label="Добавить текстовый блок" onclick={addTrait}><Plus size={15} strokeWidth={1.5} /></button></div>
	{/if}

	{#if statblock.actions && (hasSection(statblock.actions) || editable)}
		<ActionsBlock
			bind:title={statblock.actions.title}
			bind:descriptionHtml={statblock.actions.descriptionHtml}
			bind:blocks={statblock.actions.items}
			blocksExpanded={true}
			{accentColor}
			onSpellLinkClick={onCopySpellLink}
			{editable}
			{theme}
		/>
	{/if}

	{#if statblock.bonusActions && (hasSection(statblock.bonusActions) || editable)}
		<ActionsBlock bind:title={statblock.bonusActions.title} bind:descriptionHtml={statblock.bonusActions.descriptionHtml} bind:blocks={statblock.bonusActions.items} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/if}

	{#if statblock.reactions && (hasSection(statblock.reactions) || editable)}
		<ActionsBlock bind:title={statblock.reactions.title} bind:descriptionHtml={statblock.reactions.descriptionHtml} bind:blocks={statblock.reactions.items} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/if}

	{#if statblock.legendaryActions && (hasSection(statblock.legendaryActions) || editable)}
		<ActionsBlock bind:title={statblock.legendaryActions.title} bind:descriptionHtml={statblock.legendaryActions.descriptionHtml} bind:blocks={statblock.legendaryActions.items} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/if}

	{#if statblock.mythicActions && (hasSection(statblock.mythicActions) || editable)}
		<ActionsBlock bind:title={statblock.mythicActions.title} bind:descriptionHtml={statblock.mythicActions.descriptionHtml} bind:blocks={statblock.mythicActions.items} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/if}

	{#if hasLair(statblock.lair)}
		<ActionsBlock title="Логово" descriptionHtml={statblock.lair.descriptionHtml} blocks={lairBlocks} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {theme} />
	{/if}

	{#if statblock.descriptionHtml || editable}
		<FilledTextBlock title="Описание" bind:html={statblock.descriptionHtml} icon={ChevronRight} expanded={false} background="color-mix(in srgb, var(--statblock-accent) 40%, transparent)" {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/if}

	{#each statblock.tags ?? [] as tag, index (index)}
		<FilledTextBlock bind:title={tag.title} bind:html={tag.html} icon={ChevronRight} expanded={false} background="color-mix(in srgb, var(--statblock-accent) 40%, transparent)" {accentColor} onSpellLinkClick={onCopySpellLink} {editable} {theme} />
	{/each}
	{#if editable}
		<div class="add-block-chip"><button type="button" aria-label="Добавить текстовый блок" onclick={addTag}><Plus size={15} strokeWidth={1.5} /></button></div>
	{/if}
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
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--statblock-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--statblock-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			var(--ds-full-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-statblock[data-theme="light"] { color: #1f2937; }
	.full-statblock :global(.max-item-header) { margin-bottom: 4px; }
	.add-block-chip { width: 100%; }
	.add-block-chip button { all: unset; box-sizing: border-box; display: grid; width: 100%; min-height: 20px; place-items: center; border-radius: 4px; background: color-mix(in srgb, var(--statblock-accent) 40%, transparent); color: inherit; cursor: pointer; }
	.add-block-chip button:hover { background: color-mix(in srgb, var(--statblock-accent) 55%, transparent); }
	.add-block-chip button:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
</style>
