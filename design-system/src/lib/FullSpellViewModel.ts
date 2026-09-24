export type FullSpellSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullSpellComponents = {
	verbal?: boolean;
	somatic?: boolean;
	material?: string;
};

export type FullSpellClass = {
	name: string;
	url: string;
	parentClass?: string;
};

export type FullSpellHtmlContent = {
	html: string;
};

export type FullSpellEntityLink = {
	href: string;
	label: string;
};

export type FullSpellViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	level: number;
	school: string;
	additionalType?: string;
	components: FullSpellComponents;
	source: FullSpellSource;
	concentration?: boolean;
	ritual?: boolean;
	range: string;
	duration: string;
	time: string;
	classes?: FullSpellClass[];
	subclasses?: FullSpellClass[];
	description: FullSpellHtmlContent;
	higherLevels?: FullSpellHtmlContent;
};
