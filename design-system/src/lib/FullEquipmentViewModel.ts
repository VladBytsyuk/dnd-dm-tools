export type FullEquipmentSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullEquipmentHtmlContent = {
	html: string;
};

export type FullEquipmentEntityLink = {
	href: string;
	label: string;
};

export type FullEquipmentViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	source: FullEquipmentSource;
	categories: string[];
	price?: string;
	weight?: number;
	homebrew?: boolean;
	description?: FullEquipmentHtmlContent;
};
