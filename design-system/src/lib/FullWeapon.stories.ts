import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullWeapon from "./FullWeapon.svelte";
import type { FullWeaponEntityLink, FullWeaponViewModel } from "./FullWeaponViewModel";

const source = {
	shortName: "ToH",
	name: "Фолиант героев",
	group: { shortName: "3rd", name: "Контент от третьих лиц" },
};

const bargePole: FullWeaponViewModel = {
	russianName: "Баржевое весло",
	englishName: "Barge pole",
	entityLink: "/weapons/barge_pole",
	weaponType: "Простое рукопашное",
	damage: "1к6 дробящий",
	price: "1 см",
	weight: "5 фун",
	source,
	properties: [
		{ name: "Досягаемость", url: "/screens/reach", description: { html: "<p>Дистанция атаки увеличивается на 5 футов.</p>" } },
		{ name: "Особое", url: "/screens/special", description: { html: "<p>Особые правила описаны в справочнике.</p>" } },
		{ name: "Двуручное", url: "/screens/two_handed", description: { html: "<p>Оружие держат двумя руками.</p>" } },
	],
	description: {
		html: "<p>Баржевое весло имеют длину около 10 футов с заглушкой на одном конце и зубцом на другом. В основном используется для перемещения или управления баржами по воде, раздвоенный зубец на одном конце предотвращает погружение шеста в ил в русле реки.</p>",
	},
	special: {
		html: "<p>Баржевые весла можно использовать как дробящее оружие или использовать для нанесения ударов зубцом на 1к4 колющего урона.</p>",
	},
};

const simpleWeapon: FullWeaponViewModel = {
	russianName: "Булава",
	englishName: "Mace",
	entityLink: "/weapons/mace",
	weaponType: "Простое рукопашное",
	damage: "1к6 дробящий",
	price: "5 зм",
	weight: "4 фун",
	source: { shortName: "PHB", name: "Книга игрока", group: { shortName: "Basic", name: "Официальные источники" } },
	properties: [],
	description: { html: "<p>Булава — короткодревковое ударно-дробящее холодное оружие.</p>" },
};

const complexWeapon: FullWeaponViewModel = {
	russianName: "Духовая трубка",
	englishName: "Blowgun",
	entityLink: "/weapons/blowgun",
	weaponType: "Воинское дальнобойное",
	damage: "1 колющий",
	price: "10 зм",
	weight: "1 фун",
	source: {
		shortName: "HB",
		name: "Архив сигильной магии",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	properties: [
		{ name: "Боеприпас", distance: "25/100", url: "/screens/ammunition", description: { html: "<p>Для атаки нужны боеприпасы.</p>" } },
		{ name: "Перезарядка", url: "/screens/loading", description: { html: "<p>За действие можно сделать только один выстрел.</p>" } },
	],
	description: {
		html: "<p>Может стрелять <a href=\"/items/blowgun_needles\">иглами для трубки</a>. Подробнее смотрите в <a href=\"/screens/ammunition\">правилах боеприпасов</a>, на <a href=\"https://www.dndbeyond.com\">внешнем сайте</a> и по <a href=\"#appendix\">локальной ссылке</a>.</p><table><thead><tr><th>Дистанция</th><th>Помеха</th></tr></thead><tbody><tr><td>25 футов</td><td>Нет</td></tr><tr><td>100 футов</td><td>Да</td></tr></tbody></table>",
	},
	special: { html: "<p>Иглы для трубки продаются комплектами по 50 штук.</p>" },
};

const meta = {
	title: "Components/FullWeapon",
	component: FullWeapon,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullWeapon>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyWeapon: (weapon: FullWeaponViewModel) => console.info("Copy weapon", weapon.entityLink),
	onEntityLinkClick: (link: FullWeaponEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { weapon: bargePole, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { weapon: bargePole, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { weapon: simpleWeapon, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { weapon: structuredClone(bargePole), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { weapon: complexWeapon, ...callbacks, theme: "dark" },
};
