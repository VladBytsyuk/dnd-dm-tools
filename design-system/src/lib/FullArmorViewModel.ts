export type FullArmorSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullArmorHtmlContent = {
	html: string;
};

export type FullArmorEntityLink = {
	href: string;
	label: string;
};

export type FullArmorViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	armorType: string;
	armorClass: string;
	price: string;
	weight: string;
	source: FullArmorSource;
	stealthDisadvantage?: boolean;
	strengthRequirement?: number;
	donningTime: string;
	doffingTime: string;
	description?: FullArmorHtmlContent;
};
