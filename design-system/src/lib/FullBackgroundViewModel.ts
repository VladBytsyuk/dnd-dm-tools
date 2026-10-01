export type FullBackgroundOrigin = "remote" | "manual";

export type FullBackgroundSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullBackgroundHtmlContent = {
	html: string;
};

export type FullBackgroundEntityLink = {
	href: string;
	label: string;
};

export type FullBackgroundViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	source: FullBackgroundSource;
	skills: string[];
	toolOwnership: FullBackgroundHtmlContent;
	equipments: FullBackgroundHtmlContent[];
	startGold: number;
	description: FullBackgroundHtmlContent;
	origin?: FullBackgroundOrigin;
	homebrew?: boolean;
	associatedUrl?: string;
	associatedHtml?: FullBackgroundHtmlContent;
	personalization?: FullBackgroundHtmlContent;
};
