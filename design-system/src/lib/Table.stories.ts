import type { Meta, StoryObj } from "@storybook/svelte-vite";
import TablePreview from "./TablePreview.svelte";

const meta = {
	title: "Styles/Table",
	component: TablePreview,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof TablePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
