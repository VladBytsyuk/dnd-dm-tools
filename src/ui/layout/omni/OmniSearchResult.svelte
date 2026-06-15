<script lang="ts">
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import PanelTypeTint from "../uikit/PanelTypeTint.svelte";
	import ArmorSmallUi from "../armor/ArmorSmallUi.svelte";
	import ArtifactSmallUi from "../artifact/ArtifactSmallUi.svelte";
	import BackgroundSmallUi from "../background/BackgroundSmallUi.svelte";
	import CharacterSheetSmallUi from "../character/CharacterSheetSmallUi.svelte";
	import ClassSmallUi from "../class/ClassSmallUi.svelte";
	import DmScreenGroupUi from "../screen/DmScreenGroupUi.svelte";
	import EquipSmallUi from "../equip/EquipSmallUi.svelte";
	import FeatSmallUi from "../feat/FeatSmallUi.svelte";
	import MonsterSmallUi from "../monster/MonsterSmallUi.svelte";
	import RaceSmallUi from "../race/RaceSmallUi.svelte";
	import SpellSmallUi from "../spell/SpellSmallUi.svelte";
	import WeaponSmallUi from "../weapon/WeaponSmallUi.svelte";

	let {
		result,
		onSelect,
	}: {
		result: PanelSearchResult;
		onSelect: () => void;
	} = $props();

	const item = $derived(result.item as any);
</script>

<PanelTypeTint panelKey={result.panelKey}>
	{#if result.panelKey === "bestiary"}
		<MonsterSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "spellbook"}
		<SpellSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "arsenal"}
		<WeaponSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "armory"}
		<ArmorSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "equipment"}
		<EquipSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "artifactory"}
		<ArtifactSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "backgrounds"}
		<BackgroundSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "feats"}
		<FeatSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "races"}
		<RaceSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "classes"}
		<ClassSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "character-sheets"}
		<CharacterSheetSmallUi smallItem={item} onItemClick={onSelect} />
	{:else if result.panelKey === "dm-screen"}
		<DmScreenGroupUi
			icon={item.icon}
			name={item.name}
			source={item.source.shortName}
			onclick={onSelect}
		/>
	{/if}
</PanelTypeTint>
