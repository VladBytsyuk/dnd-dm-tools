<script lang="ts">
	import type { ComponentProps } from "svelte";
	import FullAdventure, { type FullAdventureEntity } from "./FullAdventure.svelte";
	import SmallStatblock from "./SmallStatblock.svelte";
	import SmallArtifact from "./SmallArtifact.svelte";
	import SmallEquipment from "./SmallEquipment.svelte";
	import type { SceneGraphNote } from "./sceneGraphModel";

	const sceneNotes: SceneGraphNote[] = [
		{ path: "Культ Вазрона/Сырой тоннель.md", title: "Сырой тоннель", adventureName: "Дорога в Подземье", musicName: "Подземный тоннель", info: "Культ Вазрона", source: "PHB" },
		{ path: "Культ Вазрона/Пещера паука.md", title: "Пещера паука", adventureName: "Дорога в Подземье", musicName: "Паутина", info: "Культ Вазрона", source: "PHB" },
		{ path: "Культ Вазрона/Забытый храм.md", title: "Забытый храм", adventureName: "Дорога в Подземье", musicName: "Древний храм", source: "PHB" },
		{ path: "Культ Вазрона/Выход.md", title: "Выход из подземелья", adventureName: "Дорога в Подземье", source: "PHB" },
		{ path: "Культ Вазрона/Затопленный зал.md", title: "Затопленный зал", adventureName: "Дорога в Подземье", source: "PHB" },
	];
	const sceneIds = ["tunnel", "spider", "temple", "exit", "hall"];
	export type FullAdventurePreviewProps = ComponentProps<typeof FullAdventure> & { demoContent?: "mixed" | "duplicates" | "empty" };
	let {
		russianName = $bindable(""), entityLink = $bindable(""), campaignName = $bindable(""), source = $bindable(),
		notePath = $bindable(null), playlist = $bindable(null),
		nodes = $bindable([
			{ id: "tunnel", note: sceneNotes[0], position: { x: 165, y: 0 } },
			{ id: "spider", note: sceneNotes[1], position: { x: 0, y: 180 } },
			{ id: "temple", note: sceneNotes[2], position: { x: 330, y: 180 } },
			{ id: "exit", note: sceneNotes[3], position: { x: 165, y: 360 } },
		]),
		links = $bindable([
			{ fromSceneId: "tunnel", toSceneId: "spider" }, { fromSceneId: "tunnel", toSceneId: "temple" },
			{ fromSceneId: "spider", toSceneId: "exit" }, { fromSceneId: "temple", toSceneId: "exit" },
		]),
		availableNotes = ["Культ Вазрона/Дорога в Подземье.md", "Культ Вазрона/Забытые святилища.md"],
		availablePlaylists = [{ id: "underdark", title: "Дорога в Подземье", atmosphere: "напряженное", source: "PHB", trackCount: 3 }, { id: "temple", title: "Забытые святилища", atmosphere: "таинственное", source: "PHB", trackCount: 2 }],
		availableSceneNotes = sceneNotes, availableScenes = sceneNotes.map((note, index) => ({ value: sceneIds[index], label: note.title })), entities, demoContent = "mixed", ...props
	}: FullAdventurePreviewProps = $props();
	let lastAction = $state("");
	let graphChanges = $state(0);
	const cards: FullAdventureEntity[] = [
		{ url: "/bestiary/ogremoch", label: "Огремох", card: monsterCard },
		{ url: "/items/magic/flayer_slayer", label: "Гроза свежевателей", card: artifactCard },
		{ url: "/items/crossbow_bolts", label: "Арбалетные болты", card: equipmentCard },
	];
	let shownEntities = $derived(entities ?? (demoContent === "empty" || !notePath ? [] : notePath === availableNotes[1] ? [cards[1]] : demoContent === "duplicates" ? [cards[0], cards[0], cards[1], cards[2], cards[2]] : cards));
</script>

<div class="preview">
	<FullAdventure {...props} bind:russianName bind:entityLink bind:campaignName bind:source bind:notePath bind:playlist bind:nodes bind:links {availableNotes} {availablePlaylists} {availableSceneNotes} {availableScenes} entities={shownEntities}
		onCreateScene={() => { lastAction = "Создать новую сцену"; props.onCreateScene?.(); }}
		onAddScene={(id) => { const note = sceneNotes[sceneIds.indexOf(id)]; if (note) nodes = [...nodes, { id, note, position: { x: 0, y: (nodes.length + 1) * 180 } }]; props.onAddScene?.(id); }}
		onOpenNote={(path) => { lastAction = `Открыть заметку: ${path}`; void props.onOpenNote?.(path); }}
		onPlaylistClick={(id) => { lastAction = `Открыть плейлист: ${id}`; props.onPlaylistClick?.(id); }}
		onEntityClick={(url) => { lastAction = `Открыть сущность: ${url}`; void props.onEntityClick?.(url); }}
		onGraphChange={(graph) => { graphChanges++; props.onGraphChange?.(graph); }}
		onSceneSelect={(id) => { lastAction = id ? `Выбрана сцена: ${id}` : "Выделение сцены снято"; props.onSceneSelect?.(id); }} />
	<p class="summary" role="status">Сцен: {nodes.length} · Связей: {links.length} · Изменений графа: {graphChanges}</p>
	{#if lastAction}<p class="summary" role="status">{lastAction}</p>{/if}
</div>

{#snippet monsterCard(theme: "dark" | "light")}
	<SmallStatblock challengeRating={20} creatureTypeColor="var(--ds-bestiary)" title="Огремох" subtitle="Ogremoch" description="Громадный элементаль" source="PHB" {theme} />
{/snippet}
{#snippet artifactCard(theme: "dark" | "light")}
	<SmallArtifact title="Гроза свежевателей" subtitle="Flayer Slayer" rarity="Редкий" rarityColor="var(--ds-artifact-rare)" customization={true} source="PaBTSO" {theme} />
{/snippet}
{#snippet equipmentCard(theme: "dark" | "light")}
	<SmallEquipment title="Арбалетные болты" subtitle="Crossbow Bolt" source="PHB" {theme} />
{/snippet}

<style>
	.preview { width: 100%; max-width: 760px; }
	.summary { margin: 6px 0 0; color: #888; font: 12px/16px sans-serif; overflow-wrap: anywhere; }
</style>
