<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { title: string; subtitle: string; description: string; source: string; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { title, subtitle, description, source, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem primaryColor="var(--ds-race)" secondaryColor="var(--ds-race-sub)" height={56} {title} {subtitle} {description} {source} {state} {theme} />
