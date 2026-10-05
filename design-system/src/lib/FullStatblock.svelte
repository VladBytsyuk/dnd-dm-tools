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
	import X from "lucide-svelte/icons/x";
	import Send from "lucide-svelte/icons/send";
	import { tick } from "svelte";
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

	type ActionSectionKey = "actions" | "bonusActions" | "reactions" | "legendaryActions" | "mythicActions";

	type Props = {
		statblock: FullStatblockViewModel;
		onCopyStatblock: (statblock: FullStatblockViewModel) => void | Promise<void>;
		onCopyText?: (text: string) => void;
		onCopySpellLink: (link: FullStatblockSpellLink) => void | Promise<void>;
		onPasteAction?: (section: ActionSectionKey) => void | Promise<void>;
		onEntityLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		onImageRequested?: (image: string) => Promise<string>;
		onSendImageToOwlbear?: (source: string, name: string) => Promise<void>;
		theme?: "dark" | "light";
		editable?: boolean;
	};

	let {
		statblock = $bindable<FullStatblockViewModel>(),
		onCopyStatblock,
		onCopyText,
		onCopySpellLink,
		onPasteAction,
		onEntityLinkClick,
		onImageRequested,
		onSendImageToOwlbear,
		theme = "dark",
		editable = false,
	}: Props = $props();
	let expandedImage = $state<{ url: string; source: string } | null>(null);
	let expandTrigger: HTMLElement | null = null;
	let closeImageButton = $state<HTMLButtonElement | null>(null);
	let sendImageButton = $state<HTMLButtonElement | null>(null);
	let sendingImage = $state(false);

	async function openExpandedImage(url: string, source: string) {
		expandTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		expandedImage = { url, source };
		await tick();
		closeImageButton?.focus();
	}

	async function sendExpandedImage() {
		if (!expandedImage || !onSendImageToOwlbear || sendingImage) return;
		sendingImage = true;
		try {
			await onSendImageToOwlbear(expandedImage.source, statblock.russianName);
		} finally {
			sendingImage = false;
		}
	}

	async function closeExpandedImage() {
		expandedImage = null;
		await tick();
		expandTrigger?.focus();
		expandTrigger = null;
	}

	function handleExpandedImageKeydown(event: KeyboardEvent) {
		if (!expandedImage) return;
		if (event.key === "Tab") {
			event.preventDefault();
			if (document.activeElement === closeImageButton && !sendingImage && sendImageButton) sendImageButton.focus();
			else closeImageButton?.focus();
		} else if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			void closeExpandedImage();
		}
	}

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
			...(statblock.savingThrows || editable ? [{ ...(statblock.savingThrowsHtml && !editable ? { html: statblock.savingThrowsHtml } : { text: statblock.savingThrows ?? "" }), placeholder: "Спасброски", onTextChange: (value: string) => { statblock.savingThrows = value; statblock.savingThrowsHtml = undefined; }, icon: ShieldCheck, iconTooltip: "Спасброски" }] : []),
			...(statblock.skills || editable ? [{ ...(statblock.skillsHtml && !editable ? { html: statblock.skillsHtml } : { text: statblock.skills ?? "" }), placeholder: "Навыки", onTextChange: (value: string) => { statblock.skills = value; statblock.skillsHtml = undefined; }, icon: BicepsFlexed, iconTooltip: "Навыки" }] : []),
			...(statblock.damageVulnerabilities || editable ? [{ text: statblock.damageVulnerabilities ?? "", placeholder: "Уязвимости", onTextChange: (value: string) => statblock.damageVulnerabilities = value, icon: ShieldMinus, iconTooltip: "Уязвимости" }] : []),
			...(statblock.damageResistances || editable ? [{ text: statblock.damageResistances ?? "", placeholder: "Сопротивления", onTextChange: (value: string) => statblock.damageResistances = value, icon: ShieldHalf, iconTooltip: "Сопротивления" }] : []),
			...(immunities || editable ? [{ text: editable ? `${statblock.damageImmunities ?? ""}; ${statblock.conditionImmunities ?? ""}` : immunities, placeholder: "Иммунитеты; иммунитеты к состояниям", onTextChange: (value: string) => { const [damage, ...conditions] = value.split(";").map((part) => part.trim()); statblock.damageImmunities = damage || undefined; statblock.conditionImmunities = conditions.join("; ") || undefined; }, icon: ShieldX, iconTooltip: "Иммунитеты" }] : []),
			...(statblock.senses || editable ? [{ text: statblock.senses ?? "", placeholder: "Чувства", onTextChange: (value: string) => statblock.senses = value, icon: Eye, iconTooltip: "Чувства" }] : []),
			...(statblock.languages || editable ? [{ text: statblock.languages ?? "", placeholder: "Языки", onTextChange: (value: string) => statblock.languages = value, icon: Globe, iconTooltip: "Языки" }] : []),
			...(statblock.environment?.length || editable ? [{ text: editable ? statblock.environment?.join(", ") ?? "" : `Среда: ${statblock.environment?.join(", ") ?? ""}`, placeholder: "Среда обитания", onTextChange: (value: string) => setEnvironment(value.replace(/^Среда:\s*/iu, "")) }] : []),
			...(statblock.proficiencyBonus !== undefined || editable ? [{ text: String(statblock.proficiencyBonus ?? ""), placeholder: "Бонус мастерства", onTextChange: (value: string) => statblock.proficiencyBonus = value, icon: BadgePlus, iconTooltip: "Бонус мастерства" }] : []),
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
		return section.items.map((item) => ({ title: item.title, html: item.html, entityUrl: item.entityUrl }));
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

