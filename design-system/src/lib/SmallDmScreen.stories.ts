import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallDmScreen from "./SmallDmScreen.svelte";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="340" cy="72" r="42" fill="white"/><path d="M282 144 210 192l-74-20-16 38 98 32 58-34-34 102-62 40 20 34 83-48 37-90 62 68 13 120h42l-4-139-84-100 20-47 46 30 72 3 1-40-60-3-90-56a50 50 0 0 0-56 6Z" fill="white"/></svg>`;

const meta = {
	title: "Items/SmallDmScreen",
	component: SmallDmScreen,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof SmallDmScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
	args: { title: "Перемещение", subtitle: "Moving", source: "PHB", icon, theme: "dark", onclick: () => console.info("Open DM Screen entry") },
};

export const WithoutImage: Story = {
	args: { title: "Движение", subtitle: "Move", source: "PHB", theme: "dark", onclick: () => console.info("Open DM Screen entry") },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { title: "Перемещение", subtitle: "Moving", source: "PHB", icon, theme: "light", onclick: () => console.info("Open DM Screen entry") },
};
