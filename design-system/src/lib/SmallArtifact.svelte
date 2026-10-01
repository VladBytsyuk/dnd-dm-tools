<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";
	import UserCog from "lucide-svelte/icons/user-cog";

	type Props = { title: string; subtitle: string; rarity: string; rarityColor: string; source: string; customization?: boolean; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { title, subtitle, rarity, rarityColor, source, customization = false, state, theme = "dark" }: Props = $props();
</script>

<BaseSmallItem accentColor={rarityColor} primaryColor="var(--ds-artifacts)" secondaryColor="var(--ds-artifacts-sub)" height={84} {title} {subtitle} description={rarity} {source} icon={customization ? UserCog : undefined} {state} {theme} />
