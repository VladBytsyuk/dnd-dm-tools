import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallAdventure from "./SmallAdventure.svelte";

const meta = {
	title: "Items/SmallAdventure",
	component: SmallAdventure,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { title: "Дорога в Шамат", playlistName: "Дорога в Подземье", sceneCount: 5, source: "PHB" },
} satisfies Meta<typeof SmallAdventure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const OneScene: Story = { args: { sceneCount: 1 } };
export const TwoScenes: Story = { args: { sceneCount: 2 } };
export const Empty: Story = { args: { sceneCount: 0, playlistName: undefined } };
export const LongNames: Story = { args: { title: "Долгая дорога через подземелья Шамата", playlistName: "Напряженная музыка древних подземных городов", sceneCount: 125 } };
