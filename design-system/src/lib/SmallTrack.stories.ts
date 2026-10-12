import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallTrack from "./SmallTrack.svelte";

const meta = {
	title: "Items/SmallTrack",
	component: SmallTrack,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { title: "Подземье", atmosphere: "напряженное", source: "PHB", hasCombat: true },
} satisfies Meta<typeof SmallTrack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const WithoutCombat: Story = { args: { hasCombat: false } };
