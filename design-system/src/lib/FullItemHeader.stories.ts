import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullItemHeader from "./FullItemHeader.svelte";

const meta = {
	title: "Components/FullItemHeader",
	component: FullItemHeader,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullItemHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
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
	},
};

export const Editable: Story = {
	args: {
		...Default.args,
		editable: true,
	},
};
