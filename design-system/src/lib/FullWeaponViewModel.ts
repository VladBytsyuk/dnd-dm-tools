export type FullWeaponSource = {
	shortName: string;
	name: string;
	group: {
		shortName: string;
		name: string;
	};
	homebrew?: boolean;
};

export type FullWeaponHtmlContent = {
	html: string;
};

export type FullWeaponProperty = {
	name: string;
	url?: string;
	distance?: string;
	description?: FullWeaponHtmlContent;
};

export type FullWeaponEntityLink = {
	href: string;
	label: string;
};

export type FullWeaponViewModel = {
	russianName: string;
	englishName: string;
	entityLink: string;
	weaponType: string;
	damage: string;
	price: string;
	weight: string;
	source: FullWeaponSource;
	properties: FullWeaponProperty[];
	description?: FullWeaponHtmlContent;
	special?: FullWeaponHtmlContent;
};
