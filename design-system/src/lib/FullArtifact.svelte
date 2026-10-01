<script lang="ts">
	import "./colors.css";
	import Coins from "lucide-svelte/icons/coins";
	import UserCog from "lucide-svelte/icons/user-cog";
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FullItemHeader from "./FullItemHeader.svelte";
	import ImageGroup from "./ImageGroup.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type { FullArtifactEntityLink, FullArtifactViewModel } from "./FullArtifactViewModel";

	type Props = {
		artifact: FullArtifactViewModel;
		onCopyArtifact?: (artifact: FullArtifactViewModel) => void | Promise<void>;
		onCopyText?: (text: string) => void;
		onEntityLinkClick?: (link: FullArtifactEntityLink) => void | Promise<void>;
		onImageRequested?: (image: string) => Promise<string>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		artifact = $bindable<FullArtifactViewModel>(),
		onCopyArtifact,
		onCopyText,
		onEntityLinkClick,
		onImageRequested,
		editable = false,
		theme = "dark",
	}: Props = $props();

	const accentBackground = "var(--full-artifact-accent)";
	let accentColor = $derived(colorForTheme("var(--ds-artifacts-sub)"));
	let gradientStart = $derived(colorForTheme(getRarityToken(artifact.rarity.type)));
	let gradientEnd = $derived(colorForTheme("var(--ds-artifacts)"));
	let hasImages = $derived(Boolean(artifact.images?.length));
	let isHomebrew = $derived(Boolean(artifact.homebrew || artifact.source.homebrew));
	let xgeCostHtml = $derived(artifact.cost?.xge ? formatXgeCostHtml(artifact.cost.xge) : undefined);
	let chips = $derived.by<ChipsListItem[]>(() => {
		const items: ChipsListItem[] = [];

		if (artifact.customization || editable) {
			items.push({
				icon: UserCog,
				iconTooltip: "Требуется настройка",
				toggle: true,
				active: Boolean(artifact.customization),
				onToggle: () => artifact.customization = !artifact.customization,
				background: accentBackground,
			});
		}

		if (artifact.cost?.dmg || editable) {
			items.push({
				text: `DMG: ${artifact.cost?.dmg ?? ""}`,
				icon: Coins,
				iconTooltip: "Стоимость по Руководству мастера",
				background: accentBackground,
				onTextChange: (cost) => updateCost("dmg", cost),
			});
		}

		if (artifact.cost?.xge || editable) {
			items.push({
				text: `XGE: ${artifact.cost?.xge ?? ""}`,
				html: xgeCostHtml,
				icon: Coins,
				iconTooltip: "Стоимость по Руководству Занатара обо всём",
				background: accentBackground,
				onTextChange: (cost) => updateCost("xge", cost),
			});
		}

		return items;
	});

	function colorForTheme(token: string): string {
		return theme === "light" ? token.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : token;
	}

	function getRarityToken(rarity: string): string {
		switch (rarity.toLocaleLowerCase("ru")) {
			case "common": return "var(--ds-artifact-regular)";
			case "uncommon": return "var(--ds-artifact-uncommon)";
			case "rare": return "var(--ds-artifact-rare)";
			case "very-rare": return "var(--ds-artifact-very-rare)";
			case "legendary": return "var(--ds-artifact-legendary)";
			case "artifact": return "var(--ds-artifact-artifact)";
			default: return "var(--ds-artifacts)";
		}
	}

	function updateCost(key: keyof NonNullable<FullArtifactViewModel["cost"]>, value: string) {
		artifact.cost ??= { dmg: "", xge: "" };
		const prefix = key.toUpperCase() + ": ";
		artifact.cost[key] = value.startsWith(prefix) ? value.slice(prefix.length) : value;
	}

	function formatXgeCostHtml(value: string): string | undefined {
		const formula = value.trim();
		if (!/(?:\d+\s*)?[кd]\s*\d+/iu.test(formula)) return undefined;
		const escapedFormula = escapeHtml(formula);
		const dividedFormula = formula.match(/^\(\s*\(\s*(.*?)\s*\)\s*\*\s*(\d+(?:\.\d+)?)\s*\)\s*\/\s*(\d+(?:\.\d+)?)$/u);
		if (dividedFormula) {
			const baseFormula = escapeHtml(dividedFormula[1]);
			const multiplier = Number(dividedFormula[2]) / Number(dividedFormula[3]);
			return `XGE: <dice-roller label="Стоимость XGE" formula="${baseFormula}" multiplier="${multiplier}">${escapedFormula}</dice-roller>`;
		}
		const multipliedFormula = formula.match(/^\(\s*(.*?)\s*\)\s*\*\s*(\d+)$/u);
		if (multipliedFormula) {
			const baseFormula = escapeHtml(multipliedFormula[1]);
			return `XGE: <dice-roller label="Стоимость XGE" formula="${baseFormula}" multiplier="${multipliedFormula[2]}">${escapedFormula}</dice-roller>`;
		}
		const plainMultipliedFormula = formula.match(/^\s*(.*?)\s*\*\s*(\d+(?:\.\d+)?)\s*$/u);
		if (plainMultipliedFormula) {
			const baseFormula = escapeHtml(plainMultipliedFormula[1]);
			return `XGE: <dice-roller label="Стоимость XGE" formula="${baseFormula}" multiplier="${plainMultipliedFormula[2]}">${escapedFormula}</dice-roller>`;
		}
		return `XGE: <dice-roller label="Стоимость XGE" formula="${escapedFormula}">${escapedFormula}</dice-roller>`;
	}

	function escapeHtml(value: string): string {
		return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#39;");
	}
