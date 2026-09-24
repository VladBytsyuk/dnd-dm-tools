export type FullClassOrigin = "remote" | "manual";

export type FullClassSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullClassHtmlContent = {
	html: string;
};

export type FullClassEntityLink = {
	href: string;
	label: string;
};

export type FullClassArchetypeType = {
	name: string;
	order: number;
};

export type FullClassArchetype = {
	russianName: string;
	englishName?: string;
	entityLink: string;
	source: FullClassSource;
	type?: FullClassArchetypeType;
};

export type FullClassProficiencies = {
	armor?: string;
	weapons?: string;
	tools?: string;
	savingThrows?: string;
	skills?: {
		choose: number;
		options: string[];
	};
};

export type FullClassProgressionValue = string | number;

export type FullClassProgressionColumn = {
	key: string;
	label: string;
	prefix?: string;
	suffix?: string;
};

export type FullClassProgressionLevel = {
	level: number;
	proficiencyBonus: number;
	features?: string[];
	values?: Record<string, FullClassProgressionValue | undefined>;
};

export type FullClassProgression = {
	columns: FullClassProgressionColumn[];
	levels: FullClassProgressionLevel[];
};

export type FullClassFeature = {
	id?: string | number;
	name: string;
	level?: number;
	levelLabel?: string;
	source?: Pick<FullClassSource, "shortName" | "name">;
	html: string;
	optional?: boolean;
	archetypeFeature?: boolean;
};

export type FullClassViewModel = {
	id?: number;
	russianName: string;
	englishName: string;
	entityLink: string;
	dice: string;
	source: FullClassSource;
	isArchetype: boolean;
	parentClassUrl?: string;
	archetypeType?: FullClassArchetypeType;
	associatedUrl?: string;
	associatedContent?: FullClassHtmlContent;
	origin?: FullClassOrigin;
	archetypes?: FullClassArchetype[];
	images?: string[];
	progression?: FullClassProgression;
	proficiencies?: FullClassProficiencies;
	equipment?: FullClassHtmlContent;
	features?: FullClassFeature[];
};
