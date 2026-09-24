import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullEquipment from "./FullEquipment.svelte";
import type { FullEquipmentEntityLink, FullEquipmentViewModel } from "./FullEquipmentViewModel";

const woodcarversTools: FullEquipmentViewModel = {
	russianName: "Инструменты резчика по дереву",
	englishName: "Woodcarver's Tools",
	entityLink: "/items/woodcarver's_tools",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	categories: ["Инструменты ремесленников"],
	price: "1 зм",
	weight: 5,
	description: {
		html: "<p>Инструменты резчика по дереву позволяют вам создавать сложные предметы из дерева, такие как деревянные фигурки или стрелы.</p><p>Компоненты. Инструменты резчика по дереву включают в себя нож, стамеску и маленькую пилу.</p><p>Магия, История. Ваш опыт даёт вам дополнительные знания при осмотре деревянных предметов, таких как статуэтки или стрелы.</p><p>Природа. Ваши познания о древесине дают вам дополнительные знания, когда вы изучаете деревья.</p><p>Починка. Как часть <a href=\"/screens/rest\">короткого отдыха</a> вы можете починить один повреждённый деревянный предмет.</p><p>Сделать стрелы. Как часть <a href=\"/screens/rest\">короткого отдыха</a> вы можете сделать до пяти стрел.</p>",
	},
};

const simpleEquipment: FullEquipmentViewModel = {
	russianName: "Мешочек",
	englishName: "Pouch",
	entityLink: "/items/pouch",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	categories: ["Снаряжение"],
	description: { html: "<p>Небольшой мешочек из ткани или кожи, который можно использовать для хранения мелких предметов.</p>" },
};

const complexEquipment: FullEquipmentViewModel = {
	russianName: "Набор алхимика исследователя",
	englishName: "Explorer's Alchemist Kit",
	entityLink: "/items/explorer_alchemist_kit",
	source: {
		shortName: "HB",
		name: "Архив сигильной магии",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	categories: ["Снаряжение", "Инструменты ремесленников"],
	price: "75 зм",
	weight: 8,
	homebrew: true,
	description: {
		html: "<p>Набор содержит реагенты для полевых опытов. Его можно объединить с <a href=\"/items/alchemists_fire\">огнём алхимика</a>; правила смешивания перечислены в <a href=\"/screens/crafting\">справочнике</a>. Дополнительные идеи есть на <a href=\"https://www.dndbeyond.com\">внешнем сайте</a> и в <a href=\"#notes\">локальном примечании</a>.</p><table><thead><tr><th>Реагент</th><th>Запасов</th></tr></thead><tbody><tr><td>Кислота</td><td>2</td></tr><tr><td>Соль</td><td>4</td></tr></tbody></table><p id=\"notes\">После каждого путешествия восполняйте расходные материалы.</p>",
	},
};

const meta = {
	title: "Items/FullEquipment",
	component: FullEquipment,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullEquipment>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyEquipment: (equipment: FullEquipmentViewModel) => console.info("Copy equipment", equipment.entityLink),
	onEntityLinkClick: (link: FullEquipmentEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { equipment: woodcarversTools, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { equipment: woodcarversTools, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { equipment: simpleEquipment, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { equipment: structuredClone(woodcarversTools), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { equipment: complexEquipment, ...callbacks, theme: "dark" },
};
