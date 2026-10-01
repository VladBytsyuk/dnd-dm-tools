<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";
	type Props = {
		challengeRating: string | number;
		creatureTypeColor: string;
		title: string;
		subtitle: string;
		description: string;
		source: string;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
	};

	let { challengeRating, creatureTypeColor, title, subtitle, description, source, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem
	accentColor={creatureTypeColor}
	primaryColor="var(--ds-bestiary)"
	secondaryColor="var(--ds-bestiary-sub)"
	height={96}
	valueFontSize={28}
	value={challengeRating}
	{title}
	{subtitle}
	{description}
	{source}
	{state}
	{theme}
/>
