import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullSpell from "./FullSpell.svelte";
import type { FullSpellEntityLink, FullSpellViewModel } from "./FullSpellViewModel";

const source = {
	shortName: "PHB",
	name: "Книга игрока",
	group: { shortName: "Basic", name: "Официальные источники" },
};

const wallOfFlame: FullSpellViewModel = {
	russianName: "Огненная стена",
	englishName: "Wall of flame",
	entityLink: "/spells/wall_of_flame",
	level: 4,
	school: "Воплощение",
	components: {
		verbal: true,
		somatic: true,
		material: "небольшой кусочек фосфора",
	},
	source,
	concentration: true,
	range: "120 футов",
	duration: "вплоть до 1 минуты",
	time: "1 действие",
	classes: [{ name: "Волшебник", url: "/classes/wizard" }],
	description: {
		html: "<p>Вы создаёте стену из огня на твёрдой поверхности в пределах дистанции. Вы можете создать стену до 60 футов в длину, 20 футов в высоту и 1 фут толщиной, или замкнутой кольцом стеной до 20 футов диаметром.</p><p>Стена непрозрачная и существует, пока активно заклинание. Когда стена появляется, все существа в её области должны совершить спасбросок <em>Ловкости</em>. При провале они получают 5к8 урона огнём или половину этого урона при успехе.</p><p>Одна сторона стены, выбранная при накладывании заклинания, причиняет 5к8 урона огнём всем существам, оканчивающим ход в пределах 10 футов от этой стороны или внутри стены.</p><p>Существа получают такой же урон, когда впервые за ход входят в стену или оканчивают там ход. Другая сторона стены не причиняет урон.</p>",
	},
	higherLevels: {
		html: "<p>Если вы накладываете это заклинание, используя ячейку 5 уровня или выше, урон увеличивается на 1к8 за каждый уровень ячейки выше четвёртого.</p>",
	},
};

const simpleSpell: FullSpellViewModel = {
	russianName: "Свет",
	englishName: "Light",
	entityLink: "/spells/light",
	level: 0,
	school: "Воплощение",
	components: { verbal: true },
	source,
	range: "Касание",
	duration: "1 час",
	time: "1 действие",
	description: { html: "<p>Вы касаетесь одного предмета, и он начинает излучать яркий свет.</p>" },
};

const complexSpell: FullSpellViewModel = {
	russianName: "Круг телепортации",
	englishName: "Teleportation circle",
	entityLink: "/spells/teleportation_circle",
	level: 5,
	school: "Вызов",
	additionalType: "Рунная магия",
	components: {
		verbal: true,
		somatic: true,
		material: "редкие мелки и чернила с драгоценными камнями стоимостью 50 зм, расходуемые заклинанием",
	},
	source: {
		shortName: "HB",
		name: "Архив сигильной магии",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	concentration: true,
	ritual: true,
	range: "10 футов",
	duration: "до 1 минуты",
	time: "1 минута",
	classes: [
		{ name: "Бард", url: "/classes/bard" },
		{ name: "Волшебник", url: "/classes/wizard" },
		{ name: "Чародей", url: "/classes/sorcerer" },
	],
	subclasses: [
		{ name: "Круг земли", url: "/classes/druid/land", parentClass: "Друид" },
		{ name: "Архифея", url: "/classes/warlock/archfey", parentClass: "Колдун" },
	],
	description: {
		html: "<p>Вы чертите круг, связывающий ваше местоположение с постоянным кругом телепортации. Подробнее смотрите в разделе <a href=\"/screens/teleportation\">телепортация</a> или на <a href=\"https://www.dndbeyond.com\">внешнем справочном сайте</a>.</p><table><thead><tr><th>к100</th><th>Исход</th></tr></thead><tbody><tr><td>01–50</td><td>Точная цель</td></tr><tr><td>51–100</td><td>Случайный известный круг</td></tr></tbody></table>",
	},
	higherLevels: {
		html: "<p>При использовании ячейки более высокого уровня круг остаётся активным ещё один раунд за каждый дополнительный уровень.</p>",
	},
};

const meta = {
	title: "Components/FullSpell",
	component: FullSpell,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullSpell>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopySpell: (spell: FullSpellViewModel) => console.info("Copy spell", spell.entityLink),
	onEntityLinkClick: (link: FullSpellEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { spell: wallOfFlame, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { spell: wallOfFlame, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { spell: simpleSpell, ...callbacks, theme: "dark" },
};

export const Complex: Story = {
	args: { spell: complexSpell, ...callbacks, theme: "dark" },
};
