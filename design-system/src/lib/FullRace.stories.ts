import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullRace from "./FullRace.svelte";
import type { FullRaceEntityLink, FullRaceViewModel } from "./FullRaceViewModel";

const aasimar: FullRaceViewModel = {
	russianName: "Аасимар",
	englishName: "Aasimar",
	entityLink: "/races/aasimar",
	type: { name: "Гуманоид" },
	source: {
		shortName: "VGM",
		name: "Справочник Воло по монстрам",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	abilities: [{ key: "CHARISMA", name: "Харизма", shortName: "Хар", value: 2 }],
	size: "Средний",
	speed: [{ value: 30 }],
	darkvision: { distance: 30, unit: "фт.", html: "Вы видите в тусклом свете в пределах 30 футов." },
	skills: [
		{
			name: "Небесное сопротивление",
			html: "<p>У вас есть сопротивление к урону некротической энергией и излучением.</p>",
		},
		{
			name: "Исцеляющие руки",
			html: "<p>В качестве действия вы можете коснуться существа и восстановить ему количество хитов, равное вашему уровню.</p>",
		},
		{
			name: "Языки",
			html: "<p>Вы можете разговаривать, читать и писать на Общем и Небесном языках.</p>",
		},
		{
			name: "Несущий свет",
			html: "<p>Вам известен заговор <a href=\"/spells/light\">свет</a>.</p>",
		},
	],
	description: {
		html: "<p>Аасимары несут в себе дух небесного света. Они происходят от людей, осенённых силой Гор Селестии, божественных чертогов многих законно-добрых божеств.</p><h3>Поборники небес</h3><p>Аасимары пришли в мир, чтобы служить защитниками добра и закона. Их покровители ожидают, что они будут бороться со злом и служить примером окружающим.</p><h3>Скрытные странники</h3><p>Несмотря на то, что аасимары — резкие противники зла, они предпочитают вести себя сдержанно.</p>",
	},
	additionalSections: [
		{ title: "Имена", html: "<p>Аасимары используют имена культур, среди которых выросли.</p>" },
		{ title: "Мировоззрение", html: "<p>Большинство аасимаров склоняется к добру.</p>" },
	],
	image: "https://img.ttg.club/races/background/race-aasimar.webp",
	subraces: [
		{
			russianName: "Аасимар (защитник)",
			englishName: "Protector",
			entityLink: "/races/aasimar/protector",
			type: { name: "Гуманоид" },
			source: {
				shortName: "VGM",
				name: "Справочник Воло по монстрам",
				group: { shortName: "Basic", name: "Официальные источники" },
			},
			abilities: [{ key: "WISDOM", name: "Мудрость", shortName: "Мдр", value: 1 }],
			size: "Средний",
			speed: [{ value: 30 }],
			skills: [],
			description: { html: "<p>Ваши крылья воплощают сияние небесного покровителя.</p>" },
		},
		{
			russianName: "Аасимар (каратель)",
			englishName: "Scourge",
			entityLink: "/races/aasimar/scourge",
			type: { name: "Гуманоид" },
			source: {
				shortName: "VGM",
				name: "Справочник Воло по монстрам",
				group: { shortName: "Basic", name: "Официальные источники" },
			},
			abilities: [{ key: "CONSTITUTION", name: "Телосложение", shortName: "Тел", value: 1 }],
			size: "Средний",
			speed: [{ value: 30 }],
			skills: [],
			description: { html: "<p>Ваша душа пылает внутренним светом.</p>" },
		},
	],
};

const simpleRace: FullRaceViewModel = {
	russianName: "Человек",
	englishName: "Human",
	entityLink: "/races/human",
	type: { name: "Гуманоид" },
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	abilities: [],
	size: "",
	speed: [],
	skills: [],
	description: { html: "<p>Люди стремятся к достижениям и оставляют свой след в мире.</p>" },
};

const complexRace: FullRaceViewModel = {
	...structuredClone(aasimar),
	russianName: "Эфирнорождённый",
	englishName: "Aetherborn",
	entityLink: "/races/aetherborn",
	origin: "manual",
	type: { name: "Гуманоид", order: 3 },
	group: { name: "Наследия Семи Приливов", order: 2 },
	source: {
		shortName: "HB",
		name: "Архив Эфирных Врат",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	abilities: [
		{ key: "CHARISMA", name: "Харизма", shortName: "Хар", value: 2 },
		{ key: "DEXTERITY", name: "Ловкость", shortName: "Лов", value: 1 },
	],
	speed: [{ value: 30 }, { name: "Плавание", value: 20 }, { name: "Полёт", value: 30, additional: "на 3-м уровне" }],
	darkvision: { distance: 60, unit: "фт.", html: "<p>Тёмное зрение позволяет вам различать формы в темноте.</p>" },
	skills: [
		{
			name: "Эфирный шаг",
			html: "<p>Вы можете пройти сквозь тонкую завесу. См. <a href=\"/screens/exploration\">правила исследования</a> и <a href=\"https://www.dndbeyond.com\">внешний источник</a>.</p>",
		},
		{
			name: "Глас прилива",
			html: "<p>Вы знаете язык глубин и можете общаться с существами воды.</p>",
		},
	],
	description: {
		html: "<p>Эфирнорождённые появляются там, где море соприкасается с магическими разломами.</p><table><thead><tr><th>Прилив</th><th>Дар</th></tr></thead><tbody><tr><td>Низкий</td><td>Плавание</td></tr><tr><td>Высокий</td><td>Полёт</td></tr></tbody></table><p>Они хранят истории в раковинах и делятся ими у береговых костров.</p>",
	},
	additionalSections: [
		{ title: "Имена", html: "<p>Имена часто состоят из звука волны и имени предка.</p>" },
		{ title: "Поселения", html: "<p>Небольшие общины строят дома на скалах у эфирных течений.</p>" },
	],
	subraces: [
		{
			...structuredClone(aasimar.subraces![0]),
			russianName: "Береговой эфирнорождённый",
			englishName: "Shoreborn",
			entityLink: "/races/aetherborn/shoreborn",
			subraces: [
				{
					...structuredClone(aasimar.subraces![0]),
					russianName: "Лунный береговой",
					englishName: "Moon Shoreborn",
					entityLink: "/races/aetherborn/shoreborn/moon",
				},
			],
		},
	],
};

const meta = {
	title: "Items/FullRace",
	component: FullRace,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullRace>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyRace: (race: FullRaceViewModel) => console.info("Copy race", race.entityLink),
	onEntityLinkClick: (link: FullRaceEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { race: aasimar, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { race: aasimar, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { race: simpleRace, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { race: structuredClone(aasimar), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { race: complexRace, ...callbacks, theme: "dark" },
};
