<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";
	type Props = { level: string | number; title: string; subtitle: string; school: string; schoolColor: string; source: string; secondarySource: string; state?: "default" | "hovered" | "clicked" };
	let { level, title, subtitle, school, schoolColor, source, secondarySource, state }: Props = $props();
</script>

<BaseSmallItem accentColor={schoolColor} primaryColor="var(--ds-spell)" secondaryColor="var(--ds-spell-sub)" height={64} value={level} {title} {subtitle} description={school} {source} {secondarySource} {state} />
