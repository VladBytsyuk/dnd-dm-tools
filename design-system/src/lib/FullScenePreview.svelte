<script lang="ts">
	import type { ComponentProps } from "svelte";
	import FullScene, { type FullSceneEntity } from "./FullScene.svelte";
	import SmallStatblock from "./SmallStatblock.svelte";
	import SmallArtifact from "./SmallArtifact.svelte";
	import SmallEquipment from "./SmallEquipment.svelte";
	import SmallWeapon from "./SmallWeapon.svelte";

	export type FullScenePreviewProps = ComponentProps<typeof FullScene> & { demoContent?: "mixed" | "duplicates" | "empty" };
	let {
		russianName = $bindable(""), entityLink = $bindable(""),
		adventure = $bindable(null), notePath = $bindable(null), track = $bindable(null), entities,
		demoContent = "mixed",
		availableAdventures = [{ id: "cult", title: "Культ Вазрона" }, { id: "shamat", title: "Дорога в Шамат" }],
		availableNotes = ["Культ Вазрона/Дорога в Подземье.md", "Культ Вазрона/Забытый храм.md"],
		availableTracks = [{ id: "underdark", title: "Подземье", atmosphere: "напряженное", source: "PHB", hasCombat: true }, { id: "temple", title: "Забытый храм", atmosphere: "таинственное", source: "PHB" }],
		...props
	}: FullScenePreviewProps = $props();
	let lastAction = $state("");
	const cards: FullSceneEntity[] = [
		{ url: "/bestiary/ogremoch", label: "Огремох", card: monsterCard },
		{ url: "/items/magic/flayer_slayer", label: "Гроза свежевателей", card: artifactCard },
		{ url: "/items/crossbow_bolts", label: "Арбалетные болты", card: equipmentCard },
		{ url: "/weapons/club", label: "Дубинка", card: weaponCard },
	];
	let shownEntities = $derived(entities ?? (demoContent === "empty" || !notePath ? [] : notePath === availableNotes[1] ? [cards[1]] : demoContent === "duplicates" ? [cards[0], cards[0], cards[1], cards[2], cards[2], cards[3]] : cards));
</script>

<FullScene {...props} bind:russianName bind:entityLink bind:adventure bind:notePath bind:track {availableAdventures} {availableNotes} {availableTracks} entities={shownEntities} onOpenNote={(path) => { lastAction = `Открыть заметку: ${path}`; void props.onOpenNote?.(path); }} onEntityClick={(url) => { lastAction = `Открыть сущность: ${url}`; void props.onEntityClick?.(url); }} onTrackClick={(id) => { lastAction = `Открыть трек: ${id}`; props.onTrackClick?.(id); }} />
{#if lastAction}<p class="last-action" role="status">{lastAction}</p>{/if}

{#snippet monsterCard(theme: "dark" | "light")}
	<SmallStatblock challengeRating={20} creatureTypeColor="var(--ds-bestiary)" title="Огремох" subtitle="Ogremoch" description="Громадный элементаль" source="PHB" {theme} />
{/snippet}
{#snippet artifactCard(theme: "dark" | "light")}
	<SmallArtifact title="Гроза свежевателей" subtitle="Flayer Slayer" rarity="Редкий" rarityColor="var(--ds-artifact-rare)" customization={true} source="PaBTSO" {theme} />
{/snippet}
{#snippet equipmentCard(theme: "dark" | "light")}
	<SmallEquipment title="Арбалетные болты" subtitle="Crossbow Bolt" source="PHB" {theme} />
{/snippet}
{#snippet weaponCard(theme: "dark" | "light")}
	<SmallWeapon title="Дубинка" subtitle="Club" weaponTypeColor="var(--ds-weapon-simple-melee)" damage="1к4 дробящий" price="2 см" source="PHB" {theme} />
{/snippet}

<style>
	.last-action { margin: 8px 0 0; color: #888; font: 12px/15px sans-serif; overflow-wrap: anywhere; }
</style>
