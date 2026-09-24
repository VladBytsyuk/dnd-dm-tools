<script lang="ts">
	import FullArmor from "./FullArmor.svelte";
	import { Light as fullArmorLight } from "./FullArmor.stories";
	import FullArtifact from "./FullArtifact.svelte";
	import { Light as fullArtifactLight } from "./FullArtifact.stories";
	import FullBackground from "./FullBackground.svelte";
	import { Light as fullBackgroundLight } from "./FullBackground.stories";
	import FullClass from "./FullClass.svelte";
	import { Light as fullClassLight } from "./FullClass.stories";
	import FullEquipment from "./FullEquipment.svelte";
	import { Light as fullEquipmentLight } from "./FullEquipment.stories";
	import FullFeat from "./FullFeat.svelte";
	import { Light as fullFeatLight } from "./FullFeat.stories";
	import FullRace from "./FullRace.svelte";
	import { Light as fullRaceLight } from "./FullRace.stories";
	import FullSpell from "./FullSpell.svelte";
	import { Light as fullSpellLight } from "./FullSpell.stories";
	import FullStatblock from "./FullStatblock.svelte";
	import { Light as fullStatblockLight } from "./FullStatblock.stories";
	import FullWeapon from "./FullWeapon.svelte";
	import { Light as fullWeaponLight } from "./FullWeapon.stories";

	type Props = { theme?: "dark" | "light" };
	let { theme = "dark" }: Props = $props();

	const armorProps = fullArmorLight.args!;
	const artifactProps = fullArtifactLight.args!;
	const backgroundProps = fullBackgroundLight.args!;
	const classProps = fullClassLight.args!;
	const equipmentProps = fullEquipmentLight.args!;
	const featProps = fullFeatLight.args!;
	const raceProps = fullRaceLight.args!;
	const spellProps = fullSpellLight.args!;
	const statblockProps = fullStatblockLight.args!;
	const weaponProps = fullWeaponLight.args!;
</script>

<div class="gallery" data-theme={theme}>
	<FullStatblock {...statblockProps} {theme} />
	<FullSpell {...spellProps} {theme} />
	<FullWeapon {...weaponProps} {theme} />
	<FullArmor {...armorProps} {theme} />
	<FullArtifact {...artifactProps} {theme} />
	<FullFeat {...featProps} {theme} />
	<FullRace {...raceProps} {theme} />
	<FullClass {...classProps} {theme} />
	<FullEquipment {...equipmentProps} {theme} />
	<FullBackground {...backgroundProps} {theme} />
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
		align-items: start;
		gap: 16px;
		padding: 16px;
		background: #303030;
	}

	.gallery[data-theme="light"] { background: #f8fafc; }
</style>
