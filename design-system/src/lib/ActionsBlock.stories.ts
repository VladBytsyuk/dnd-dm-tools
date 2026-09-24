import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ActionsBlock from "./ActionsBlock.svelte";

const blocks = [
	{
		title: "Обнаружение",
		text: "Огремох совершает проверку Мудрости (Восприятие).",
	},
	{
		title: "Атака",
		text: "Огремох совершает одну атаку по выбранной цели.",
	},
	{
		title: "Передвижение",
		text: "Огремох перемещается на расстояние до своей скорости.",
	},
	{
		title: "Ответный удар",
		text: "После попадания по Огремоху он может совершить одну атаку.",
	},
];

const meta = {
	title: "Components/ActionsBlock",
	component: ActionsBlock,
	parameters: {
		layout: "padded",
	},
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof ActionsBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
	args: {
		title: "Легендарные действия",
		description:
			"Огремох может совершить 3 легендарных действия, выбирая из представленных ниже вариантов. За один раз можно использовать только одно легендарное действие.",
		blocks,
		accentColor: "#d4d4d4",
		blocksExpanded: true,
		theme: "dark",
	},
};

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...Expanded.args, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...Expanded.args, theme: "light" },
};

export const Collapsed: Story = {
	args: {
		...Expanded.args,
		blocksExpanded: false,
	},
};

export const Editable: Story = {
	args: {
		...Expanded.args,
		editable: true,
	},
};

export const WithoutBlocks: Story = {
	args: {
		title: "Легендарные действия",
		description: "Огремох может совершить 3 легендарных действия.",
		accentColor: "#60a5fa",
	},
};

export const OnlyBlocks: Story = {
	args: {
		blocks,
		accentColor: "#f59e0b",
	},
};
