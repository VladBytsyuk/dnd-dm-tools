export type FullFeatOrigin = "remote" | "manual";

export type FullFeatSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullFeatHtmlContent = {
	html: string;
};

export type FullFeatEntityLink = {
	href: string;
	label: string;
};

export type FullFeatViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	requirements: string;
	source: FullFeatSource;
	description: FullFeatHtmlContent;
	origin?: FullFeatOrigin;
	homebrew?: boolean;
};
