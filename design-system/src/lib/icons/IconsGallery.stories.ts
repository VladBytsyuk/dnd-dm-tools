import type { Meta, StoryObj } from "@storybook/svelte-vite";
import IconsGallery from "./IconsGallery.svelte";

const meta: Meta<typeof IconsGallery> = {
	title: "Icons/Gallery",
	component: IconsGallery,
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {};
