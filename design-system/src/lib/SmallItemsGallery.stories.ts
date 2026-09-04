import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallItemsGallery from "./SmallItemsGallery.svelte";

const meta = {
	title: "Components/Small items",
	component: SmallItemsGallery,
	parameters: { layout: "fullscreen" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof SmallItemsGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {};
