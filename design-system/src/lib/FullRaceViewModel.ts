export type FullRaceOrigin = "remote" | "manual";

export type FullRaceEntityLink = {
	href: string;
	label: string;
};

export type FullRaceHtmlContent = {
	html: string;
};

export type FullRaceType = {
	name: string;
	order?: number;
};

export type FullRaceSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullRaceAbility = {
	key: string;
	name: string;
	shortName: string;
	value: number;
};

export type FullRaceSpeed = {
	value?: number;
	name?: string;
	additional?: string;
};

export type FullRaceDarkvision = {
	distance?: number | string;
	unit?: string;
	html?: string;
};

export type FullRaceSkill = {
	name: string;
	html: string;
};

export type FullRaceAdditionalSection = {
	title: string;
	html: string;
};

export type FullRaceSubrace = FullRaceViewModel;

export type FullRaceViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	type: FullRaceType;
	source: FullRaceSource;
	abilities: FullRaceAbility[];
	size: string;
	speed: FullRaceSpeed[];
	skills: FullRaceSkill[];
	description: FullRaceHtmlContent;
	origin?: FullRaceOrigin;
	group?: FullRaceType;
	darkvision?: FullRaceDarkvision;
	additionalSections?: FullRaceAdditionalSection[];
	image?: string;
	subraces?: FullRaceSubrace[];
};
