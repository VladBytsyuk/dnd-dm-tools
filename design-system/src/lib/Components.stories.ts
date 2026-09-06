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

export const Full: Story = {
	args: {
		somatic: true,
		verbal: true,
		material: "небольшой кусочек фосфора",
	},
};

export const Somatic: Story = { args: { somatic: true } };

export const Verbal: Story = { args: { verbal: true } };

export const Material: Story = {
	args: { material: "небольшой кусочек фосфора" },
};

export const Editable: Story = {
	args: { material: "небольшой кусочек фосфора", editable: true },
};

export const EditableEmpty: Story = {
	args: { editable: true },
};

export const LongMaterial: Story = {
	args: {
		somatic: true,
		verbal: true,
		material: "немного святой воды и бриллианты, стоящие как минимум 25 000 зм, расходуемые заклинанием",
	},
	parameters: {
		layout: "padded",
		viewport: { defaultViewport: "mobile1" },
	},
};
