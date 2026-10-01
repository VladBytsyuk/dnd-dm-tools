import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullArtifact from "./FullArtifact.svelte";
import type { FullArtifactEntityLink, FullArtifactViewModel } from "./FullArtifactViewModel";

const bookOfVileDarkness: FullArtifactViewModel = {
	russianName: "Книга мерзкой тьмы",
	englishName: "Book of Vile Darkness",
	entityLink: "/items/magic/book_of_vile_darkness",
	origin: "remote",
	type: { name: "Чудесный предмет", order: 8 },
	price: { dmg: null, xge: null },
	source: {
		shortName: "DMG",
		name: "Руководство мастера",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	rarity: { type: "artifact", name: "Артефакт", short: "А" },
	customization: true,
	cost: {
		dmg: "от 250 001 зм. до невозможно купить",
		xge: "невозможно купить",
	},
	images: ["https://img.ttg.club/item_magic/book_of_vile_darkness.webp"],
	description: {
		html: "<p>Содержимое этого отвратительного манускрипта — лакомый кусочек для тех, кто служит злу. Смертные не должны знать хранящиеся в нём тайны, они настолько ужасны, что один только взгляд на его страницы приводит к <a href=\"/screens/madness\">безумию</a>.</p><p>Большинство считает, что авторство Книги Мерзкой Тьмы принадлежит богу-личу <a href=\"/bestiary/Vecna\">Векне</a>. На её страницах он записал все свои больные идеи, все безумные мысли и все примеры самой чёрной магии, известные ему.</p><p>Книга была в руках и других злодеев, и многие дополняли её своими мыслями. Эти дополнения сразу видны, так как они либо вклеивали свои страницы, либо делали пометки на полях и между строк.</p>",
	},
};

const simpleArtifact: FullArtifactViewModel = {
	russianName: "Камень удачи",
	englishName: "Luckstone",
	entityLink: "/items/magic/luckstone",
	type: { name: "Чудесный предмет", order: 8 },
	price: { dmg: "40", xge: "10" },
	source: {
		shortName: "DMG",
		name: "Руководство мастера",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	rarity: { type: "uncommon", name: "Необычный", short: "Н" },
	description: { html: "<p>Этот гладкий камень приносит владельцу удачу, пока тот носит его при себе.</p>" },
};

const complexArtifact: FullArtifactViewModel = {
	russianName: "Амулет хранителя руин",
	englishName: "Ruins Guardian Amulet",
	entityLink: "/items/magic/ruins_guardian_amulet",
	origin: "manual",
	type: { name: "Чудесный предмет", order: 8 },
	price: { dmg: "500", xge: "900" },
	source: {
		shortName: "HB",
		name: "Архив хранителей руин",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	rarity: { type: "very-rare", name: "Очень редкий", short: "ОР" },
	customization: true,
	homebrew: true,
	detailType: [{ name: "Амулет", type: "амулет", url: "/items/magic/ruins_guardian_amulet" }],
	detailCustomization: ["Заклинателем"],
	cost: { dmg: "от 5 001 до 50 000 зм.", xge: "2к10 × 1 000 зм." },
	images: [
		"https://img.ttg.club/item_magic/dark-shard-amulet.webp",
		"https://img.ttg.club/item_magic/Wand_of_orcus.jpg",
	],
	description: {
		html: "<p>Амулет можно объединить с <a href=\"/items/magic/guardian_crystal\">кристаллом хранителя</a>. Правила исследования приведены в <a href=\"/screens/exploration\">разделе путешествий</a>; дополнительные материалы доступны на <a href=\"https://www.dndbeyond.com\">внешнем сайте</a> и в <a href=\"#notes\">примечании</a>.</p><table><thead><tr><th>Состояние руин</th><th>Бонус</th></tr></thead><tbody><tr><td>Спокойные</td><td>+1</td></tr><tr><td>Пробуждённые</td><td>+2</td></tr></tbody></table><p id=\"notes\">Амулет тускло светится рядом с древними защитными механизмами.</p>",
	},
};

const meta = {
	title: "Items/FullArtifact",
	component: FullArtifact,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullArtifact>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyArtifact: (artifact: FullArtifactViewModel) => console.info("Copy artifact", artifact.entityLink),
	onEntityLinkClick: (link: FullArtifactEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { artifact: bookOfVileDarkness, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { artifact: bookOfVileDarkness, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { artifact: simpleArtifact, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { artifact: structuredClone(bookOfVileDarkness), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { artifact: complexArtifact, ...callbacks, theme: "dark" },
};
