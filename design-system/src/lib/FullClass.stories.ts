import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullClass from "./FullClass.svelte";
import type { FullClassEntityLink, FullClassViewModel } from "./FullClassViewModel";

const paladin: FullClassViewModel = {
	id: 6,
	russianName: "Паладин",
	englishName: "Paladin",
	entityLink: "/classes/paladin",
	dice: "к10",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	isArchetype: false,
	archetypes: [
		{
			russianName: "Клятва Мести",
			englishName: "Vengeance",
			entityLink: "/classes/paladin/vengeance",
			source: { shortName: "PHB", name: "Книга игрока", group: { shortName: "Basic", name: "Официальные источники" } },
		},
		{
			russianName: "Клятва Преданности",
			englishName: "Devotion",
			entityLink: "/classes/paladin/devotion",
			source: { shortName: "PHB", name: "Книга игрока", group: { shortName: "Basic", name: "Официальные источники" } },
		},
		{
			russianName: "Клятва Покорения",
			englishName: "Conquest",
			entityLink: "/classes/paladin/conquest",
			source: { shortName: "XGE", name: "Руководство Занатара обо всём", group: { shortName: "Basic", name: "Официальные источники" } },
		},
		{
			russianName: "Клятва Искупления",
			englishName: "Redemption",
			entityLink: "/classes/paladin/redemption",
			source: { shortName: "XGE", name: "Руководство Занатара обо всём", group: { shortName: "Basic", name: "Официальные источники" } },
		},
	],
	progression: {
		columns: [
			{ key: "spell-one", label: "1" },
			{ key: "spell-two", label: "2" },
			{ key: "spell-three", label: "3" },
		],
		levels: [
			{ level: 1, proficiencyBonus: 2, features: ["Божественное чувство", "Наложение рук"], values: { "spell-one": "—", "spell-two": "—", "spell-three": "—" } },
			{ level: 2, proficiencyBonus: 2, features: ["Боевой стиль", "Использование заклинаний"], values: { "spell-one": 2, "spell-two": "—", "spell-three": "—" } },
			{ level: 3, proficiencyBonus: 2, features: ["Божественное здоровье"], values: { "spell-one": 3, "spell-two": "—", "spell-three": "—" } },
			{ level: 4, proficiencyBonus: 2, features: ["Увеличение характеристик"], values: { "spell-one": 3, "spell-two": "—", "spell-three": "—" } },
			{ level: 5, proficiencyBonus: 3, features: ["Дополнительная атака"], values: { "spell-one": 4, "spell-two": 2, "spell-three": "—" } },
		],
	},
	proficiencies: {
		armor: "Все виды доспехов, щиты",
		weapons: "Простое и воинское оружие",
		savingThrows: "Мудрость, Харизма",
		tools: "Инструменты пивовара",
		skills: { choose: 2, options: ["Атлетика", "Запугивание", "Медицина", "Проницательность", "Религия", "Убеждение"] },
	},
	equipment: {
		html: "<p>Вы начинаете со следующим снаряжением в дополнение к снаряжению, получаемому за вашу предысторию:</p><ul><li>а) воинское оружие и <a href=\"/armors/shield\">щит [shield]</a> или б) два воинских оружия</li><li>а) пять <a href=\"/weapons/javelin\">метательных копий [javelin]</a> или б) любое простое рукопашное оружие</li><li>а) <a href=\"/items/priest-pack\">набор священника [priest's pack]</a> или б) <a href=\"/items/explorer-pack\">набор путешественника [explorer's pack]</a></li><li><a href=\"/armors/chain-mail\">кольчуга [chain mail]</a> и священный символ</li></ul><p>В качестве альтернативы вы можете получить 5к4 × 10 зм. монеты и приобрести себе <a href=\"/items\">снаряжение</a> самостоятельно.</p>",
	},
	features: [
		{
			id: "divine-sense",
			name: "Божественное чувство",
			level: 1,
			source: { shortName: "PHB", name: "Книга игрока" },
			html: "<p>Присутствие сильного зла воспринимается вашими чувствами как неприятный запах, а могущественное добро звучит как небесная музыка в ваших ушах.</p>",
		},
		{
			id: "lay-on-hands",
			name: "Наложение рук",
			level: 1,
			source: { shortName: "PHB", name: "Книга игрока" },
			html: "<p>Ваше благословенное касание может лечить раны. Запас целительной силы восстанавливается после <a href=\"/screens/long-rest\">продолжительного отдыха</a>.</p>",
		},
	],
};

