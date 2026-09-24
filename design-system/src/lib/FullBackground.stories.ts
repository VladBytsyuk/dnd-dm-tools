import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullBackground from "./FullBackground.svelte";
import type { FullBackgroundEntityLink, FullBackgroundViewModel } from "./FullBackgroundViewModel";

const sailor: FullBackgroundViewModel = {
	russianName: "Моряк",
	englishName: "Sailor",
	entityLink: "/backgrounds/sailor",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	skills: ["Атлетика", "Внимание"],
	toolOwnership: { html: "Инструменты навигатора, транспорт (водный)" },
	equipments: [
		{ html: "Кофель-нагель (дубинка [club])" },
		{ html: "50 футов шёлковой верёвки [silk rope]" },
		{ html: "Талисман, такой как кроличья лапка или камень с дыркой" },
		{ html: "Комплект обычной одежды [common clothes]" },
		{ html: "Поясной кошель [pouch] с 10 зм." },
	],
	startGold: 10,
	description: {
		html: "<p>Вы много лет плавали на морском судне. Вы видели могучие шторма, где волны охватывали корабль так, что хотели отправить вас на дно. Первая любовь осталась далеко за горизонтом, и настало время попробовать что-то новое.</p><h3>Поездка на корабле</h3><p>Если понадобится, вы можете получить бесплатную поездку на паруснике для себя и своих спутников. Вам оказывают услугу, поэтому вы не можете устанавливать распорядок и прокладывать маршрут.</p>",
	},
	personalization: {
		html: "<p>Моряки бывают грубыми, но на их плечах лежит груз ответственности за сохранение жизни экипажа. Жизнь на корабле формирует их взгляды и самые важные привычки.</p>",
	},
};

const simpleBackground: FullBackgroundViewModel = {
	russianName: "Послушник",
	englishName: "Acolyte",
	entityLink: "/backgrounds/acolyte",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	skills: [],
	toolOwnership: { html: "" },
	equipments: [],
	startGold: 0,
	description: { html: "<p>Вы провели жизнь в служении храму и его пастве.</p>" },
};

const complexBackground: FullBackgroundViewModel = {
	...structuredClone(sailor),
	russianName: "Следопыт Затонувших Архивов",
	englishName: "Sunken Archive Delver",
	entityLink: "/backgrounds/sunken_archive_delver",
	origin: "manual",
	homebrew: true,
	associatedUrl: "/backgrounds/fragment/sunken_archive_delver",
	source: {
		shortName: "HB",
		name: "Архивы Семи Приливов",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	skills: ["История", "Выживание", "Расследование"],
	toolOwnership: {
		html: "<a href=\"/items/divers_kit\">Набор ныряльщика</a> и инструменты картографа",
	},
	equipments: [
		{ html: "<a href=\"/items/rope\">Верёвка</a> длиной 50 футов" },
		{ html: "Водонепроницаемый журнал и пузырёк чернил" },
		{ html: "Амулет с символом утонувшей библиотеки" },
	],
	startGold: 25,
	associatedHtml: {
		html: "<p>Вы исследуете руины, скрытые под водой. Правила погружений приведены в <a href=\"/screens/exploration\">справочнике путешествий</a>, а заметки сообщества — на <a href=\"https://www.dndbeyond.com\">внешнем сайте</a> и в <a href=\"#notes\">примечании</a>.</p><table><thead><tr><th>Глубина</th><th>Находка</th></tr></thead><tbody><tr><td>10 м</td><td>Обломки карт</td></tr><tr><td>30 м</td><td>Запечатанный архив</td></tr></tbody></table><h3>Контакты</h3><p id=\"notes\">Вы всегда знаете, где найти моряка, готового обменять слух на услугу.</p>",
	},
	personalization: {
		html: "<p>Долгие погружения научили вас терпению и вниманию к мелочам.</p>",
	},
};

const meta = {
	title: "Items/FullBackground",
	component: FullBackground,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyBackground: (background: FullBackgroundViewModel) => console.info("Copy background", background.entityLink),
	onEntityLinkClick: (link: FullBackgroundEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { background: sailor, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { background: sailor, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { background: simpleBackground, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { background: structuredClone(sailor), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { background: complexBackground, ...callbacks, theme: "dark" },
};
