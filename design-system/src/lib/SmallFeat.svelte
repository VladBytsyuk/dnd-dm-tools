<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { title: string; subtitle: string; description: string; source: string; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { title, subtitle, description: rawDescription, source, state, theme = "dark" }: Props = $props();
	let description = $derived(rawDescription.trim().toLocaleLowerCase("ru") === "нет" ? "" : rawDescription);
</script>

<BaseSmallItem primaryColor="var(--ds-feat)" secondaryColor="var(--ds-feat-sub)" height={84} {title} {subtitle} {description} {source} {state} {theme} />
