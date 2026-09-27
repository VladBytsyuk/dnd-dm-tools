import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { UserCog } from "./index";
import BaseSmallItem from "./BaseSmallItem.svelte";

const meta = {
	title: "Items/BaseSmallItem",
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

const itemImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="340" cy="72" r="42" fill="white"/><path d="M282 144 210 192l-74-20-16 38 98 32 58-34-34 102-62 40 20 34 83-48 37-90 62 68 13 120h42l-4-139-84-100 20-47 46 30 72 3 1-40-60-3-90-56a50 50 0 0 0-56 6Z" fill="white"/></svg>')}`;

export const ImageInsteadOfValue: Story = {
	args: {
		primaryColor: "var(--ds-dm-screen)",
		secondaryColor: "var(--ds-dm-screen-sub)",
		imageSrc: itemImage,
		imageAlt: "Перемещение",
		title: "Перемещение",
		subtitle: "Moving",
		source: "PHB",
		height: 84,
		theme: "dark",
	},
};
