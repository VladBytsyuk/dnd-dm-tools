<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { title: string; subtitle: string; description: string; source: string; state?: "default" | "hovered" | "clicked" };
	let { title, subtitle, description, source, state }: Props = $props();
</script>

<BaseSmallItem primaryColor="var(--ds-feat)" secondaryColor="var(--ds-feat-sub)" height={56} {title} {subtitle} {description} {source} {state} />
