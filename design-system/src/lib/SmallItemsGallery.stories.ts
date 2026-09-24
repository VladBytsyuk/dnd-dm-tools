import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallItemsGallery from "./SmallItemsGallery.svelte";

const meta = {
	title: "Items/Small items",
	component: SmallItemsGallery,
	parameters: { layout: "fullscreen" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof SmallItemsGallery>;

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
