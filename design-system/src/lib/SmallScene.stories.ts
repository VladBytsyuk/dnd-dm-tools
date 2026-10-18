import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SmallScene from "./SmallScene.svelte";

const meta = {
	title: "Items/SmallScene",
	component: SmallScene,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { title: "Сырой тоннель", adventureName: "Дорога в Шамат", musicName: "Подземный тоннель", info: "Культ Вазрона", source: "PHB" },
} satisfies Meta<typeof SmallScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const WithoutMusic: Story = { args: { musicName: undefined } };
export const Minimal: Story = { args: { adventureName: undefined, musicName: undefined, info: undefined, source: undefined } };
export const LongNames: Story = { args: { title: "Сырой тоннель под древними руинами", adventureName: "Долгая дорога через подземелья Шамата", musicName: "Подземный тоннель за забытым храмом", info: "Последователи древнего культа Вазрона" } };
