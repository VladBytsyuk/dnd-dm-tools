<script lang="ts">
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import TextBlock from "./TextBlock.svelte";

	type Props = {
		russianName: string;
		englishName: string;
		entityLink: string;
		section?: string;
		source?: FullItemSource;
		icon?: string;
		html?: string;
		onEntityLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		theme?: "dark" | "light";
	};

	let { russianName, englishName, entityLink, section, source, icon, html, onEntityLinkClick, theme = "dark" }: Props = $props();

	function imageSource(value?: string): string | undefined {
		if (!value) return undefined;
		const trimmed = value.trim();
		return trimmed.startsWith("<svg")
			? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`
			: trimmed;
	}
</script>

<article class="dm-screen-detail" data-theme={theme}>
	<header class="detail-header">
		<FullItemHeader
			{russianName}
			{englishName}
			{entityLink}
			info={section ? `Раздел: ${section}` : undefined}
			{source}
			{theme}
		/>
		{#if imageSource(icon)}
			<img class="detail-icon" src={imageSource(icon)} alt={russianName} />
		{/if}
	</header>
	{#if html}
		<section class="detail-content">
			<TextBlock {html} {onEntityLinkClick} {theme} />
		</section>
	{/if}
</article>

<style>
	.dm-screen-detail {
		box-sizing: border-box;
		display: grid;
		gap: var(--dnd-ui-space-12, 12px);
		width: 100%;
		min-width: 0;
		padding: var(--dnd-ui-space-8, 8px);
		border-radius: var(--dnd-ui-radius-lg, 8px);
		background:
			linear-gradient(rgb(48 48 48 / var(--dm-screen-overlay)), rgb(48 48 48 / var(--dm-screen-overlay))),
			linear-gradient(105deg, var(--ds-dm-screen) 0%, var(--ds-dm-screen-sub) 100%);
		color: var(--dnd-ui-text-primary);
		--dm-screen-overlay: 40%;
	}

	.dm-screen-detail[data-theme="light"] {
		background:
			linear-gradient(rgb(48 48 48 / var(--dm-screen-overlay)), rgb(48 48 48 / var(--dm-screen-overlay))),
			linear-gradient(105deg, var(--ds-dm-screen-light) 0%, var(--ds-dm-screen-sub-light) 100%);
		--dm-screen-overlay: 8%;
	}

	.detail-header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(64px, 20%); align-items: stretch; gap: var(--dnd-ui-space-12); min-width: 0; min-height: 88px; }
	.detail-icon { display: block; width: 100%; height: 100%; min-height: 88px; object-fit: contain; }
	.detail-content { min-width: 0; color: var(--dnd-ui-text-primary); line-height: 1.5; }
	@media (max-width: 420px) { .detail-header { grid-template-columns: minmax(0, 1fr) 64px; } }
</style>