</script>

<article
	class="full-artifact"
	data-theme={theme}
	style={`--full-artifact-gradient-start: ${gradientStart}; --full-artifact-gradient-end: ${gradientEnd}; --full-artifact-accent: ${accentColor};`}
>
	<div class="artifact-header">
		<div class="artifact-summary">
			<FullItemHeader
				bind:russianName={artifact.russianName}
				bind:englishName={artifact.englishName}
				bind:entityLink={artifact.entityLink}
				bind:info={artifact.rarity.name}
				bind:source={artifact.source}
				onCopy={onCopyText}
				sourceSuffix={isHomebrew ? "*" : ""}
				wrapRussianName={true}
				{editable}
				{theme}
			/>

			{#if chips.length > 0}
				<ChipsList {chips} {editable} showAddButton={false} {theme} />
			{/if}
		</div>

		{#if hasImages || editable}
			<ImageGroup bind:images={artifact.images} alt={artifact.russianName} size={128} {onImageRequested} {editable} {theme} />
		{/if}
	</div>

	<TextBlock
		bind:html={artifact.description.html}
		expanded={true}
		accentColor={accentColor}
		{onEntityLinkClick}
		{editable}
		{theme}
	/>
</article>

<style>
	.full-artifact {
		--ds-color-strength: 100%;

		box-sizing: border-box;
		container-type: inline-size;
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
				color-mix(in srgb, var(--full-artifact-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--full-artifact-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			var(--ds-full-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-artifact[data-theme="light"],
	.full-artifact[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-artifact[data-theme="light"] { color: #1f2937; }

	.artifact-header {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		width: 100%;
		min-width: 0;
	}

	.artifact-summary {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.artifact-header :global(.image-group),
	.artifact-header :global(.image-inputs) {
		flex: 0 0 128px;
		min-width: 0;
	}

	.full-artifact :global(.text-block),
	.full-artifact :global(.rich-content) {
		align-self: stretch;
		width: 100%;
	}

	.full-artifact :global(.rich-content) { text-align: justify; }

	@container (max-width: 280px) {
		.artifact-header { flex-direction: column; }
		.artifact-header :global(.image-group),
		.artifact-header :global(.image-inputs) { flex-basis: auto; }
	}
</style>
