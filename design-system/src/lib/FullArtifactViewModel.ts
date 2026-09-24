export type FullArtifactOrigin = "remote" | "manual";

export type FullArtifactType = {
	name: string;
	order?: number;
};

export type FullArtifactPrice = {
	dmg: string | null;
	xge: string | null;
};

export type FullArtifactSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullArtifactRarity = {
	type: string;
	name: string;
	short: string;
};

export type FullArtifactDetailType = {
	name: string;
	type: string;
	url: string | null;
};

export type FullArtifactHtmlContent = {
	html: string;
};

export type FullArtifactEntityLink = {
	href: string;
	label: string;
};

export type FullArtifactViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	origin?: FullArtifactOrigin;
	type: FullArtifactType;
	price: FullArtifactPrice;
	source: FullArtifactSource;
	rarity: FullArtifactRarity;
	customization?: boolean;
	homebrew?: boolean;
	description: FullArtifactHtmlContent;
	detailType?: FullArtifactDetailType[];
	cost?: FullArtifactPrice;
	images?: string[];
	detailCustomization?: string[];
};
