<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { weaponTypeColor: string; title: string; subtitle: string; damage: string; range: string; source: string; state?: "default" | "hovered" | "clicked" };
	let { weaponTypeColor, title, subtitle, damage, range, source, state }: Props = $props();
</script>

<BaseSmallItem accentColor={weaponTypeColor} primaryColor="var(--ds-weapon)" secondaryColor="var(--ds-weapon-sub)" height={56} {title} {subtitle} description={damage} {source} secondarySource={range} {state} />
