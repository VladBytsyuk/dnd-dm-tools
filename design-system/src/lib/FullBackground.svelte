<script lang="ts">
	import "./colors.css";
	import BicepsFlexed from "lucide-svelte/icons/biceps-flexed";
	import Coins from "lucide-svelte/icons/coins";
	import Wrench from "lucide-svelte/icons/wrench";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type {
		FullBackgroundEntityLink,
		FullBackgroundViewModel,
	} from "./FullBackgroundViewModel";

	type Props = {
		background: FullBackgroundViewModel;
		onCopyBackground?: (background: FullBackgroundViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullBackgroundEntityLink) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		background = $bindable<FullBackgroundViewModel>(),
		onCopyBackground,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	const accentBackground = "var(--full-background-accent)";
	let accentColor = $derived(colorForTheme("var(--ds-background-sub)"));
	let gradientStart = $derived(colorForTheme("var(--ds-background-sub)"));
	let gradientEnd = $derived(colorForTheme("var(--ds-background)"));
	let surfaceColor = $derived(theme === "light" ? "rgb(255 255 255 / 78%)" : "rgb(48 48 48 / 40%)");
	let equipmentHtml = $derived(createEquipmentHtml(background.equipments));
	let hasAssociatedHtml = $derived(Boolean(background.associatedHtml?.html.trim()));
	let hasPersonalization = $derived(
		Boolean(background.personalization?.html.trim())
			&& !containsHtml(background.associatedHtml?.html ?? background.description.html, background.personalization?.html ?? ""),
	);
	let chips = $derived.by<ChipsListItem[]>(() => {
		const items: ChipsListItem[] = [];

		if (background.startGold > 0 || editable) {
			items.push({
				text: `${background.startGold} зм`,
				icon: Coins,
				iconTooltip: "Стартовое золото",
				background: accentBackground,
				onTextChange: updateStartGold,
			});
		}

		if (background.skills.length > 0 || editable) {
			items.push({
				text: background.skills.join(", "),
				icon: BicepsFlexed,
				iconTooltip: "Навыки",
				background: accentBackground,
				onTextChange: updateSkills,
			});
		}

		if (background.toolOwnership.html.trim() || editable) {
			items.push({
				html: background.toolOwnership.html,
				icon: Wrench,
				iconTooltip: "Инструменты",
				background: accentBackground,
				onHtmlChange: updateToolOwnership,
				onEntityLinkClick,
			});
		}

		return items;
	});

	function colorForTheme(token: string): string {
		return theme === "light" ? `color-mix(in srgb, ${token} 22%, white)` : token;
	}

	function createEquipmentHtml(items: FullBackgroundViewModel["equipments"]): string {
		return `<ul>${items.map((item) => `<li>${item.html}</li>`).join("")}</ul>`;
	}

	function normalizeHtml(value: string): string {
		return value
			.replace(/<[^>]*>/g, " ")
			.replace(/&nbsp;/giu, " ")
			.replace(/\s+/gu, " ")
			.trim()
			.toLocaleLowerCase("ru");
	}

	function containsHtml(container: string, value: string): boolean {
		const normalizedContainer = normalizeHtml(container);
		const normalizedValue = normalizeHtml(value);
		return normalizedValue.length > 0 && normalizedContainer.includes(normalizedValue);
	}

	function updateStartGold(value: string) {
		const amount = Number(value.replace(/\s*зм\.?\s*$/iu, "").replace(",", ".").trim());
		if (Number.isFinite(amount) && amount >= 0) background.startGold = amount;
	}

	function updateSkills(value: string) {
		background.skills = value
			.split(",")
			.map((skill) => skill.trim())
			.filter(Boolean);
	}

	function updateToolOwnership(html: string) {
		background.toolOwnership.html = html;
	}

	function updateEquipments(html: string) {
		const document = new DOMParser().parseFromString(html, "text/html");
		background.equipments = Array.from(document.querySelectorAll("li"), (item) => ({ html: item.innerHTML }));
	}
</script>

<article
	class="full-background"
	data-theme={theme}
	style={`--full-background-gradient-start: ${gradientStart}; --full-background-gradient-end: ${gradientEnd}; --full-background-accent: ${accentColor}; --full-background-surface: ${surfaceColor};`}
>
	<FullItemHeader
		bind:russianName={background.russianName}
		bind:englishName={background.englishName}
		bind:entityLink={background.entityLink}
		bind:source={background.source}
		sourceSuffix={background.homebrew || background.source.homebrew ? "*" : ""}
		wrapRussianName={true}
		onNameClick={onCopyBackground ? () => onCopyBackground(background) : undefined}
		{editable}
		{theme}
	/>

	{#if chips.length > 0}
		<ChipsList {chips} {editable} showAddButton={false} {theme} />
	{/if}

	{#if background.equipments.length > 0 || editable}
		<FilledTextBlock
			html={equipmentHtml}
			expanded={true}
			background={`color-mix(in srgb, ${accentColor} 40%, transparent)`}
			{accentColor}
			{onEntityLinkClick}
			onHtmlChange={updateEquipments}
			{editable}
			{theme}
		/>
	{/if}

	{#if hasAssociatedHtml}
		<TextBlock
			title="Описание"
			bind:html={background.associatedHtml!.html}
			expanded={true}
			{accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{:else}
		<TextBlock
			title="Описание"
			bind:html={background.description.html}
			expanded={true}
			{accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}

	{#if hasPersonalization}
		<TextBlock
			title="Персонализация"
			bind:html={background.personalization!.html}
			expanded={true}
			{accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}
</article>

<style>
	.full-background {
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
				color-mix(in srgb, var(--full-background-gradient-start) 20%, transparent),
				color-mix(in srgb, var(--full-background-gradient-end) 20%, transparent)
			),
			var(--full-background-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-background[data-theme="light"],
	.full-background[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-background[data-theme="light"] { color: #1f2937; }
	.full-background :global(.text-block),
	.full-background :global(.rich-content) {
		align-self: stretch;
		width: 100%;
	}
	.full-background :global(.rich-content) { text-align: justify; }
	.full-background :global(.rich-content h1),
	.full-background :global(.rich-content h2),
	.full-background :global(.rich-content h3),
	.full-background :global(.rich-content h4),
	.full-background :global(.rich-content h5),
	.full-background :global(.rich-content h6) {
		margin: 12px 0 4px;
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
	}
	.full-background :global(.rich-content h1:first-child),
	.full-background :global(.rich-content h2:first-child),
	.full-background :global(.rich-content h3:first-child),
	.full-background :global(.rich-content h4:first-child),
	.full-background :global(.rich-content h5:first-child),
	.full-background :global(.rich-content h6:first-child) { margin-top: 0; }
	.full-background :global(.rich-content ul),
	.full-background :global(.rich-content ol) {
		margin: 0;
		padding-left: 18px;
	}
	.full-background :global(.rich-content li + li) { margin-top: 1px; }
</style>
