import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullDmScreen from "./FullDmScreen.svelte";

const source = {
	shortName: "PHB",
	name: "Книга игрока",
	group: { shortName: "Basic", name: "Официальные источники" },
};
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="340" cy="72" r="42" fill="white"/><path d="M282 144 210 192l-74-20-16 38 98 32 58-34-34 102-62 40 20 34 83-48 37-90 62 68 13 120h42l-4-139-84-100 20-47 46 30 72 3 1-40-60-3-90-56a50 50 0 0 0-56 6Z" fill="white"/></svg>`;
const html = `<p><em>Стоимость движения: 5 футов за перемещение на 5 футов</em></p><p>Если у вас есть несколько скоростей, например, скорость ходьбы и скорость полёта, вы можете переключаться между ними во время перемещения.</p><hr><p>Вы можете проходить сквозь пространство невраждебных существ.</p><p>Пространство других существ является для вас труднопроходимой местностью.</p><hr><p>Сквозь пространство враждебного существа можно пройти только если его размер как минимум на две категории больше или меньше вашего.</p>`;

const meta = {
	title: "Items/FullDmScreen",
	component: FullDmScreen,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullDmScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		russianName: "Перемещение",
		englishName: "Moving",
		entityLink: "/screens/moving",
		section: "Движение",
		source,
		icon,
		html,
		theme: "dark",
		onEntityLinkClick: (link) => console.info("Open linked entry", link.href),
	},
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...Default.args, theme: "light" },
};

export const WithoutImage: Story = {
	args: { ...Default.args, icon: undefined, theme: "dark" },
};
