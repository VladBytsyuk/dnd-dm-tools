// Character HP, AC, initiative, and related stats
export interface CharacterVitality {
	"hp-dice-current": { value: number };
	"hp-dice-multi": Record<string, unknown>;
	ac: { value: number };
	shield: { mod: number; value: boolean };
	speed: { value: number };
	initiative: { value: number };
	"hp-max": { value: number };
	"hp-max-bonus": { value: number };
	"hit-die": { value: string };
	isDying: boolean;
}
