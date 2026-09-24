import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Components from "./Components.svelte";

const meta = {
	title: "Components/Spell components",
	component: Components,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof Components>;

export default meta;

type Story = StoryObj<typeof meta>;

const fullArgs = {
	somatic: true,
	verbal: true,
	material: "небольшой кусочек фосфора",
};

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...fullArgs, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...fullArgs, theme: "light" },
};

export const Full: Story = {
	args: {
		...fullArgs,
		theme: "dark",
	},
};

export const Somatic: Story = { args: { somatic: true, theme: "dark" } };

export const Verbal: Story = { args: { verbal: true, theme: "dark" } };

export const Material: Story = {
	args: { material: "небольшой кусочек фосфора", theme: "dark" },
};

export const Editable: Story = {
	args: { material: "небольшой кусочек фосфора", theme: "dark", editable: true },
};

export const EditableEmpty: Story = {
	args: { theme: "dark", editable: true },
};

export const LongMaterial: Story = {
	args: {
		somatic: true,
		verbal: true,
		material: "немного святой воды и бриллианты, стоящие как минимум 25 000 зм, расходуемые заклинанием",
		theme: "dark",
	},
	parameters: {
		layout: "padded",
		viewport: { defaultViewport: "mobile1" },
	},
};
