import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ColorTokensGallery from "./ColorTokensGallery.svelte";

const meta = {
	title: "Tokens/Colors",
	component: ColorTokensGallery,
	tags: ["autodocs"],
} satisfies Meta<typeof ColorTokensGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { theme: "light" },
};

export const All: Story = { args: { theme: "dark" } };
