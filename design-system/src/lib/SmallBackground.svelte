<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { title: string; subtitle: string; source: string; favorite?: boolean; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { title, subtitle, source, favorite = false, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem primaryColor="var(--ds-background)" secondaryColor="var(--ds-background-sub)" height={60} {title} {subtitle} {source} {favorite} {state} {theme} />
