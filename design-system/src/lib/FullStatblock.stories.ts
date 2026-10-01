import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullStatblock from "./FullStatblock.svelte";
import type { FullStatblockViewModel } from "./FullStatblockViewModel";

const image = (color: string, label: string) =>
	`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><circle cx="64" cy="64" r="62" fill="#f8f4e7"/><circle cx="64" cy="64" r="48" fill="${color}"/><text x="64" y="72" fill="white" font-family="sans-serif" font-size="22" text-anchor="middle">${label}</text></svg>`)}`;

const ogremoch: FullStatblockViewModel = {
	russianName: "Огремох",
	englishName: "Ogremoch",
	entityLink: "/bestiary/ogremoch",
	challengeRating: 20,
	creatureType: "Громадный элементаль",
	source: {
		shortName: "PotA",
		name: "Принцы апокалипсиса",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	images: [image("#4d7c0f", "O")],
	size: "4×4 клетки или больше",
	alignment: "Нейтрально-злой",
	armorClass: "20 (природный доспех)",
	hitPoints: "526 (27к20 + 243)",
	speed: "50 фт., лазая 50 фт.",
	abilities: [
		{ label: "СИЛ", score: 28, modifier: 9 },
		{ label: "ЛОВ", score: 8, modifier: -1 },
		{ label: "ТЕЛ", score: 28, modifier: 9 },
		{ label: "ИНТ", score: 11, modifier: 0 },
		{ label: "МУД", score: 15, modifier: 2 },
		{ label: "ХАР", score: 22, modifier: 6 },
	],
	savingThrows: "Сил +14, Тел +15, Мдр +8",
	damageImmunities: "дробящий, колющий и рубящий урон от немагических атак",
	conditionImmunities: "очарование, испуг, паралич, окаменение, отравление",
	senses: "тёмное зрение 60 фт., пассивная Внимательность 17",
	languages: "Общий, Терран",
	experience: "25 000",
	proficiencyBonus: 6,
	traits: [
		{ title: "Усиленные удары", html: "<p>Размашистые удары Огремоха считаются магическими и адамантиновыми при преодолении сопротивления.</p>" },
		{ title: "Врождённое колдовство", html: "<p>Он может сотворить <a href=\"/spells/stone_shape\">создание камня</a> по желанию.</p>" },
	],
	actions: {
		title: "Действия",
		items: [
			{ title: "Мультиатака", html: "<p>Огремох совершает два Размашистых удара.</p>" },
			{ title: "Размашистый удар", html: "<p><em>Рукопашная атака оружием:</em> +14 к попаданию, досягаемость 15 фт.</p>" },
			{ title: "Призыв элементалей (1/день)", html: "<p>Огремох призывает до трёх элементалей земли.</p>" },
		],
	},
	legendaryActions: {
		title: "Легендарные действия",
		descriptionHtml: "<p>Огремох может совершить 3 легендарных действия, выбирая из вариантов ниже.</p>",
		items: [
			{ title: "Топот (2 действия)", html: "<p>Огремох топает ногой.</p>" },
			{ title: "Создание горгульи", html: "<p>Огремох призывает горгулью.</p>" },
		],
	},
	lair: {
		descriptionHtml: "<p>Огремох живёт в недрах Стихийного Плана Земли.</p>",
		actionsHtml: "<p>Огремох выбирает пещеру, где растут чёрные кристаллы.</p>",
	},
	descriptionHtml: "<p>Огремох — властелин земли и камня.</p>",
	tags: [{ title: "Именованные НИП", html: "<p>Используйте этот блок для уникальных персонажей.</p>" }],
};

const meta = {
	title: "Items/FullStatblock",
	component: FullStatblock,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullStatblock>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyStatblock: (statblock: FullStatblockViewModel) => console.info("Copy statblock", statblock.entityLink),
	onCopySpellLink: (link: { href: string; label: string }) => console.info("Copy spell link", link),
};

export const Default: Story = {
	args: { statblock: ogremoch, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { statblock: ogremoch, ...callbacks, theme: "light" },
};

export const WithoutImage: Story = {
	args: { statblock: { ...ogremoch, images: [] }, ...callbacks, theme: "dark" },
};
