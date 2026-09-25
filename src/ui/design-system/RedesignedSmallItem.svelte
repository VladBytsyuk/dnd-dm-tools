<script lang="ts">
	import {
		SmallStatblock, SmallSpell, SmallWeapon, SmallArmor, SmallEquipment,
		SmallArtifact, SmallFeat, SmallBackground, SmallRace, SmallClass,
	} from "@dnd-dm-tools/design-system";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import { toSmallCardProps } from "./adapters";
	import { theme as appTheme, Theme } from "src/ui/theme";

	type Props = { panelKey: PanelKey; smallItem: BaseItem; onItemClick: () => void };
	let { panelKey, smallItem, onItemClick }: Props = $props();
	const cardProps = $derived(toSmallCardProps(panelKey, smallItem as Record<string, any>));
	const theme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	function activate(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onItemClick(); }
	}
</script>

<div class="item-action" role="button" tabindex="0" onclick={onItemClick} onkeydown={activate}>
	{#if panelKey === "bestiary"}<SmallStatblock {...(cardProps as any)} {theme} />
	{:else if panelKey === "spellbook"}<SmallSpell {...(cardProps as any)} {theme} />
	{:else if panelKey === "arsenal"}<SmallWeapon {...(cardProps as any)} {theme} />
	{:else if panelKey === "armory"}<SmallArmor {...(cardProps as any)} {theme} />
	{:else if panelKey === "equipment"}<SmallEquipment {...(cardProps as any)} {theme} />
	{:else if panelKey === "artifactory"}<SmallArtifact {...(cardProps as any)} {theme} />
	{:else if panelKey === "feats"}<SmallFeat {...(cardProps as any)} {theme} />
	{:else if panelKey === "backgrounds"}<SmallBackground {...(cardProps as any)} {theme} />
	{:else if panelKey === "races"}<SmallRace {...(cardProps as any)} {theme} />
	{:else if panelKey === "classes"}<SmallClass {...(cardProps as any)} {theme} />{/if}
</div>

<style>
	.item-action { width: 100%; cursor: pointer; border-radius: 8px; }
	.item-action:focus-visible { outline: 2px solid var(--interactive-accent); outline-offset: 2px; }
</style>
