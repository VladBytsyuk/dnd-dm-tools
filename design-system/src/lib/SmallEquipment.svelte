<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = { title: string; subtitle: string; source: string; state?: "default" | "hovered" | "clicked" };
	let { title, subtitle, source, state }: Props = $props();
</script>

<BaseSmallItem primaryColor="var(--ds-equipment)" secondaryColor="var(--ds-equipment-sub)" height={40} {title} {subtitle} {source} {state} />
