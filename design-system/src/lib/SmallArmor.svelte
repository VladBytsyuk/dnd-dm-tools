<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { armorTypeColor: string; title: string; subtitle: string; armorClass: string; weight: string; source: string; state?: "default" | "hovered" | "clicked" };
	let { armorTypeColor, title, subtitle, armorClass, weight, source, state }: Props = $props();
</script>

<BaseSmallItem accentColor={armorTypeColor} primaryColor="var(--ds-armor)" secondaryColor="var(--ds-armor-sub)" height={56} {title} {subtitle} description={armorClass} {source} secondarySource={weight} {state} />
