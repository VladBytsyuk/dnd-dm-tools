import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallPlaylist from "./SmallPlaylist.svelte";

const meta = {
	title: "Items/SmallPlaylist",
	component: SmallPlaylist,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { title: "Дорога в Подземье", atmosphere: "напряженное", source: "PHB", trackCount: 3 },
} satisfies Meta<typeof SmallPlaylist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Empty: Story = { args: { trackCount: 0 } };
