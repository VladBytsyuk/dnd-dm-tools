import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullItemsGallery from "./FullItemsGallery.svelte";

const meta = {
	title: "Items/Full items",
	component: FullItemsGallery,
	parameters: { layout: "fullscreen" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullItemsGallery>;

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
