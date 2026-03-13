export interface CharacterProficiencyTextField {
	value: string;
}

export interface CharacterArmorProficiencies {
	light: boolean;
	medium: boolean;
	heavy: boolean;
	shield: boolean;
}

export interface CharacterProficiencies {
	armor: CharacterArmorProficiencies;
	weapons: CharacterProficiencyTextField;
	languages: CharacterProficiencyTextField;
	tools: CharacterProficiencyTextField;
	other: CharacterProficiencyTextField;
}

export function createEmptyCharacterProficiencies(): CharacterProficiencies {
	return {
		armor: {
			light: false,
			medium: false,
			heavy: false,
			shield: false,
		},
		weapons: { value: "" },
		languages: { value: "" },
		tools: { value: "" },
		other: { value: "" },
	};
}

