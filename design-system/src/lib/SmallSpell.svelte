<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";
	import HandHelping from "lucide-svelte/icons/hand-helping";
	import PackageOpen from "lucide-svelte/icons/package-open";
	import Speech from "lucide-svelte/icons/speech";
	import Sparkles from "lucide-svelte/icons/sparkles";
	import UserCog from "lucide-svelte/icons/user-cog";
	import type { SmallItemMetaIcon } from "./BaseSmallItem.svelte";
	type SpellComponents = { verbal?: boolean; somatic?: boolean; material?: string };
	type Props = { level: string | number; title: string; subtitle: string; school: string; schoolColor: string; source: string; favorite?: boolean; concentration?: boolean; ritual?: boolean; components?: SpellComponents; state?: "default" | "hovered" | "clicked"; theme?: "dark" | "light" };
	let { level, title, subtitle, school, schoolColor, source, favorite = false, concentration = false, ritual = false, components = {}, state, theme = "dark" }: Props = $props();
	let centerIcons = $derived.by<SmallItemMetaIcon[]>(() => [
		...(concentration ? [{ icon: UserCog, label: "Концентрация" }] : []),
		...(ritual ? [{ icon: Sparkles, label: "Ритуал" }] : []),
	]);
	let bottomIcons = $derived.by<SmallItemMetaIcon[]>(() => [
		...(components.verbal ? [{ icon: Speech, label: "Вербальный" }] : []),
		...(components.somatic ? [{ icon: HandHelping, label: "Соматический" }] : []),
		...(components.material !== undefined ? [{ icon: PackageOpen, label: "Материальный" }] : []),
	]);
</script>

<BaseSmallItem accentColor={schoolColor} primaryColor="var(--ds-spell)" secondaryColor="var(--ds-spell-sub)" height={96} metaWidth={64} centerIcons={centerIcons} bottomIcons={bottomIcons} value={level} {title} {subtitle} description={school} {source} {favorite} {state} {theme} />
