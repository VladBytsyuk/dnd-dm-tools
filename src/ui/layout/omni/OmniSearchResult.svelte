<script lang="ts">
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import PanelTypeTint from "../uikit/PanelTypeTint.svelte";
	import CharacterSheetSmallUi from "../character/CharacterSheetSmallUi.svelte";
	import DmScreenGroupUi from "../screen/DmScreenGroupUi.svelte";
	import RedesignedSmallItem from "src/ui/design-system/RedesignedSmallItem.svelte";
	import { theme as appTheme, Theme } from "src/ui/theme";
	import MediaEntityCardUi from "../media/MediaEntityCardUi.svelte";

	let {
		result,
		onSelect,
	}: {
		result: PanelSearchResult;
		onSelect: () => void;
	} = $props();

	const item = $derived(result.item as any);
	const theme = $derived($appTheme === Theme.Dark ? "dark" : "light");
</script>

	{#if (result.panelKey === "player" || result.panelKey === "adventures")}
		<div role="button" tabindex="0" onclick={onSelect} onkeydown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); } }}><MediaEntityCardUi {result} {theme} /></div>
	{:else if result.panelKey === "dm-screen"}
		<DmScreenGroupUi
			icon={item.icon}
			name={item.name}
			source={item.source.shortName}
			onclick={onSelect}
			favorite={result.favorite ?? false}
			{theme}
		/>
	{:else if result.panelKey !== "character-sheets"}
		<RedesignedSmallItem panelKey={result.panelKey} smallItem={item} favorite={result.favorite ?? false} onItemClick={onSelect} />
	{:else}
	<PanelTypeTint panelKey={result.panelKey}>
		<CharacterSheetSmallUi smallItem={item} onItemClick={onSelect} />
	</PanelTypeTint>
	{/if}
