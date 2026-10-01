import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FullFeat from "./FullFeat.svelte";
import type { FullFeatEntityLink, FullFeatViewModel } from "./FullFeatViewModel";

const diplomat: FullFeatViewModel = {
	russianName: "Дипломат",
	englishName: "Diplomat",
	entityLink: "/feats/diplomat",
	requirements: "Нет",
	source: {
		shortName: "UAFFS",
		name: "Unearthed Arcana: Черты для навыков",
		group: { shortName: "UA", name: "Тестовый материал" },
	},
	description: {
		html: "<p>Вы изучили искусство дипломатии, получив следующие преимущества:</p><ul><li>Увеличьте значение Харизмы на 1, при максимуме 20.</li><li>Вы получаете навык <a href=\"/screens/skills\">Убеждение</a>. Если вы уже владеете этим навыком, то бонус мастерства удваивается при проверке этого навыка.</li><li>Если вы потратите 1 минуту на разговор с тем, кто вас понимает, вы можете совершить проверку Харизмы (Убеждения) против броска Мудрости (Проницательности).</li></ul>",
	},
};

const simpleFeat: FullFeatViewModel = {
	russianName: "Меткий стрелок",
	englishName: "Sharpshooter",
	entityLink: "/feats/sharpshooter",
	requirements: "Нет",
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Официальные источники" },
	},
	description: { html: "<p>Вы овладели дальнобойным оружием и можете делать выстрелы, которые другим кажутся невозможными.</p>" },
};

const editableFeat: FullFeatViewModel = {
	...structuredClone(diplomat),
	russianName: "Вдохновляющий лидер",
	englishName: "Inspiring Leader",
	entityLink: "/feats/inspiring-leader",
	requirements: "Харизма 13 или выше",
};

const complexFeat: FullFeatViewModel = {
	russianName: "Посвящённый хранителей руин",
	englishName: "Ruins Keepers Initiate",
	entityLink: "/feats/ruins_keepers_initiate",
	origin: "manual",
	requirements: "Интеллект или Мудрость 13 или выше, владение навыком История",
	source: {
		shortName: "HB",
		name: "Архив хранителей руин",
		group: { shortName: "Homebrew", name: "Авторские материалы" },
		homebrew: true,
	},
	homebrew: true,
	description: {
		html: "<p>Вы изучили тайные знаки древних стражей. Правила исследований приведены в <a href=\"/screens/exploration\">разделе путешествий</a>; дополнительные материалы доступны на <a href=\"https://www.dndbeyond.com\">внешнем сайте</a> и в <a href=\"#notes\">примечании</a>.</p><table><thead><tr><th>Состояние руин</th><th>Преимущество</th></tr></thead><tbody><tr><td>Спокойные</td><td>Проверка Истории с преимуществом</td></tr><tr><td>Пробуждённые</td><td>Вы знаете ближайший выход</td></tr></tbody></table><p id=\"notes\">После продолжительного отдыха вы можете восстановить один расходованный знак хранителя.</p>",
	},
};

const meta = {
	title: "Items/FullFeat",
	component: FullFeat,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FullFeat>;

export default meta;
type Story = StoryObj<typeof meta>;

const callbacks = {
	onCopyFeat: (feat: FullFeatViewModel) => console.info("Copy feat", feat.entityLink),
	onEntityLinkClick: (link: FullFeatEntityLink) => console.info("Open entity", link),
};

export const Dark: Story = {
	args: { feat: diplomat, ...callbacks, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { feat: diplomat, ...callbacks, theme: "light" },
};

export const Simple: Story = {
	args: { feat: simpleFeat, ...callbacks, theme: "dark" },
};

export const Edit: Story = {
	args: { feat: structuredClone(editableFeat), ...callbacks, editable: true, theme: "dark" },
};

export const Complex: Story = {
	args: { feat: complexFeat, ...callbacks, theme: "dark" },
};