<svelte:window onkeydown={handleExpandedImageKeydown} />

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
		onCopy={onCopyText}
		chips={headerChips}
		bind:images={statblock.images}
		{onImageRequested}
		onExpandImage={(url, source) => { void openExpandedImage(url, source); }}
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
		<TextBlock bind:title={trait.title} bind:html={trait.html} {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/each}
	{#if editable}
		<div class="add-block-chip"><button type="button" aria-label="Добавить текстовый блок" onclick={addTrait}><Plus size={15} strokeWidth={1.5} /></button></div>
	{/if}

	{#if statblock.actions && (hasSection(statblock.actions) || editable)}
		<ActionsBlock
			bind:title={statblock.actions.title}
			bind:descriptionHtml={statblock.actions.descriptionHtml}
			bind:blocks={statblock.actions.items}
			onPasteBlock={onPasteAction ? () => onPasteAction("actions") : undefined}
			blocksExpanded={true}
			{accentColor}
			onSpellLinkClick={onCopySpellLink}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}

	{#if statblock.bonusActions && (hasSection(statblock.bonusActions) || editable)}
		<ActionsBlock bind:title={statblock.bonusActions.title} bind:descriptionHtml={statblock.bonusActions.descriptionHtml} bind:blocks={statblock.bonusActions.items} onPasteBlock={onPasteAction ? () => onPasteAction("bonusActions") : undefined} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#if statblock.reactions && (hasSection(statblock.reactions) || editable)}
		<ActionsBlock bind:title={statblock.reactions.title} bind:descriptionHtml={statblock.reactions.descriptionHtml} bind:blocks={statblock.reactions.items} onPasteBlock={onPasteAction ? () => onPasteAction("reactions") : undefined} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#if statblock.legendaryActions && (hasSection(statblock.legendaryActions) || editable)}
		<ActionsBlock bind:title={statblock.legendaryActions.title} bind:descriptionHtml={statblock.legendaryActions.descriptionHtml} bind:blocks={statblock.legendaryActions.items} onPasteBlock={onPasteAction ? () => onPasteAction("legendaryActions") : undefined} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#if statblock.mythicActions && (hasSection(statblock.mythicActions) || editable)}
		<ActionsBlock bind:title={statblock.mythicActions.title} bind:descriptionHtml={statblock.mythicActions.descriptionHtml} bind:blocks={statblock.mythicActions.items} onPasteBlock={onPasteAction ? () => onPasteAction("mythicActions") : undefined} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#if hasLair(statblock.lair)}
		<ActionsBlock title="Логово" descriptionHtml={statblock.lair.descriptionHtml} blocks={lairBlocks} blocksExpanded={false} {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {theme} />
	{/if}

	{#if statblock.descriptionHtml || editable}
		<FilledTextBlock title="Описание" bind:html={statblock.descriptionHtml} icon={ChevronRight} expanded={false} background="color-mix(in srgb, var(--statblock-accent) 40%, transparent)" {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/if}

	{#each statblock.tags ?? [] as tag, index (index)}
		<FilledTextBlock bind:title={tag.title} bind:html={tag.html} icon={ChevronRight} expanded={false} background="color-mix(in srgb, var(--statblock-accent) 40%, transparent)" {accentColor} onSpellLinkClick={onCopySpellLink} {onEntityLinkClick} {editable} {theme} />
	{/each}
	{#if editable}
		<div class="add-block-chip"><button type="button" aria-label="Добавить текстовый блок" onclick={addTag}><Plus size={15} strokeWidth={1.5} /></button></div>
	{/if}
	{#if expandedImage}
		<div class="image-overlay" role="dialog" aria-modal="true" aria-label="Просмотр изображения">
			<div class="image-overlay-viewer">
				<button bind:this={closeImageButton} class="close-image-button" type="button" aria-label="Закрыть изображение" onclick={() => { void closeExpandedImage(); }}>
					<X size={22} strokeWidth={1.5} aria-hidden={true} />
				</button>
				{#if onSendImageToOwlbear}
					<button bind:this={sendImageButton} class="send-image-button" type="button" aria-label="Отправить в Owlbear" title="Отправить в Owlbear" disabled={sendingImage} onclick={() => { void sendExpandedImage(); }}>
						<Send size={20} strokeWidth={1.5} aria-hidden={true} />
					</button>
				{/if}
				<img class="expanded-image" src={expandedImage.url} alt={statblock.imageAlt ?? statblock.russianName} />
			</div>
		</div>
	{/if}
</article>

<style>
	.full-statblock {
		box-sizing: border-box;
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		min-width: 0;
		border-radius: var(--dnd-ui-radius-lg, 8px);
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
	.image-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
		background: rgb(0 0 0 / 84%);
	}
	.image-overlay-viewer {
		box-sizing: border-box;
		position: sticky;
		top: 0;
		display: grid;
		place-items: center;
		width: 100%;
		height: min(100dvh, 100%);
		padding: 48px 12px 12px;
	}
	.expanded-image {
		width: 100%;
		height: 100%;
		min-height: 0;
		object-fit: contain;
	}
	.close-image-button, .send-image-button {
		position: absolute;
		top: 8px;
		display: grid;
		width: 32px;
		height: 32px;
		place-items: center;
		padding: 0;
		border: 1px solid #fff;
		border-radius: 4px;
		background: rgb(0 0 0 / 45%);
		color: #fff;
		cursor: pointer;
	}
	.close-image-button { left: 8px; }
	.send-image-button { right: 8px; }
	.close-image-button:hover, .close-image-button:focus-visible, .send-image-button:hover, .send-image-button:focus-visible { background: rgb(0 0 0 / 70%); }
	.close-image-button:focus-visible, .send-image-button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
	.send-image-button:disabled { opacity: 0.5; cursor: wait; }
	.full-statblock :global(.max-item-header) { margin-bottom: 4px; }
	.add-block-chip { width: 100%; }
	.add-block-chip button { all: unset; box-sizing: border-box; display: grid; width: 100%; min-height: 20px; place-items: center; border-radius: 4px; background: color-mix(in srgb, var(--statblock-accent) 40%, transparent); color: inherit; cursor: pointer; }
	.add-block-chip button:hover { background: color-mix(in srgb, var(--statblock-accent) 55%, transparent); }
	.add-block-chip button:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
</style>
