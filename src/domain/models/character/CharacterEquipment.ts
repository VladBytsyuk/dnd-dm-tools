// Weapon entry in weaponsList
export interface WeaponItem {
	id: string;
	name: { value: string };
	mod: { value: string };
	dmg: { value: string };
	dmgType?: { value: string };  // Damage type (e.g., "колющий", "рубящий")
	isProf: boolean;
	modBonus: { value: number };
	abilityMod?: string;  // Ability for attack calculation: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | undefined
	notes: { value: string };
	notesVisibility: boolean;
}

// Attunement entry in attunementsList
export interface AttunementItem {
	id: string;
	checked: boolean;
	value: string;
}

// Character coins/currency
export interface CharacterCoins {
	gp: { value: number };
	sp: { value: number };
	cp: { value: number };
	pp: { value: number };
	ep: { value: number };
	total: { value: number };
}
