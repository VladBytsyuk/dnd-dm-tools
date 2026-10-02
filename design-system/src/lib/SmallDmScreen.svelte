<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = {
		title: string;
		subtitle: string;
		source: string;
		icon?: string;
		favorite?: boolean;
		theme?: "dark" | "light";
		onclick?: () => void;
	};

	let { title, subtitle, source, icon, favorite = false, theme = "dark", onclick }: Props = $props();

	function imageSource(value?: string): string | undefined {
		if (!value) return undefined;
		const trimmed = value.trim();
		return trimmed.startsWith("<svg")
			? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`
			: trimmed;
	}
</script>

<BaseSmallItem
	role={onclick ? "button" : undefined}
	tabindex={onclick ? 0 : undefined}
	aria-label={onclick ? `${title}, ${subtitle}` : undefined}
	{onclick}
	onkeydown={onclick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onclick(); } } : undefined}
	imageSrc={imageSource(icon)}
	imageAlt={title}
	{title}
	{subtitle}
	{source}
	{favorite}
	height={imageSource(icon) ? 84 : 60}
	primaryColor="var(--ds-dm-screen)"
	secondaryColor="var(--ds-dm-screen-sub)"
	{theme}
/>
