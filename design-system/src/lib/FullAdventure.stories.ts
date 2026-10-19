import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullAdventure from "./FullAdventure.svelte";
import FullAdventurePreview, { type FullAdventurePreviewProps } from "./FullAdventurePreview.svelte";

const meta = {
	title: "Items/FullAdventure",
	component: FullAdventure,
	render: (args) => ({ Component: FullAdventurePreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: {
		russianName: "Дорога в Подземье",
		entityLink: "/adventure/road_to_underdark",
		campaignName: "Культ Вазрона",
		availableCampaigns: ["Культ Вазрона", "Хроники Подземья"],
		notePath: "Культ Вазрона/Дорога в Подземье.md",
		playlist: { id: "underdark", title: "Дорога в Подземье", atmosphere: "напряженное", source: "PHB", trackCount: 3 },
		source: { shortName: "PHB", name: "Player's Handbook", group: { shortName: "D&D 5e", name: "Dungeons & Dragons, 5-я редакция" } },
	},
} satisfies Meta<FullAdventurePreviewProps>;
export default meta;
type Story = StoryObj<FullAdventurePreviewProps>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Editable: Story = { args: { editable: true } };
export const LightEditable: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", editable: true } };
export const Empty: Story = { args: { editable: true, campaignName: "", notePath: null, playlist: null, nodes: [], links: [] } };
export const EmptyContent: Story = { args: { demoContent: "empty" } };
export const WithoutNote: Story = { args: { notePath: null } };
export const WithoutPlaylist: Story = { args: { playlist: null } };
export const EmptyPickers: Story = { args: { editable: true, notePath: null, playlist: null, nodes: [], links: [], availableNotes: [], availablePlaylists: [], availableSceneNotes: [], availableScenes: [] } };
export const Duplicates: Story = { args: { demoContent: "duplicates" } };
export const ParallelLinks: Story = { args: { links: [
	{ fromSceneId: "tunnel", toSceneId: "spider" },
	{ fromSceneId: "tunnel", toSceneId: "spider" },
	{ fromSceneId: "spider", toSceneId: "tunnel", fromSide: "top", toSide: "bottom" },
] } };
export const LongNames: Story = { args: {
	russianName: "Долгая дорога через забытые подземные города и древние святилища",
	entityLink: "/adventure/long_road_through_the_forgotten_underground_cities",
	campaignName: "Тайны последователей древнего культа Вазрона",
	notePath: "Приключения/Культ Вазрона/Подземелья древнего города/Дорога в Подземье.md",
	playlist: { id: "underdark", title: "Напряженная музыка древних подземных городов", atmosphere: "напряженное, холодное", source: "PHB", trackCount: 23 },
	availableSceneNotes: [{ path: "Приключения/Очень длинное название сцены в подземелье.md", title: "Очень длинное название сцены в древнем подземелье", adventureName: "Долгая дорога через подземные города" }],
} };
