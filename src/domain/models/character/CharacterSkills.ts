// Skill with base stat and proficiency level
export interface Skill {
	baseStat: "str" | "dex" | "con" | "int" | "wis" | "cha";
	name: string;
	isProf?: number; // 0 = none, 1 = proficient, 2 = expertise
}

// Character skills (18 D&D 5e skills)
export interface CharacterSkills {
	acrobatics: Skill;
	"animal handling": Skill;
	arcana: Skill;
	athletics: Skill;
	deception: Skill;
	history: Skill;
	insight: Skill;
	intimidation: Skill;
	investigation: Skill;
	medicine: Skill;
	nature: Skill;
	perception: Skill;
	performance: Skill;
	persuasion: Skill;
	religion: Skill;
	"sleight of hand": Skill;
	stealth: Skill;
	survival: Skill;
}
