<script lang="ts">
	import "../colors.css";

	const groups = [
		["Разделы", [["DsBestiary", "--ds-bestiary", "#B91C1C"], ["DsBestiarySub", "--ds-bestiary-sub", "#FB7185"], ["DsSpell", "--ds-spell", "#6D28D9"], ["DsSpellSub", "--ds-spell-sub", "#67E8F9"], ["DsWeapon", "--ds-weapon", "#B7791F"], ["DsWeaponSub", "--ds-weapon-sub", "#F2C14E"], ["DsArmor", "--ds-armor", "#64748B"], ["DsArmorSub", "--ds-armor-sub", "#B8C4D6"], ["DsEquipment", "--ds-equipment", "#0F766E"], ["DsEquipmentSub", "--ds-equipment-sub", "#5EEAD4"], ["DsArtifacts", "--ds-artifacts", "#7C3AED"], ["DsArtifactsSub", "--ds-artifacts-sub", "#E879F9"], ["DsFeat", "--ds-feat", "#C2410C"], ["DsFeatSub", "--ds-feat-sub", "#FDBA74"], ["DsBackground", "--ds-background", "#854D0E"], ["DsBackgroundSub", "--ds-background-sub", "#D6A86A"], ["DsRace", "--ds-race", "#15803D"], ["DsRaceSub", "--ds-race-sub", "#86EFAC"], ["DsClass", "--ds-class", "#1D4ED8"], ["DsClassSub", "--ds-class-sub", "#60A5FA"]]],
		["Классы", [
			["DsArtificer", "--ds-artificer", "#A8B3C2"], ["DsArtificerSub", "--ds-artificer-sub", "#F1C75B"], ["DsBarbarian", "--ds-barbarian", "#B91C1C"], ["DsBarbarianSub", "--ds-barbarian-sub", "#F5E6C8"],
			["DsBard", "--ds-bard", "#C026D3"], ["DsBardSub", "--ds-bard-sub", "#F9A8D4"], ["DsCleric", "--ds-cleric", "#D4A017"], ["DsClericSub", "--ds-cleric-sub", "#FFF4C2"],
			["DsDruid", "--ds-druid", "#15803D"], ["DsDruidSub", "--ds-druid-sub", "#86C96F"], ["DsFighter", "--ds-fighter", "#475569"], ["DsFighterSub", "--ds-fighter-sub", "#CBD5E1"],
			["DsMonk", "--ds-monk", "#007C6C"], ["DsMonkSub", "--ds-monk-sub", "#99F6E4"], ["DsPaladin", "--ds-paladin", "#2563EB"], ["DsPaladinSub", "--ds-paladin-sub", "#EFF6FF"],
			["DsRanger", "--ds-ranger", "#6B4423"], ["DsRangerSub", "--ds-ranger-sub", "#C6A15B"], ["DsRouge", "--ds-rouge", "#18181B"], ["DsRougeSub", "--ds-rouge-sub", "#A78BFA"],
			["DsSorcerer", "--ds-sorcerer", "#FF4D00"], ["DsSorcererSub", "--ds-sorcerer-sub", "#FF4FA3"], ["DsWarlock", "--ds-warlock", "#6D28D9"], ["DsWarlockSub", "--ds-warlock-sub", "#A3E635"],
			["DsWizard", "--ds-wizard", "#D8C7A1"], ["DsWizardSub", "--ds-wizard-sub", "#67E8F9"]
		]],
		["Школы магии", [["DsAbjurer", "--ds-abjurer", "#2563EB"], ["DsConjuration", "--ds-conjuration", "#0F9F8F"], ["DsDivination", "--ds-divination", "#D6A516"], ["DsEnchantment", "--ds-enchantment", "#C92F77"], ["DsEvocation", "--ds-evocation", "#F4512C"], ["DsIllusion", "--ds-illusion", "#7C3AED"], ["DsNecromancy", "--ds-necromancy", "#527A2B"], ["DsTransmutation", "--ds-transmutation", "#536F82"]]],
		["Типы оружия", [["DsWeaponSimpleMelee", "--ds-weapon-simple-melee", "#78716C"], ["DsWeaponMatrialMelee", "--ds-weapon-matrial-melee", "#C2410C"], ["DsWeaponSimpleRanged", "--ds-weapon-simple-ranged", "#0F766E"], ["DsWeaponMatrialRanged", "--ds-weapon-matrial-ranged", "#2563EB"]]],
		["Типы брони", [["DsArmorLight", "--ds-armor-light", "#65A30D"], ["DsArmorMedium", "--ds-armor-medium", "#A16207"], ["DsArmorHeavy", "--ds-armor-heavy", "#475569"], ["DsArmorShield", "--ds-armor-shield", "#0369A1"]]],
		["Редкость артефактов", [["DsArtifactRegular", "--ds-artifact-regular", "#737373"], ["DsArtifactUncommon", "--ds-artifact-uncommon", "#16A34A"], ["DsArtifactRare", "--ds-artifact-rare", "#2563EB"], ["DsArtifactVeryRare", "--ds-artifact-very-rare", "#9333EA"], ["DsArtifactLegendary", "--ds-artifact-legendary", "#EA580C"], ["DsArtifactArtifact", "--ds-artifact-artifact", "#DCB844"]]],
		["Типы существ", [["DsBestiaryRegular", "--ds-bestiary-regular", "#65A30D"], ["DsBestiaryHumanoid", "--ds-bestiary-humanoid", "#D97706"], ["DsBestiaryMagical", "--ds-bestiary-magical", "#7C3AED"], ["DsBestiaryCelestial", "--ds-bestiary-celestial", "#2563EB"], ["DsBestiaryInfernal", "--ds-bestiary-infernal", "#C2410C"], ["DsBestiaryUndead", "--ds-bestiary-undead", "#4D7C0F"], ["DsBestiaryDragon", "--ds-bestiary-dragon", "#CA8A04"], ["DsBestiarySlime", "--ds-bestiary-slime", "#0891B2"]]]
	] as const;
</script>

<div class="gallery">
	{#each groups as [groupName, colors]}
		<section>
			<h2>{groupName}</h2>
			{#each colors as [name, token, value]}
				<div class="color-token">
					<div class="swatch" style:background-color={`var(${token})`}></div>
					<div><strong>{name}</strong><code>{token}</code></div>
					<code>{value}</code>
				</div>
			{/each}
		</section>
	{/each}
</div>

<style>
	.gallery { display: grid; gap: 24px; padding: 16px; }
	section { display: grid; gap: 8px; }
	h2 { margin: 0; font: 600 18px/1.4 sans-serif; }
	.color-token { display: grid; grid-template-columns: 32px minmax(180px, 1fr) auto; align-items: center; gap: 12px; padding: 10px; border: 1px solid #d9d9d9; border-radius: 8px; }
	.swatch { width: 32px; height: 32px; border-radius: 6px; }
	strong, code { display: block; font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
	strong { color: #1f2937; }
	code { color: #6b7280; }
</style>
