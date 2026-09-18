import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullArmor from "./FullArmor.svelte";
import type { FullArmorEntityLink, FullArmorViewModel } from "./FullArmorViewModel";

const source = {
	shortName: "ToH",
	name: "Фолиант героев",
	group: { shortName: "3rd", name: "Контент от третьих лиц" },
};

const stonesteel: FullArmorViewModel = {
	russianName: "Стальной доспех",
	englishName: "Stonesteel",
	entityLink: "/armors/stonesteel",
	armorType: "Тяжёлый доспех",
	armorClass: "19",
	price: "3000 зм",
	weight: "80 фун",
	source,
	stealthDisadvantage: true,
	strengthRequirement: 16,
	donningTime: "10 минут",
	doffingTime: "5 минут",
	description: {
		html: "<p>Изготовленная из сплава стали и кристаллического камня, эта уникальная форма пластинчатой брони представляет собой вершину искусства гномьей металлургии. Доспех состоит из накладывающихся друг на друга взаимосвязанных пластин, которые покрывают всё тело, и включает в себя перчатки, тяжёлые кожаные сапоги и шлем. Стальной доспех тяжёлый и несколько громоздкий, но обеспечивает превосходную защиту по сравнению со стандартным латным доспехом.</p><p>Надевание и снятие стального доспеха занимает в два раза больше времени, чем обычный латный доспех.</p>",
	},
};

const simpleArmor: FullArmorViewModel = {
	russianName: "Кожаный доспех",
	englishName: "Leather Armor",
	entityLink: "/armors/leather_armor",
	armorType: "Лёгкий доспех",
	armorClass: "11 + модификатор Лов",
	price: "10 зм",
	weight: "10 фун",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	donningTime: "1 минута",
	doffingTime: "1 минута",
	description: {
		html: "<p>Нагрудник и плечи этого доспеха изготовлены из кожи, вываренной в масле. Остальные части сделаны из более мягких и гибких материалов.</p>",
	},
};

const complexArmor: FullArmorViewModel = {
	russianName: "Доспех хранителя руин",
	englishName: "Ruins Guardian Armor",
	entityLink: "/armors/ruins_guardian_armor",
	armorType: "Средний доспех",
	armorClass: "15 + модификатор Лов (макс. 2)",
	price: "2500 зм",
	weight: "45 фун",
	source: {
		shortName: "HB",
		name: "Архив хранителей руин",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	stealthDisadvantage: true,
	strengthRequirement: 15,
	donningTime: "5 минут",
	doffingTime: "1 минута",
	description: {
		html: "<p>Этот доспех собирают из пластин, найденных в древних мастерских. Он совместим со <a href=\"/items/magic/guardian_crystal\">кристаллом хранителя</a>. Правила исследования приведены в <a href=\"/screens/exploration\">разделе путешествий</a>, дополнительные материалы доступны на <a href=\"https://www.dndbeyond.com\">внешнем сайте</a>, а примечания — в <a href=\"#notes\">локальном приложении</a>.</p><table><thead><tr><th>Условие</th><th>КД</th></tr></thead><tbody><tr><td>Обычное</td><td>15</td></tr><tr><td>С кристаллом</td><td>16</td></tr></tbody></table><p id=\"notes\">Пластины сохраняют следы прежних владельцев и едва слышно звенят рядом с древними механизмами.</p>",
	},
};

const meta = {
	title: "Components/FullArmor",
	component: FullArmor,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullArmor>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyArmor: (armor: FullArmorViewModel) => console.info("Copy armor", armor.entityLink),
	onEntityLinkClick: (link: FullArmorEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { armor: stonesteel, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { armor: stonesteel, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { armor: simpleArmor, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { armor: structuredClone(stonesteel), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { armor: complexArmor, ...callbacks, theme: "dark" },
};
