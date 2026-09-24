export type FullStatblockSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullStatblockAbility = {
	label: string;
	score: string | number;
	modifier?: string | number;
};

export type FullStatblockRichTextItem = {
	title: string;
	html: string;
};

export type FullStatblockActionSection = {
	title: string;
	descriptionHtml?: string;
	items: FullStatblockRichTextItem[];
};

export type FullStatblockLair = {
	descriptionHtml?: string;
	actionsHtml?: string;
	regionalEffectsHtml?: string;
};

export type FullStatblockSpellLink = {
	href: string;
	label: string;
};

export type FullStatblockViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	challengeRating: string | number;
	creatureType: string;
	source?: FullStatblockSource;
	images?: string[];
	imageAlt?: string;
	size?: string;
	alignment?: string;
	armorClass?: string | number;
	hitPoints?: string;
	speed?: string;
	abilities?: FullStatblockAbility[];
	savingThrows?: string;
	skills?: string;
	damageVulnerabilities?: string;
	damageResistances?: string;
	damageImmunities?: string;
	conditionImmunities?: string;
	senses?: string;
	languages?: string;
	experience?: string | number;
	proficiencyBonus?: string | number;
	traits?: FullStatblockRichTextItem[];
	actions?: FullStatblockActionSection;
	bonusActions?: FullStatblockActionSection;
	reactions?: FullStatblockActionSection;
	legendaryActions?: FullStatblockActionSection;
	mythicActions?: FullStatblockActionSection;
	lair?: FullStatblockLair;
	descriptionHtml?: string;
	tags?: FullStatblockRichTextItem[];
	environment?: string[];
};
