<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { title: string; subtitle: string; source: string; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { title, subtitle, source, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem primaryColor="var(--ds-background)" secondaryColor="var(--ds-background-sub)" height={40} {title} {subtitle} {source} {state} {theme} />
