<script lang="ts">
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import { getOmniResultTypeColor } from "./OmniResultTypeColor";
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
	const typeColor = $derived(getOmniResultTypeColor(result.panelKey));
</script>

<div
	class="omni-search-result"
	style={`--omni-result-type-color: ${typeColor}`}
>
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
</div>

<style>
	.omni-search-result {
		--omni-result-tint-strength: 8%;
		--omni-result-hover-strength: 14%;
		--omni-result-tint: color-mix(
			in srgb,
			var(--omni-result-type-color) var(--omni-result-tint-strength),
			transparent
		);
		--omni-result-hover-tint: color-mix(
			in srgb,
			var(--omni-result-type-color) var(--omni-result-hover-strength),
			transparent
		);
		--dnd-ui-pattern-list-item-bg: var(--omni-result-tint);
		--dnd-ui-pattern-list-item-hover-bg: var(--omni-result-hover-tint);
		--dnd-ui-pattern-list-item-border: color-mix(
			in srgb,
			var(--omni-result-type-color) 55%,
			var(--dnd-ui-border-subtle)
		);
		--dnd-ui-surface-panel-strong: var(--dnd-ui-pattern-list-item-bg);
		--dnd-ui-surface-panel-hover: var(--dnd-ui-pattern-list-item-hover-bg);

		height: 100%;
		overflow: hidden;
		border-left: 3px solid var(--omni-result-type-color);
		border-radius: var(--dnd-ui-radius-lg);
		background: var(--omni-result-tint);
	}

	:global(.theme-dark) .omni-search-result {
		--omni-result-tint-strength: 12%;
		--omni-result-hover-strength: 20%;
	}

	.omni-search-result :global(> *) {
		height: 100%;
		background: var(--omni-result-tint) !important;
	}

	.omni-search-result :global(> *:hover),
	.omni-search-result :global(> *:focus-visible) {
		background: var(--omni-result-hover-tint) !important;
	}
</style>
