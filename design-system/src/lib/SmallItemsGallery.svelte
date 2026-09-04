<script lang="ts">
	import SmallArmor from "./SmallArmor.svelte";
	import SmallArtifact from "./SmallArtifact.svelte";
	import SmallBackground from "./SmallBackground.svelte";
	import SmallClass from "./SmallClass.svelte";
	import SmallEquipment from "./SmallEquipment.svelte";
	import SmallFeat from "./SmallFeat.svelte";
	import SmallRace from "./SmallRace.svelte";
	import SmallSpell from "./SmallSpell.svelte";
	import SmallStatblock from "./SmallStatblock.svelte";
	import SmallWeapon from "./SmallWeapon.svelte";
</script>

<div class="gallery">
	<SmallStatblock challengeRating={20} creatureTypeColor="var(--ds-bestiary-magical)" title="Огремох" subtitle="Ogremoch" description="Громадный элементаль" source="PHB" secondarySource="BCM" />
	<SmallSpell level={3} title="Голод Хадара" subtitle="Hunger of Hadar" school="Вызов" schoolColor="var(--ds-conjuration)" source="PHB" secondarySource="BCM" />
	<SmallWeapon weaponTypeColor="var(--ds-weapon-simple-melee)" title="Дубинка" subtitle="Club" damage="1к4 дробящий" range="2 см" source="PHB" />
	<SmallArmor armorTypeColor="var(--ds-armor-light)" title="Стёганый доспех" subtitle="Padded Armor" armorClass="11 + модификатор Лов" weight="5 зм" source="PHB" />
	<SmallArtifact title="Гроза свежевателей" subtitle="Flayer Slayer" rarity="Редкий" rarityColor="var(--ds-artifact-rare)" source="PHB" />
	<SmallFeat title="Борец" subtitle="Grappler" description="Сила 13 или выше" source="PHB" />
	<SmallRace title="Аасимар" subtitle="Aasimar" description="Харизма +2" source="VGM" />
	<SmallClass classColor="var(--ds-paladin)" title="Паладин" subtitle="Paladin" description="1к10" source="PHB" />
	<SmallEquipment title="Арбалетные болты" subtitle="Crossbow Bolt" source="PHB" />
	<SmallBackground title="Моряк" subtitle="Sailor" source="PHB" />
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
		gap: 16px;
		max-width: 1136px;
		padding: 16px;
		background: #303030;
	}
</style>