const simpleClass: FullClassViewModel = {
	russianName: "Воин",
	englishName: "Fighter",
	entityLink: "/classes/fighter",
	dice: "к10",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	isArchetype: false,
	associatedContent: { html: "<p>Воин сочетает боевую подготовку с выносливостью и тактическим мышлением.</p>" },
};

const complexClass: FullClassViewModel = {
	...structuredClone(paladin),
	id: 906,
	russianName: "Клятва Приливов",
	englishName: "Oath of Tides",
	entityLink: "/classes/paladin/oath-of-tides",
	origin: "manual",
	isArchetype: true,
	parentClassUrl: "/classes/paladin",
	archetypeType: { name: "Homebrew", order: 5 },
	associatedUrl: "/classes/fragment/paladin/oath-of-tides",
	images: ["https://img.ttg.club/classes/background/class-paladin.webp"],
	source: {
		shortName: "HB",
		name: "Архив Семи Приливов",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	progression: {
		columns: [
			{ key: "spell-one", label: "1" },
			{ key: "spell-two", label: "2" },
			{ key: "spell-three", label: "3" },
			{ key: "tide", label: "Прилив", prefix: "+" },
		],
		levels: [
			{ level: 1, proficiencyBonus: 2, features: ["Зов прилива"], values: { "spell-one": "—", "spell-two": "—", "spell-three": "—", tide: 1 } },
			{ level: 2, proficiencyBonus: 2, features: ["Морской обет"], values: { "spell-one": 2, "spell-two": "—", "spell-three": "—", tide: 1 } },
			{ level: 3, proficiencyBonus: 2, features: ["Клятва Приливов"], values: { "spell-one": 3, "spell-two": "—", "spell-three": "—", tide: 2 } },
		],
	},
	equipment: {
		html: "<p>Вы носите амулет из морского стекла. Подробнее см. <a href=\"/screens/exploration\">правила путешествий</a>, <a href=\"https://www.dndbeyond.com\">внешний источник</a> и <a href=\"#notes\">примечание</a>.</p><table><thead><tr><th>Прилив</th><th>Дар</th></tr></thead><tbody><tr><td>Высокий</td><td>Плавание</td></tr><tr><td>Отлив</td><td>Проницательность</td></tr></tbody></table><p id=\"notes\">Амулет светится рядом с порталами.</p>",
	},
	features: [
		{
			id: "tide-call",
			name: "Зов прилива",
			levelLabel: "3 уровень",
			source: { shortName: "HB", name: "Архив Семи Приливов" },
			html: "<p>Вы можете призвать волну, которая переносит союзника на 10 футов.</p>",
			archetypeFeature: true,
		},
		{
			id: "saltward",
			name: "Соляной оберег",
			level: 7,
			source: { shortName: "HB", name: "Архив Семи Приливов" },
			html: "<p>Союзники рядом с вами получают сопротивление урону холодом.</p>",
			optional: true,
			archetypeFeature: true,
		},
	],
};

const meta = {
	title: "Items/FullClass",
	component: FullClass,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullClass>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyClass: (characterClass: FullClassViewModel) => console.info("Copy class", characterClass.entityLink),
	onEntityLinkClick: (link: FullClassEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { characterClass: paladin, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { characterClass: paladin, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { characterClass: simpleClass, ...callbacks, theme: "dark" },
};

export const Complex: Story = {
	args: { characterClass: complexClass, ...callbacks, theme: "dark" },
};
