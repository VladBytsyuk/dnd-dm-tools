import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullItemHeader from "./FullItemHeader.svelte";

const meta = {
	title: "Components/FullItemHeader",
	component: FullItemHeader,
	parameters: { layout: "padded" },
} satisfies Meta<typeof FullItemHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
	russianName: "Огненная стена",
	englishName: "Wall of flame",
	entityLink: "/spells/wall_of_flame",
	badge: 4,
	info: "Воплощение",
	source: {
		shortName: "PHB",
		name: "Player's Handbook",
		group: { shortName: "D&D 5e", name: "Dungeons & Dragons, 5-я редакция" },
	},
};

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...defaultArgs, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...defaultArgs, theme: "light" },
};

export const Editable: Story = {
	args: {
		...defaultArgs,
		theme: "dark",
		editable: true,
	},
};
