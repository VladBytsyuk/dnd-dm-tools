<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { armorTypeColor: string; title: string; subtitle: string; armorClass: string; weight: string; source: string; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { armorTypeColor, title, subtitle, armorClass, weight, source, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem accentColor={armorTypeColor} primaryColor="var(--ds-armor)" secondaryColor="var(--ds-armor-sub)" height={56} {title} {subtitle} description={armorClass} {source} secondarySource={weight} {state} {theme} />
