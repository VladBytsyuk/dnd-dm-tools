import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullScene from "./FullScene.svelte";
import FullScenePreview, { type FullScenePreviewProps } from "./FullScenePreview.svelte";

const meta = {
	title: "Items/FullScene",
	component: FullScene,
	render: (args) => ({ Component: FullScenePreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: {
		russianName: "Дорога в Подземье",
		entityLink: "/scene/road_to_underdark",
		adventure: { id: "cult", title: "Культ Вазрона" },
		notePath: "Культ Вазрона/Дорога в Подземье.md",
		track: { id: "underdark", title: "Подземье", atmosphere: "напряженное", source: "PHB", hasCombat: true },
		source: { shortName: "PHB", name: "Player's Handbook", group: { shortName: "D&D 5e", name: "Dungeons & Dragons, 5-я редакция" } },
	},
} satisfies Meta<FullScenePreviewProps>;

export default meta;
type Story = StoryObj<FullScenePreviewProps>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Editable: Story = { args: { editable: true } };
export const LightEditable: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", editable: true } };
export const Empty: Story = { args: { editable: true, adventure: null, notePath: null, track: null } };
export const EmptyContent: Story = { args: { demoContent: "empty" } };
export const WithoutMusic: Story = { args: { track: null } };
export const Duplicates: Story = { args: { demoContent: "duplicates" } };
export const EmptyPickers: Story = { args: { editable: true, adventure: null, notePath: null, track: null, availableAdventures: [], availableNotes: [], availableTracks: [] } };
export const LongNames: Story = { args: { russianName: "Долгая дорога через забытые подземные города", adventure: { id: "cult", title: "Тайны последователей древнего культа Вазрона" }, notePath: "Приключения/Культ Вазрона/Подземелья древнего города/Дорога в Подземье.md", track: { id: "underdark", title: "Напряженная музыка древних подземных городов", atmosphere: "напряженное, холодное", hasCombat: true } } };
