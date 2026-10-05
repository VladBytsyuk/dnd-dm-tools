<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { classColor: string; title: string; subtitle: string; description: string; source: string; favorite?: boolean; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { classColor, title, subtitle, description, source, favorite = false, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem accentColor={classColor} primaryColor="var(--ds-class)" secondaryColor="var(--ds-class-sub)" height={84} {title} {subtitle} {description} {source} {favorite} {state} {theme} />
