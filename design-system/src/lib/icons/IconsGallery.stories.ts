import type { Meta, StoryObj } from "@storybook/svelte-vite";
import IconsGallery from "./IconsGallery.svelte";

const meta = {
	title: "Icons/Gallery",
	component: IconsGallery,
	tags: ["autodocs"],
} satisfies Meta<typeof IconsGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {};
