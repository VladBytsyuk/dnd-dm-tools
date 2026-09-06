import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { UserCog } from "./index";
import BaseSmallItem from "./BaseSmallItem.svelte";

const meta = {
	title: "Components/BaseSmallItem",
	component: BaseSmallItem,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
} satisfies Meta<typeof BaseSmallItem>;

export default meta;

type Story = StoryObj<typeof meta>;

const args = {
	accentColor: "#ff0000",
	primaryColor: "#ff0000",
	secondaryColor: "#303030",
	value: 3,
	title: "Голод Хадара",
	subtitle: "Hunger of Hadar",
	description: "Вызов",
	source: "PHB",
	secondarySource: "BCM",
	icon: UserCog,
};

const lightArgs = {
	...args,
	accentColor: "#334155",
	primaryColor: "#f8fafc",
	secondaryColor: "#e2e8f0",
};

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...args, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...lightArgs, theme: "light" },
};

export const Default: Story = { args: { ...args, theme: "dark" } };
export const Hovered: Story = { args: { ...args, theme: "dark", state: "hovered" } };
export const Clicked: Story = { args: { ...args, theme: "dark", state: "clicked" } };
export const Compact: Story = {
	args: {
		accentColor: "#0f766e",
		primaryColor: "#0f766e",
		secondaryColor: "#4db6ac",
		title: "Арбалетные болты",
		subtitle: "Crossbow Bolt",
		source: "PHB",
		theme: "dark",
	},
};
