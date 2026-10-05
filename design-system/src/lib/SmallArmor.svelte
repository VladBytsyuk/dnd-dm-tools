<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { armorTypeColor: string; title: string; subtitle: string; armorClass: string; weight: string; source: string; favorite?: boolean; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { armorTypeColor, title, subtitle, armorClass, weight, source, favorite = false, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem accentColor={armorTypeColor} primaryColor="var(--ds-armor)" secondaryColor="var(--ds-armor-sub)" height={84} {title} {subtitle} description={armorClass} {source} secondarySource={weight} {favorite} {state} {theme} />
