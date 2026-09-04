<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";
	type Props = {
		challengeRating: string | number;
		creatureTypeColor: string;
		title: string;
		subtitle: string;
		description: string;
		source: string;
		secondarySource: string;
		state?: "default" | "hovered" | "clicked";
	};

	let { challengeRating, creatureTypeColor, title, subtitle, description, source, secondarySource, state }: Props = $props();
</script>

<BaseSmallItem
	accentColor={creatureTypeColor}
	primaryColor="var(--ds-bestiary)"
	secondaryColor="var(--ds-bestiary-sub)"
	height={64}
	value={challengeRating}
	{title}
	{subtitle}
	{description}
	{source}
	{secondarySource}
	{state}
/>
