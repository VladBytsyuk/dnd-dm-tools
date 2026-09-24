<script lang="ts">
	import "./colors.css";
	import FullItemHeader from "./FullItemHeader.svelte";
	import TextBlock from "./TextBlock.svelte";
	import type { FullFeatEntityLink, FullFeatViewModel } from "./FullFeatViewModel";

	type Props = {
		feat: FullFeatViewModel;
		onCopyFeat?: (feat: FullFeatViewModel) => void | Promise<void>;
		onEntityLinkClick?: (link: FullFeatEntityLink) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		feat = $bindable<FullFeatViewModel>(),
		onCopyFeat,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	let accentColor = $derived(colorForTheme("var(--ds-feat-sub)"));
	let gradientStart = $derived(colorForTheme("var(--ds-feat-sub)"));
	let gradientEnd = $derived(colorForTheme("var(--ds-feat)"));
	let headerInfo = $derived(editable || hasRequirements(feat.requirements) ? feat.requirements : undefined);
	let isHomebrew = $derived(Boolean(feat.homebrew || feat.source.homebrew));

	function colorForTheme(token: string): string {
		return theme === "light" ? token.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)") : token;
	}

	function hasRequirements(requirements: string): boolean {
		const normalizedRequirements = requirements.trim().toLocaleLowerCase("ru");
		return normalizedRequirements.length > 0 && normalizedRequirements !== "нет";
	}

	function updateRequirements(value: string) {
		feat.requirements = value;
	}
</script>

<article
	class="full-feat"
	data-theme={theme}
	style={`--full-feat-gradient-start: ${gradientStart}; --full-feat-gradient-end: ${gradientEnd}; --full-feat-accent: ${accentColor};`}
>
	<FullItemHeader
		bind:russianName={feat.russianName}
		bind:englishName={feat.englishName}
		bind:entityLink={feat.entityLink}
		info={headerInfo}
		bind:source={feat.source}
		sourceSuffix={isHomebrew ? "*" : ""}
		wrapRussianName={true}
		onInfoChange={updateRequirements}
		onNameClick={onCopyFeat ? () => onCopyFeat(feat) : undefined}
		{editable}
		{theme}
	/>

	{#if feat.description.html || editable}
		<TextBlock
			bind:html={feat.description.html}
			expanded={true}
			accentColor={accentColor}
			{onEntityLinkClick}
			{editable}
			{theme}
		/>
	{/if}
</article>

<style>
	.full-feat {
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
				color-mix(in srgb, var(--full-feat-gradient-start) var(--ds-gradient-strength, 20%), transparent),
				color-mix(in srgb, var(--full-feat-gradient-end) var(--ds-gradient-strength, 20%), transparent)
			),
			var(--ds-full-surface);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.full-feat[data-theme="light"],
	.full-feat[data-theme="light"] :global([data-theme="light"]) {
		--ds-color-strength: 100%;
	}

	.full-feat[data-theme="light"] { color: #1f2937; }

	.full-feat :global(.text-block),
	.full-feat :global(.rich-content) {
		align-self: stretch;
		width: 100%;
	}

	.full-feat :global(.rich-content) { text-align: justify; }
</style>
