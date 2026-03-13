// Ability score with modifier
export interface AbilityStat {
	name: string;
	score: number;
	modifier: number;
}

// Character ability scores
export interface CharacterStats {
	str: AbilityStat;
	dex: AbilityStat;
	con: AbilityStat;
	int: AbilityStat;
	wis: AbilityStat;
	cha: AbilityStat;
}

// Saving throw proficiency
export interface AbilitySave {
	name: string;
	isProf: boolean;
}

// Character saving throws
export interface CharacterSaves {
	str: AbilitySave;
	dex: AbilitySave;
	con: AbilitySave;
	int: AbilitySave;
	wis: AbilitySave;
	cha: AbilitySave;
}
